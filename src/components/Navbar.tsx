"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Car, Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

const Navbar = () => {
  const { language, setLanguage, dir } = useLanguage();
  const t = translations[language].nav;
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t.services, href: "#services" },
    { name: t.process, href: "#process" },
    { name: t.pricing, href: "#subscriptions" },
    { name: t.contact, href: "#contact" },
  ];

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  const languages = [
    { code: "fr", label: "FR" },
    { code: "en", label: "EN" },
    { code: "ar", label: "AR" },
  ] as const;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? "py-3 glass-light shadow-lg shadow-zinc-200/20"
        : "py-6 bg-white/40 backdrop-blur-sm"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-brand-blue rounded-lg transform group-hover:rotate-12 transition-transform">
              <Car className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter italic">
              FAMILY <span className="text-brand-blue">LAVAGE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-zinc-600 hover:text-brand-blue transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="h-4 w-px bg-zinc-200" />

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-zinc-100/50 p-1 rounded-lg border border-zinc-200/50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2 py-1 text-[10px] font-black rounded-md transition-all ${language === lang.code
                    ? "bg-white text-brand-blue shadow-sm"
                    : "text-zinc-400 hover:text-zinc-600"
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <Link href="/booking">
              <button className="px-6 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-lg hover:bg-brand-blue/90 transition-all active:scale-95 shadow-lg shadow-brand-blue/20">
                {t.book}
              </button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <div className="flex items-center gap-1 bg-zinc-100/50 p-1 rounded-lg border border-zinc-200/50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2 py-1 text-[10px] font-black rounded-md transition-all ${language === lang.code
                    ? "bg-white text-brand-blue shadow-sm"
                    : "text-zinc-400 hover:text-zinc-600"
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-zinc-600 hover:text-zinc-950"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <div className="md:hidden absolute top-full left-0 right-0 glass-light border-t border-zinc-200 animate-in slide-in-from-top duration-300">
            <div className="px-4 py-12 flex flex-col gap-6 items-center text-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xl font-bold text-zinc-800 hover:text-brand-blue"
                >
                  {link.name}
                </Link>
              ))}
              <Link href="/booking" className="w-full max-w-xs" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full py-4 bg-brand-blue text-white font-bold rounded-xl shadow-lg shadow-brand-blue/20">
                  {t.book}
                </button>
              </Link>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
