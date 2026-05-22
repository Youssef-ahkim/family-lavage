"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Upload, X, Globe, Save, Loader2 } from "lucide-react";
import { serviceSchema, ServiceFormData, ServiceRecord } from "./service-types";
import { createService, updateService } from "./service-actions";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

interface ServiceFormProps {
  initialData?: ServiceRecord;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ServiceForm({ initialData, onSuccess, onCancel }: ServiceFormProps) {
  const [activeTab, setActiveTab] = useState<"fr" | "ar" | "en">("en");
  const [preview, setPreview] = useState<string | null>(initialData?.photo || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { language, dir } = useLanguage();
  const t = translations[language];
  const sTrans = t.admin.services;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title_fr: initialData?.title_fr || "",
      title_ar: initialData?.title_ar || "",
      title_en: initialData?.title_en || "",
      description_fr: initialData?.description_fr || "",
      description_ar: initialData?.description_ar || "",
      description_en: initialData?.description_en || "",
      active: initialData?.active ?? true,
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("photo", file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title_fr", data.title_fr);
      formData.append("title_ar", data.title_ar);
      formData.append("title_en", data.title_en);
      formData.append("description_fr", data.description_fr || "");
      formData.append("description_ar", data.description_ar || "");
      formData.append("description_en", data.description_en || "");
      formData.append("active", data.active.toString());
      
      if (data.photo instanceof File) {
        formData.append("photo", data.photo);
      }

      if (initialData?.id) {
        await updateService(initialData.id, formData);
      } else {
        await createService(formData);
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save service:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-900 shadow-2xl">
      <div className={`flex items-center justify-between mb-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
        <h2 className={`text-2xl font-black uppercase italic tracking-tighter text-white ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
          {initialData ? sTrans.edit : sTrans.add}
        </h2>
        <button type="button" onClick={onCancel} className="p-2 text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Tabs for Languages */}
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
        {/* EN fields */}
        <div className={activeTab === "en" ? "block space-y-4" : "hidden"}>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">{sTrans.formTitleEn}</label>
            <input
              {...register("title_en")}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-blue transition-all"
              placeholder="e.g. VIP Car Wash"
            />
            {errors.title_en && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-widest">{errors.title_en.message}</p>}
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Description (EN)</label>
            <textarea
              {...register("description_en")}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-blue transition-all resize-none h-24"
              placeholder="Short description..."
            />
          </div>
        </div>

        {/* FR fields */}
        <div className={activeTab === "fr" ? "block space-y-4" : "hidden"}>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">{sTrans.formTitleFr}</label>
            <input
              {...register("title_fr")}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-blue transition-all"
              placeholder="e.g. Lavage VIP"
            />
            {errors.title_fr && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-widest">{errors.title_fr.message}</p>}
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Description (FR)</label>
            <textarea
              {...register("description_fr")}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-blue transition-all resize-none h-24"
              placeholder="Courte description..."
            />
          </div>
        </div>

        {/* AR fields */}
        <div className={activeTab === "ar" ? "block space-y-4" : "hidden"}>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 text-right">{sTrans.formTitleAr}</label>
            <input
              {...register("title_ar")}
              dir="rtl"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-blue transition-all text-right"
              placeholder="غسيل سيارات VIP"
            />
            {errors.title_ar && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-widest text-right">{errors.title_ar.message}</p>}
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 text-right">Description (AR)</label>
            <textarea
              {...register("description_ar")}
              dir="rtl"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-blue transition-all text-right resize-none h-24"
              placeholder="وصف قصير..."
            />
          </div>
        </div>

        {/* Active Status */}
        <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <label className="relative inline-flex items-center cursor-pointer group">
            <input type="checkbox" {...register("active")} className="sr-only peer" />
            <div className={`w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer 
              ${dir === 'rtl' 
                ? 'peer-checked:after:-translate-x-full peer-checked:after:border-white after:right-[2px]' 
                : 'peer-checked:after:translate-x-full peer-checked:after:border-white after:left-[2px]'
              } 
              after:content-[''] after:absolute after:top-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue`}></div>
            <span className={`text-[10px] font-black uppercase tracking-widest text-zinc-400 ${dir === 'rtl' ? 'mr-3' : 'ml-3'}`}>{sTrans.formActive}</span>
          </label>
        </div>

        {/* Photo Upload */}
        <div>
          <label className={`block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{sTrans.formPhoto}</label>
          <div className={`flex items-center gap-6 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden group relative">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
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
                {language === 'fr' ? "Téléchargez une image représentative de ce service." : language === 'ar' ? "قم بتحميل صورة تمثل هذه الخدمة." : "Upload a representative image for this service."}<br/>
                Max size: 5MB. Formats: WebP, PNG, JPG.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className={`flex gap-4 pt-4 border-t border-zinc-900 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 px-6 rounded-2xl bg-zinc-900 text-zinc-400 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 hover:text-white transition-all"
        >
          {sTrans.cancel}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-[2] py-4 px-6 rounded-2xl bg-brand-blue text-white font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}
          {initialData ? sTrans.save : sTrans.save}
        </button>
      </div>
    </form>
  );
}
