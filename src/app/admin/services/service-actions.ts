"use server";

import { getAdminPB } from "@/lib/pocketbase";
import { revalidatePath } from "next/cache";
import { ServiceRecord } from "./service-types";
import { cached, invalidateCache } from "@/lib/cache";

export async function getServices() {
  const pb = await getAdminPB();
  
  // Align with project's 15s cache pattern for admin listings
  return await cached("admin:services", 15 * 1000, async () => {
    const records = await pb.collection("services").getFullList<ServiceRecord>({
      sort: "-created",
    });
    
    // Map records using the official SDK helper
    return records.map(record => ({
      ...record,
      photo: record.photo ? pb.files.getUrl(record, record.photo) : undefined
    }));
  });
}

/**
 * Helper to prepare data for PocketBase.
 * Returns a plain object for simple fields and only uses FormData if a file is present.
 */
function prepareData(formData: FormData) {
  const data: Record<string, any> = {};
  let hasFile = false;

  formData.forEach((value, key) => {
    // Handle File (Photo)
    if (value instanceof File && value.size > 0) {
      hasFile = true;
      return;
    }
    if (key === "photo") return; // Ignore photo if it's not a file (string URL)

    // Handle Booleans
    if (key === "active") {
      data[key] = value === "true" || value === "1";
      return;
    }

    // Handle Numbers
    if (["price", "washes_count"].includes(key)) {
      const num = parseFloat(value as string);
      data[key] = isNaN(num) ? 0 : num;
      return;
    }

    // Handle JSON (Features)
    if (key.startsWith("features_")) {
      try {
        data[key] = JSON.parse(value as string);
      } catch (e) {
        data[key] = [];
      }
      return;
    }

    // Handle Strings
    if (typeof value === "string") {
      // CRITICAL: Do not send the 'photo' field if it's a URL string (existing photo)
      if (key === "photo") return;

      let val = value.trim();
      // Handle the case where the string "undefined" is passed
      if (val === "undefined" || val === "") {
        if (key === "category") val = "once";
        else return; // Skip other empty strings
      }
      
      data[key] = val;
    }
  });

  return data;
}

export async function createService(formData: FormData) {
  const pb = await getAdminPB();
  try {
    const data = prepareData(formData);
    
    // 1. Generate a manual ID (Required by your collection schema)
    const randomId = Math.random().toString(36).substring(2, 10) + 
                     Math.random().toString(36).substring(2, 9);
    data.id = randomId.substring(0, 15);

    // 2. Determine if we have a file to use multipart/form-data
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

    console.log("--- POCKETBASE CREATE ATTEMPT ---");
    console.log("Payload Keys:", Object.keys(data));

    const record = await pb.collection("services").create(payload);
    
    invalidateCache("admin:services");
    revalidatePath("/admin/services");
    
    return JSON.parse(JSON.stringify(record));
  } catch (err: any) {
    console.error("❌ POCKETBASE CREATE FAILED");
    console.error("Error Status:", err.status);
    console.error("Detailed Error Data:", JSON.stringify(err.data, null, 2));
    throw err;
  }
}

export async function updateService(id: string, formData: FormData) {
  const pb = await getAdminPB();
  try {
    const data = prepareData(formData);
    
    // Determine if we have a file to use multipart/form-data
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

    console.log(`--- POCKETBASE UPDATE ATTEMPT (${id}) ---`);
    const record = await pb.collection("services").update(id, payload);
    
    invalidateCache("admin:services");
    revalidatePath("/admin/services");
    return JSON.parse(JSON.stringify(record));
  } catch (err: any) {
    console.error("❌ POCKETBASE UPDATE FAILED");
    console.error("Response Data:", JSON.stringify(err.data, null, 2));
    throw err;
  }
}

export async function deleteService(id: string) {
  try {
    const pb = await getAdminPB();
    await pb.collection("services").delete(id);
    invalidateCache("admin:services");
    revalidatePath("/admin/services");
  } catch (err) {
    console.error("Delete Error:", err);
    throw err;
  }
}
