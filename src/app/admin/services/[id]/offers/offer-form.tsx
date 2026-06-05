"use client";

import React, { useState } from "react";
import { useForm, useFieldArray, useWatch, UseFieldArrayReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Plus, Trash2, X, Save, Loader2, Upload } from "lucide-react";
import { serviceOfferSchema, ServiceOfferFormData, ServiceOfferRecord } from "../../service-types";
import { createServiceOffer, updateServiceOffer } from "../../service-actions";
import { useLanguage } from "@/context/LanguageContext";

interface OfferFormProps {
  serviceId: string;
  initialData?: ServiceOfferRecord;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function OfferForm({ serviceId, initialData, onSuccess, onCancel }: OfferFormProps) {
  const [activeTab, setActiveTab] = useState<"fr" | "ar" | "en">("en");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(initialData?.photo || "");
  const { language, dir } = useLanguage();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const {
    register,
    control,
    handleSubmit,
  } = useForm<ServiceOfferFormData>({
    resolver: zodResolver(serviceOfferSchema),
    defaultValues: {
      service: serviceId,
      title_fr: initialData?.title_fr || "",
      title_ar: initialData?.title_ar || "",
      title_en: initialData?.title_en || "",
      price: initialData?.price || 0,
      category: initialData?.category || "once",
      plan_type: initialData?.plan_type || "monthly",
      washes_count: initialData?.washes_count || 0,
      active: initialData?.active ?? true,
      features_fr: initialData?.features_fr || [],
      features_ar: initialData?.features_ar || [],
      features_en: initialData?.features_en || [],
    },
  });

  const isSub = useWatch({ control, name: "category" }) === "subscription";

  const featuresFr = useFieldArray({ control, name: "features_fr" });
  const featuresAr = useFieldArray({ control, name: "features_ar" });
  const featuresEn = useFieldArray({ control, name: "features_en" });

  const onSubmit = async (data: ServiceOfferFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("service", data.service);
      formData.append("title_fr", data.title_fr);
      formData.append("title_ar", data.title_ar);
      formData.append("title_en", data.title_en);
      formData.append("price", data.price.toString());
      formData.append("category", data.category);
      if (data.category === "subscription") {
        formData.append("plan_type", data.plan_type || "monthly");
      }
      formData.append("washes_count", (data.washes_count || 0).toString());
      formData.append("active", data.active.toString());
      formData.append("features_fr", JSON.stringify(data.features_fr));
      formData.append("features_ar", JSON.stringify(data.features_ar));
      formData.append("features_en", JSON.stringify(data.features_en));
      if (photo) {
        formData.append("photo", photo);
      }

      if (initialData?.id) {
        await updateServiceOffer(initialData.id, formData);
      } else {
        await createServiceOffer(formData);
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save offer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFeatures = (fieldArray: UseFieldArrayReturn<ServiceOfferFormData, "features_fr" | "features_ar" | "features_en">, lang: string) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase tracking-widest text-zinc-500">
          Features ({lang.toUpperCase()})
        </label>
        <button
          type="button"
          onClick={() => fieldArray.append("")}
          className="p-1.5 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 transition-all"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="space-y-2">
        {fieldArray.fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <input
              {...register(`features_${lang}.${index}` as `features_fr.${number}`)}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              className={`flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-blue transition-all ${lang === 'ar' ? 'text-right' : 'text-left'}`}
              placeholder="Feature details..."
            />
            <button
              type="button"
              onClick={() => fieldArray.remove(index)}
              className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {fieldArray.fields.length === 0 && (
          <p className="text-[10px] text-zinc-600 italic font-bold uppercase">No features added</p>
        )}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-900 shadow-2xl">
      <div className={`flex items-center justify-between mb-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
        <h2 className={`text-2xl font-black uppercase italic tracking-tighter text-white ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
          {initialData ? "Edit Offer" : "Add Offer"}
        </h2>
        <button type="button" onClick={onCancel} className="p-2 text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex p-1 bg-zinc-900 rounded-2xl w-fit">
        {(["en", "fr", "ar"] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setActiveTab(lang)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === lang ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {lang === "en" ? "English" : lang === "fr" ? "Français" : "العربية"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className={activeTab === "en" ? "block" : "hidden"}>
          <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Offer Name (EN)</label>
          <input
            {...register("title_en")}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-blue transition-all"
            placeholder="e.g. Standard Wash"
          />
        </div>

        <div className={activeTab === "fr" ? "block" : "hidden"}>
          <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Offer Name (FR)</label>
          <input
            {...register("title_fr")}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-blue transition-all"
            placeholder="e.g. Lavage Standard"
          />
        </div>

        <div className={activeTab === "ar" ? "block" : "hidden"}>
          <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 text-right">Offer Name (AR)</label>
          <input
            {...register("title_ar")}
            dir="rtl"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-blue transition-all text-right"
            placeholder="غسيل عادي"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`space-y-2 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
            <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Price (DH)</label>
            <input 
              type="number"
              {...register("price", { valueAsNumber: true })}
              dir="ltr"
              className={`w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-blue transition-all ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
            />
          </div>

          <div className={`space-y-2 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
            <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Type</label>
            <select 
              {...register("category")}
              className={`w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-blue transition-all appearance-none ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
            >
              <option value="once">One-Time Offer</option>
              <option value="subscription">Subscription</option>
            </select>
          </div>
        </div>

        {isSub && (
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-brand-blue/5 border border-brand-blue/20 rounded-[2rem] ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-brand-blue">Plan Interval</label>
              <select 
                {...register("plan_type")}
                className={`w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-blue transition-all appearance-none ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-brand-blue">Washes Included</label>
              <input 
                type="number"
                {...register("washes_count", { valueAsNumber: true })}
                dir="ltr"
                className={`w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-blue transition-all ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                placeholder="e.g. 4 for monthly"
              />
            </div>
          </div>
        )}

        <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <label className="relative inline-flex items-center cursor-pointer group">
            <input type="checkbox" {...register("active")} className="sr-only peer" />
            <div className={`w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer 
              ${dir === 'rtl' 
                ? 'peer-checked:after:-translate-x-full peer-checked:after:border-white after:right-[2px]' 
                : 'peer-checked:after:translate-x-full peer-checked:after:border-white after:left-[2px]'
              } 
              after:content-[''] after:absolute after:top-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue`}></div>
            <span className={`text-[10px] font-black uppercase tracking-widest text-zinc-400 ${dir === 'rtl' ? 'mr-3' : 'ml-3'}`}>Active</span>
          </label>
        </div>

        {/* Photo Upload */}
        <div>
          <label className={`block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>Offer Image (Optional)</label>
          <div className={`flex items-center gap-6 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden group relative">
              {preview ? (
                <Image src={preview} alt="Preview" fill className="object-cover" />
              ) : (
                <Upload className="text-zinc-700 group-hover:text-brand-blue transition-colors" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <p className={`text-[10px] text-zinc-500 font-bold uppercase leading-relaxed ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                {language === 'fr' ? "Téléchargez une image pour cette offre." : language === 'ar' ? "قم بتحميل صورة لهذا العرض." : "Upload an image for this offer."}<br/>
                Max size: 5MB. Formats: WebP, PNG, JPG.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800/50">
          <div className={activeTab === "en" ? "block" : "hidden"}>
            {renderFeatures(featuresEn, "en")}
          </div>
          <div className={activeTab === "fr" ? "block" : "hidden"}>
            {renderFeatures(featuresFr, "fr")}
          </div>
          <div className={activeTab === "ar" ? "block" : "hidden"}>
            {renderFeatures(featuresAr, "ar")}
          </div>
        </div>
      </div>

      <div className={`flex gap-4 pt-4 border-t border-zinc-900 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 px-6 rounded-2xl bg-zinc-900 text-zinc-400 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 hover:text-white transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-[2] py-4 px-6 rounded-2xl bg-brand-blue text-white font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Save Offer
        </button>
      </div>
    </form>
  );
}
