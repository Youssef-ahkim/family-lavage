import { z } from "zod";

// Parent Service (e.g. Car Washing)
export const serviceSchema = z.object({
  title_fr: z.string().min(1, "Required"),
  title_ar: z.string().min(1, "Required"),
  title_en: z.string().min(1, "Required"),
  description_fr: z.string().optional(),
  description_ar: z.string().optional(),
  description_en: z.string().optional(),
  active: z.boolean(),
  photo: z.any().optional(), // Handled separately for upload
  gallery: z.any().optional(), // Multiple images for carousel
  parent_service: z.string().optional(),
  price: z.number().optional().nullable(),
  booking_type: z.enum(["has_children", "has_offers", "direct"]).default("has_offers"),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

export interface ServiceRecord extends Omit<ServiceFormData, 'photo' | 'gallery'> {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  photo?: string; // URL string from PB
  gallery?: string[]; // Array of URL strings from PB
}

// Child Offer (e.g. 100dh wash, 500dh subscription)
export const serviceOfferSchema = z.object({
  service: z.string().min(1, "Required"), // Parent service ID
  title_fr: z.string().min(1, "Required"),
  title_ar: z.string().min(1, "Required"),
  title_en: z.string().min(1, "Required"),
  price: z.number().min(0, "Price must be positive"),
  category: z.enum(["once", "subscription"]),
  plan_type: z.enum(["monthly", "yearly"]).optional().nullable(),
  washes_count: z.number().optional().nullable(),
  active: z.boolean(),
  features_fr: z.array(z.string()),
  features_ar: z.array(z.string()),
  features_en: z.array(z.string()),
  photo: z.any().optional(),
});

export type ServiceOfferFormData = z.infer<typeof serviceOfferSchema>;

export interface ServiceOfferRecord extends ServiceOfferFormData {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  category: "once" | "subscription";
  photo?: string;
}
