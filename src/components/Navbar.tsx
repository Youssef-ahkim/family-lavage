"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Car } from "lucide-react";

const Navbar = () => {
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
    { name: "Services", href: "#services" },
    { name: "Schedules", href: "#process" },
    { name: "Pricing", href: "#subscriptions" },
    { name: "Contact", href: "#contact" },
  ];

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? "py-4 glass-dark shadow-2xl shadow-black/50"
          : "py-8 bg-transparent"
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
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-300 hover:text-brand-blue transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <button className="px-6 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-lg hover:bg-brand-blue/90 transition-all active:scale-95 shadow-lg shadow-brand-blue/20">
              Book Now
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white"
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
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xl z-[-1] md:hidden transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="md:hidden absolute top-full left-0 right-0 glass-dark border-t border-white/5 animate-in slide-in-from-top duration-300">
            <div className="px-4 py-12 flex flex-col gap-6 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xl font-bold text-gray-200 hover:text-brand-blue"
                >
                  {link.name}
                </Link>
              ))}
              <button className="w-full max-w-xs py-4 bg-brand-blue text-white font-bold rounded-xl shadow-lg shadow-brand-blue/20">
                Book Now
              </button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
