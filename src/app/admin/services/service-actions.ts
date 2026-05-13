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
 * Helper to prepare FormData for PocketBase SDK.
 * Ensures numbers and booleans are in a format PB likes when sent via multipart.
 */
function preparePBFormData(formData: FormData) {
  const clean = new FormData();
  formData.forEach((value, key) => {
    // If it's a file, keep it
    if (value instanceof File || (value && typeof value === 'object' && 'size' in value)) {
      if ((value as any).size > 0) clean.append(key, value as any);
      return;
    }

    // Numbers and Booleans should be sent as strings, but we ensure they are valid
    if (key === "price") {
      const num = parseFloat(value as string);
      if (!isNaN(num)) clean.append(key, num.toString());
      return;
    }

    if (key === "active") {
      clean.append(key, (value === "true" || value === "1") ? "true" : "false");
      return;
    }

    // Strings and JSON should be sent as is (JSON is already stringified in the form)
    if (typeof value === "string" && value.trim() !== "") {
      clean.append(key, value);
    }
  });
  return clean;
}

export async function createService(formData: FormData) {
  const pb = await getAdminPB();
  try {
    const cleanData = preparePBFormData(formData);
    
    // The collection schema shows 'id' is required with no autogeneratePattern.
    // We must provide a unique ID matching ^[a-z0-9]+$ (15 chars is standard PB length).
    const randomId = Math.random().toString(36).substring(2, 10) + 
                     Math.random().toString(36).substring(2, 9);
    cleanData.append("id", randomId);

    // Pass the FormData directly to the SDK
    const record = await pb.collection("services").create(cleanData);
    
    invalidateCache("admin:services");
    revalidatePath("/admin/services");
    
    return JSON.parse(JSON.stringify(record));
  } catch (err: any) {
    console.error("PocketBase Create Error:", {
      message: err.message,
      data: err.data,
      status: err.status,
      response: err.response
    });
    throw err;
  }
}

export async function updateService(id: string, formData: FormData) {
  const pb = await getAdminPB();
  try {
    const cleanData = preparePBFormData(formData);
    const record = await pb.collection("services").update(id, cleanData);
    
    invalidateCache("admin:services");
    revalidatePath("/admin/services");
    return JSON.parse(JSON.stringify(record));
  } catch (err: any) {
    console.error("PocketBase Update Error:", {
      message: err.message,
      data: err.data,
      status: err.status,
      response: err.response
    });
    throw err;
  }
}

export async function deleteService(id: string) {
  const pb = await getAdminPB();
  await pb.collection("services").delete(id);
  
  // Invalidate services cache
  invalidateCache("admin:services");
  revalidatePath("/admin/services");
}
