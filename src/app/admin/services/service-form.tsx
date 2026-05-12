"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Upload, X, Globe, Save, Loader2 } from "lucide-react";
import { serviceSchema, ServiceFormData, ServiceRecord } from "./service-types";
import { createService, updateService } from "./service-actions";

interface ServiceFormProps {
  initialData?: ServiceRecord;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ServiceForm({ initialData, onSuccess, onCancel }: ServiceFormProps) {
  const [activeTab, setActiveTab] = useState<"fr" | "ar" | "en">("en");
  const [preview, setPreview] = useState<string | null>(initialData?.photo || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialData || {
      title_fr: "",
      title_ar: "",
      title_en: "",
      price: 0,
      active: true,
      features_fr: [],
      features_ar: [],
      features_en: [],
    },
  });

  const featuresFr = useFieldArray({ control, name: "features_fr" as any });
  const featuresAr = useFieldArray({ control, name: "features_ar" as any });
  const featuresEn = useFieldArray({ control, name: "features_en" as any });

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
      formData.append("price", data.price.toString());
      formData.append("active", data.active.toString());
      formData.append("features_fr", JSON.stringify(data.features_fr));
      formData.append("features_ar", JSON.stringify(data.features_ar));
      formData.append("features_en", JSON.stringify(data.features_en));
      
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

  const renderFeatures = (fieldArray: any, lang: string) => (
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
        {fieldArray.fields.map((field: any, index: number) => (
          <div key={field.id} className="flex gap-2">
            <input
              {...register(`features_${lang}.${index}` as any)}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-blue transition-all"
              placeholder={`Feature in ${lang}...`}
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
          <p className="text-[10px] text-zinc-600 italic font-bold uppercase">No features added yet</p>
        )}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-900 shadow-2xl">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
          {initialData ? "Edit Service" : "Add New Service"}
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
            {lang === "en" ? "English" : lang === "fr" ? "French" : "Arabic"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Multilingual Title */}
        <div className={activeTab === "en" ? "block" : "hidden"}>
          <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Title (English)</label>
          <input
            {...register("title_en")}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-blue transition-all"
            placeholder="e.g. VIP Car Wash"
          />
          {errors.title_en && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-widest">{errors.title_en.message}</p>}
        </div>

        <div className={activeTab === "fr" ? "block" : "hidden"}>
          <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Title (French)</label>
          <input
            {...register("title_fr")}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-blue transition-all"
            placeholder="e.g. Lavage VIP"
          />
          {errors.title_fr && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-widest">{errors.title_fr.message}</p>}
        </div>

        <div className={activeTab === "ar" ? "block" : "hidden"}>
          <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Title (Arabic)</label>
          <input
            {...register("title_ar")}
            dir="rtl"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-blue transition-all text-right"
            placeholder="غسيل سيارات VIP"
          />
          {errors.title_ar && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-widest text-right">{errors.title_ar.message}</p>}
        </div>

        {/* Price and Status */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Price (DH)</label>
            <input
              type="number"
              {...register("price", { valueAsNumber: true })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-blue transition-all"
            />
            {errors.price && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-widest">{errors.price.message}</p>}
          </div>
          <div className="flex items-center gap-4 h-full pt-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register("active")} className="sr-only peer" />
              <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
              <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Active</span>
            </label>
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Service Photo</label>
          <div className="flex items-center gap-6">
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
              <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed">
                Upload a representative image for this service.<br/>
                Max size: 5MB. Formats: WebP, PNG, JPG.
              </p>
            </div>
          </div>
        </div>

        {/* JSON Features List */}
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

      {/* Form Actions */}
      <div className="flex gap-4 pt-4 border-t border-zinc-900">
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
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}
          {initialData ? "Update Service" : "Create Service"}
        </button>
      </div>
    </form>
  );
}
