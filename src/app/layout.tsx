import type { Metadata, Viewport } from "next";
import "./globals.css";

import { LanguageProvider } from "@/context/LanguageContext";
import { ProfileProvider } from "@/context/ProfileContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://familylavage.com"),
  title: {
    default: "Family Lavage Group | Lavage Auto Premium à Marjane Casablanca",
    template: "%s | Family Lavage Group",
  },
  description: "Services de lavage auto professionnels pendant vos courses. Lavage en 15 minutes, technologie écologique et detailing premium à Casablanca.",
  keywords: ["lavage auto", "Casablanca", "Marjane", "nettoyage voiture", "detailing auto", "lavage écologique", "Family Lavage"],
  authors: [{ name: "Family Lavage Group" }],
  creator: "Family Lavage Group",
  publisher: "Family Lavage Group",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Family Lavage Group | Lavage Auto Premium à Marjane Casablanca",
    description: "Services de lavage auto professionnels pendant vos courses. Lavage en 15 minutes, technologie écologique et detailing premium à Casablanca.",
    url: "https://familylavage.com",
    siteName: "Family Lavage Group",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/home-hero.png",
        width: 1200,
        height: 630,
        alt: "Family Lavage Group Casablanca",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Family Lavage Group | Lavage Auto Premium à Marjane Casablanca",
    description: "Services de lavage auto professionnels pendant vos courses. Lavage en 15 minutes, technologie écologique et detailing premium à Casablanca.",
    images: ["/home-hero.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    google: "notranslate",
  },
  icons: {
    icon: "/favicon.png?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="scroll-smooth" data-scroll-behavior="smooth" translate="no">
      <body className="antialiased font-sans">
        <LanguageProvider>
          <ProfileProvider>
            {children}
          </ProfileProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
