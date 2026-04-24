"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Car, Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  const isBookingPage = pathname === "/booking";
  
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
    { name: t.services, href: "/#services" },
    { name: t.process, href: "/#process" },
    { name: t.pricing, href: "/#subscriptions" },
    { name: t.contact, href: "/#contact" },
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

            {!isBookingPage && (
              <Link href="/booking">
                <button className="px-6 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-lg hover:bg-brand-blue/90 transition-all active:scale-95 shadow-lg shadow-brand-blue/20">
                  {t.book}
                </button>
              </Link>
            )}
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
      <div
        className={`fixed inset-0 z-50 bg-white transition-all duration-500 md:hidden ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex justify-between items-center px-4 py-6 border-b border-zinc-100">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
              <div className="p-2 bg-brand-blue rounded-lg">
                <Car className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-black tracking-tighter italic">
                FAMILY <span className="text-brand-blue">LAVAGE</span>
              </span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-zinc-600 hover:text-zinc-950 bg-zinc-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Menu Links */}
          <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
            {navLinks.map((link, i) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-3xl font-black uppercase italic tracking-tighter transition-all duration-300 hover:text-brand-blue ${isMobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Footer */}
          <div className="p-8 border-t border-zinc-100">
            {!isBookingPage && (
              <Link href="/booking" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full py-5 bg-brand-blue text-white font-black uppercase tracking-[0.2em] text-sm rounded-2xl shadow-xl shadow-brand-blue/20 active:scale-95 transition-all">
                  {t.book}
                </button>
              </Link>
            )}
            <div className="mt-8 flex justify-center gap-4">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-4 py-2 text-xs font-black rounded-lg border transition-all ${language === lang.code
                    ? "bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/20"
                    : "border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:text-zinc-900"
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
