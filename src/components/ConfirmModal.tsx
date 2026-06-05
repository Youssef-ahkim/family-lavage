"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = "warning",
  isLoading = false,
}: ConfirmModalProps) {
  const { language, dir } = useLanguage();
  const t = translations[language];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const colors = {
    danger: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-brand-blue",
  };

  const btnColors = {
    danger: "bg-red-500 hover:bg-red-600 shadow-red-500/20",
    warning: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
    info: "bg-brand-blue hover:bg-brand-blue/90 shadow-brand-blue/20",
  };

  const modalContent = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className={`relative bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl reveal overflow-hidden ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
        {/* Decor */}
        <div className={`absolute top-0 ${dir === 'rtl' ? 'left-0' : 'right-0'} w-32 h-32 ${colors[variant]}/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2`} />
        
        <button 
          onClick={onClose}
          className={`absolute top-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} p-2 rounded-xl hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`flex items-center gap-4 mb-6 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <div className={`w-12 h-12 ${colors[variant]}/10 rounded-2xl flex items-center justify-center shrink-0`}>
            <AlertCircle className={`w-6 h-6 ${variant === 'danger' ? 'text-red-500' : variant === 'warning' ? 'text-amber-500' : 'text-brand-blue'}`} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tight text-white leading-none mb-1">{title}</h3>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Confirmation Required</p>
          </div>
        </div>

        <p className="text-zinc-400 font-medium mb-8 leading-relaxed">
          {message}
        </p>

        <div className={`flex flex-col sm:flex-row gap-3 ${dir === 'rtl' ? 'sm:flex-row-reverse' : ''}`}>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-4 rounded-2xl text-white font-black uppercase italic tracking-widest text-xs transition-all shadow-lg disabled:opacity-50 ${btnColors[variant]}`}
          >
            {isLoading ? (
               <div className="flex items-center justify-center gap-2">
                 <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 <span>Processing...</span>
               </div>
            ) : (confirmText || t.admin?.confirmBtn || "Confirm")}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-black uppercase italic tracking-widest text-xs transition-all disabled:opacity-50"
          >
            {cancelText || t.admin?.cancelBtn || "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

