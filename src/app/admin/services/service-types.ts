import { z } from "zod";

export const serviceSchema = z.object({
  title_fr: z.string().min(1, "Required"),
  title_ar: z.string().min(1, "Required"),
  title_en: z.string().min(1, "Required"),
  price: z.number().min(0, "Price must be positive"),
  category: z.enum(["once", "subscription"]),
  plan_type: z.enum(["monthly", "yearly"]).optional(),
  washes_count: z.number().optional(),
  active: z.boolean(),
  features_fr: z.array(z.string()),
  features_ar: z.array(z.string()),
  features_en: z.array(z.string()),
  photo: z.any().optional(), // Handled separately for upload
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

export interface ServiceRecord extends ServiceFormData {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  photo?: string; // URL string from PB
  category: "once" | "subscription";
  washes_count?: number;
  duration_days?: number;
}
