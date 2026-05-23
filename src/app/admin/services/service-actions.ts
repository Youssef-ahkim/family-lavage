"use server";

import { getAdminPB } from "@/lib/pocketbase";
import { revalidatePath } from "next/cache";
import { ServiceRecord, ServiceOfferRecord } from "./service-types";
import { cached, invalidateCache } from "@/lib/cache";

// ==========================================
// PARENT SERVICES
// ==========================================

export async function getServices() {
  const pb = await getAdminPB();
  
  return await cached("admin:services", 15 * 1000, async () => {
    const records = await pb.collection("services").getFullList<ServiceRecord>({
      sort: "-created",
    });
    
    return records.map(record => ({
      ...record,
      photo: record.photo ? `/api/files/${record.collectionId}/${record.id}/${record.photo}` : undefined
    }));
  });
}

function prepareServiceData(formData: FormData) {
  const data: Record<string, any> = {};

  formData.forEach((value, key) => {
    if (value instanceof File && value.size > 0) return;
    if (key === "photo") return;

    if (key === "active") {
      data[key] = value === "true" || value === "1";
      return;
    }

    if (typeof value === "string") {
      let val = value.trim();
      if (val === "undefined" || val === "") return;
      data[key] = val;
    }
  });

  return data;
}

export async function createService(formData: FormData) {
  const pb = await getAdminPB();
  try {
    const data = prepareServiceData(formData);
    
    const randomId = Math.random().toString(36).substring(2, 10) + 
                     Math.random().toString(36).substring(2, 9);
    data.id = randomId.substring(0, 15);

    const photo = formData.get("photo");
    let payload: any = data;
    
    if (photo instanceof File && photo.size > 0) {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (typeof v === 'object') fd.append(k, JSON.stringify(v));
        else fd.append(k, v.toString());
      });
      fd.append("photo", photo);
      payload = fd;
    }

    const record = await pb.collection("services").create(payload);
    
    invalidateCache("admin:services");
    revalidatePath("/admin/services");
    revalidatePath("/");
    
    return JSON.parse(JSON.stringify(record));
  } catch (err: any) {
    console.error("❌ POCKETBASE CREATE FAILED", err);
    throw err;
  }
}

export async function updateService(id: string, formData: FormData) {
  const pb = await getAdminPB();
  try {
    const data = prepareServiceData(formData);
    const photo = formData.get("photo");
    let payload: any = data;
    
    if (photo instanceof File && photo.size > 0) {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (typeof v === 'object') fd.append(k, JSON.stringify(v));
        else fd.append(k, v.toString());
      });
      fd.append("photo", photo);
      payload = fd;
    }

    const record = await pb.collection("services").update(id, payload);
    
    invalidateCache("admin:services");
    revalidatePath("/admin/services");
    revalidatePath("/");
    
    return JSON.parse(JSON.stringify(record));
  } catch (err: any) {
    console.error("❌ POCKETBASE UPDATE FAILED", err);
    throw err;
  }
}

export async function deleteService(id: string) {
  try {
    const pb = await getAdminPB();
    await pb.collection("services").delete(id);
    invalidateCache("admin:services");
    revalidatePath("/admin/services");
    revalidatePath("/");
  } catch (err) {
    console.error("Delete Error:", err);
    throw err;
  }
}

// ==========================================
// SERVICE OFFERS
// ==========================================

export async function getServiceOffers(serviceId?: string) {
  const pb = await getAdminPB();
  
  const cacheKey = serviceId ? `admin:offers:${serviceId}` : "admin:offers:all";
  
  return await cached(cacheKey, 15 * 1000, async () => {
    const filter = serviceId ? `service = "${serviceId}"` : "";
    
    const records = await pb.collection("service_offers").getFullList<ServiceOfferRecord>({
      sort: "-created",
      filter: filter,
    });
    
    return records.map(record => ({
      ...record,
      photo: record.photo ? `/api/files/${record.collectionId}/${record.id}/${record.photo}` : undefined
    }));
  });
}

function prepareOfferData(formData: FormData) {
  const data: Record<string, any> = {};

  formData.forEach((value, key) => {
    if (value instanceof File && value.size > 0) return;
    if (key === "photo") return;

    if (key === "active") {
      data[key] = value === "true" || value === "1";
      return;
    }

    if (["price", "washes_count"].includes(key)) {
      const num = parseFloat(value as string);
      data[key] = isNaN(num) ? 0 : num;
      return;
    }

    if (key.startsWith("features_")) {
      try {
        data[key] = JSON.parse(value as string);
      } catch (e) {
        data[key] = [];
      }
      return;
    }

    if (typeof value === "string") {
      let val = value.trim();
      if (val === "undefined" || val === "") {
        if (key === "category") val = "once";
        else return; 
      }
      data[key] = val;
    }
  });

  return data;
}

export async function createServiceOffer(formData: FormData) {
  const pb = await getAdminPB();
  try {
    const data = prepareOfferData(formData);
    
    const randomId = Math.random().toString(36).substring(2, 10) + 
                     Math.random().toString(36).substring(2, 9);
    data.id = randomId.substring(0, 15);

    const photo = formData.get("photo");
    let payload: any = data;
    
    if (photo && photo instanceof File && photo.size > 0) {
      const formPayload = new FormData();
      Object.keys(data).forEach(key => formPayload.append(key, data[key]));
      formPayload.append("photo", photo);
      payload = formPayload;
    }

    const record = await pb.collection("service_offers").create(payload);
    
    if (data.service) invalidateCache(`admin:offers:${data.service}`);
    invalidateCache("admin:offers:all");
    revalidatePath(`/admin/services/${data.service}/offers`);
    
    return JSON.parse(JSON.stringify(record));
  } catch (err: any) {
    console.error("❌ POCKETBASE CREATE OFFER FAILED", err);
    throw err;
  }
}

export async function updateServiceOffer(id: string, formData: FormData) {
  const pb = await getAdminPB();
  try {
    const data = prepareOfferData(formData);
    
    const photo = formData.get("photo");
    let payload: any = data;
    
    if (photo && photo instanceof File && photo.size > 0) {
      const formPayload = new FormData();
      Object.keys(data).forEach(key => {
        const val = data[key];
        if (Array.isArray(val)) {
          formPayload.append(key, JSON.stringify(val));
        } else {
          formPayload.append(key, val);
        }
      });
      formPayload.append("photo", photo);
      payload = formPayload;
    }

    const record = await pb.collection("service_offers").update(id, payload);
    
    if (data.service) invalidateCache(`admin:offers:${data.service}`);
    invalidateCache("admin:offers:all");
    revalidatePath(`/admin/services/${data.service}/offers`);
    
    return JSON.parse(JSON.stringify(record));
  } catch (err: any) {
    console.error("❌ POCKETBASE UPDATE OFFER FAILED", err);
    throw err;
  }
}

export async function deleteServiceOffer(id: string, serviceId: string) {
  try {
    const pb = await getAdminPB();
    await pb.collection("service_offers").delete(id);
    
    invalidateCache(`admin:offers:${serviceId}`);
    invalidateCache("admin:offers:all");
    revalidatePath(`/admin/services/${serviceId}/offers`);
  } catch (err) {
    console.error("Delete Offer Error:", err);
    throw err;
  }
}
