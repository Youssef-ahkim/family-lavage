"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, User, LogOut, Shield } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useProfile } from "@/context/ProfileContext";
import { translations } from "@/lib/translations";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { getCookie } from "@/lib/cookies";

const Navbar = () => {
  const pathname = usePathname();
  const isBookingPage = pathname === "/booking";

  const { language, setLanguage } = useLanguage();
  const t = translations[language].nav;

  const { profile: userProfile, isLoading: isLoadingProfile, fetchProfile, clearProfile } = useProfile();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loggedIn = getCookie('pb_logged_in') === 'true';
    
    const timer = setTimeout(() => {
      setMounted(true);
      setIsAuthenticated(loggedIn);
    }, 0);

    // Use shared ProfileContext — cached across navigations
    if (loggedIn) {
      fetchProfile();
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [fetchProfile]);

  const navLinks = [
    { name: t.services, href: "/services" },
    { name: t.pricing, href: "/subscribe" },
    ...(!isAuthenticated ? [{ name: t.myBookings, href: "/my-bookings" }] : []),
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
        ? "py-3 glass-light"
        : "py-5 bg-white/60 backdrop-blur-lg"
        }`}
    >
      {/* Subtle bottom gradient line when scrolled */}
      {isScrolled && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-blue/15 to-transparent" />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo4.png"
              alt="Family Lavage"
              width={1481}
              height={720}
              className="h-10 sm:h-12 lg:h-14 xl:h-16 w-auto max-w-[180px] sm:max-w-[200px] lg:max-w-[220px] xl:max-w-[250px] object-contain group-hover:brightness-110 transition-all"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <div className="flex items-center gap-4 xl:gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs xl:text-sm font-medium transition-colors whitespace-nowrap relative group/link ${
                    pathname === link.href
                      ? 'text-brand-blue'
                      : 'text-zinc-600 hover:text-brand-blue'
                  }`}
                >
                  {link.name}
                  {/* Active/hover indicator dot */}
                  <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-blue transition-all ${
                    pathname === link.href ? 'opacity-100 scale-100' : 'opacity-0 scale-0 group-hover/link:opacity-100 group-hover/link:scale-100'
                  }`} />
                </Link>
              ))}
            </div>

            <div className="h-4 w-px bg-zinc-200/80" />

            {/* Language Switcher */}
            <div className="flex items-center gap-0.5 bg-zinc-100/60 p-1 rounded-xl border border-zinc-200/40">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2.5 py-1.5 text-[10px] font-black rounded-lg transition-all duration-200 ${language === lang.code
                    ? "bg-white text-brand-blue shadow-sm ring-1 ring-zinc-200/50"
                    : "text-zinc-400 hover:text-zinc-600"
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {!isBookingPage && (
              <div className="flex items-center gap-3">
                <Link href="/booking">
                  <button className="px-6 py-2.5 bg-brand-blue text-white text-xs xl:text-sm font-bold rounded-xl hover:bg-brand-blue/90 transition-all active:scale-95 shadow-lg shadow-brand-blue/20 relative overflow-hidden group/btn">
                    <span className="relative z-10">{t.book}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                  </button>
                </Link>
              </div>
            )}

            <div className="h-4 w-px bg-zinc-200/80" />

            {!mounted ? (
              <div className="h-9 w-24 bg-zinc-100 animate-pulse rounded-full" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-4">
                {userProfile?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="p-2 text-zinc-400 hover:text-brand-blue transition-colors rounded-lg hover:bg-brand-blue/5"
                    title="Admin Dashboard"
                  >
                    <Shield size={20} />
                  </Link>
                )}

                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/5 text-brand-blue hover:bg-brand-blue/10 transition-all border border-brand-blue/10"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-blue to-blue-600 text-white flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <span className={`text-sm font-bold truncate max-w-[100px] ${isLoadingProfile ? 'w-12 h-3 bg-brand-blue/20 animate-pulse rounded' : ''}`}>
                    {!isLoadingProfile ? (userProfile?.name?.split(' ')[0] || t.profile) : ''}
                  </span>
                </Link>

                <button
                  onClick={async () => {
                    setIsAuthenticated(false);
                    clearProfile();
                    document.cookie = "pb_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    await logout();
                  }}
                  className="p-2 text-zinc-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                  title={t.logout}
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/auth/login" className="text-sm font-medium text-zinc-600 hover:text-brand-blue transition-colors">
                  {t.login}
                </Link>
                <Link href="/auth/signup" className="text-sm font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-4 py-2 rounded-xl transition-colors">
                  {t.signup}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-4">
            <div className="flex items-center gap-0.5 bg-zinc-100/60 p-1 rounded-xl border border-zinc-200/40">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2 py-1 text-[10px] font-black rounded-lg transition-all ${language === lang.code
                    ? "bg-white text-brand-blue shadow-sm ring-1 ring-zinc-200/50"
                    : "text-zinc-400 hover:text-zinc-600"
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-zinc-600 hover:text-zinc-950 transition-colors"
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
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-zinc-200/50 animate-in slide-in-from-top duration-300 shadow-2xl shadow-zinc-200/30">
            <div className="px-4 py-12 flex flex-col gap-6 items-center text-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-xl font-bold ${pathname === link.href ? 'text-brand-blue' : 'text-zinc-800 hover:text-brand-blue'} transition-colors`}
                >
                  {link.name}
                </Link>
              ))}
              {!isBookingPage && (
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <Link href="/booking" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full py-4 bg-brand-blue text-white font-bold rounded-2xl shadow-lg shadow-brand-blue/20">
                      {t.book}
                    </button>
                  </Link>
                </div>
              )}

              {!mounted ? (
                <div className="h-12 w-full max-w-xs bg-zinc-100 animate-pulse rounded-xl" />
              ) : isAuthenticated ? (
                <div className="flex flex-col gap-4 w-full items-center">
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-zinc-50 border border-zinc-100 w-full max-w-xs justify-center"
                  >
                    <User size={20} className="text-brand-blue" />
                    <span className={`text-lg font-bold text-zinc-800 ${isLoadingProfile ? 'w-24 h-4 bg-zinc-200 animate-pulse rounded' : ''}`}>
                      {!isLoadingProfile ? (userProfile?.name || t.profile) : ''}
                    </span>
                  </Link>
                  {userProfile?.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-zinc-50 border border-zinc-100 w-full max-w-xs justify-center"
                    >
                      <Shield size={20} className="text-brand-blue" />
                      <span className="text-lg font-bold text-zinc-800">Admin</span>
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      setIsAuthenticated(false);
                      clearProfile();
                      document.cookie = "pb_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      await logout();
                    }}
                    className="flex items-center gap-2 text-xl font-bold text-red-500 hover:text-red-600 mt-2"
                  >
                    <LogOut size={22} />
                    {t.logout}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 mt-4 w-full max-w-xs">
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full py-4 bg-zinc-50 text-zinc-800 font-bold rounded-2xl hover:bg-zinc-100 border border-zinc-100">
                      {t.login}
                    </button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full py-4 bg-zinc-100 text-zinc-900 font-bold rounded-2xl hover:bg-zinc-200">
                      {t.signup}
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;