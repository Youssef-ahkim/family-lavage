import type { Metadata, Viewport } from "next";
import "./globals.css";

import { LanguageProvider } from "@/context/LanguageContext";
import { ProfileProvider } from "@/context/ProfileContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://familylavage.com"),
  title: {
    default: "Family Lavage Group | Lavage Auto Mobile à Domicile — Marrakech",
    template: "%s | Family Lavage Group",
  },
  description: "Service de lavage auto mobile à Marrakech. On vient chez vous, au bureau ou partout où vous êtes avec un équipement professionnel. Rapide, écologique et premium.",
  appleWebApp: {
    title: "Family Lavage",
    statusBarStyle: "default",
    capable: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  keywords: ["lavage auto mobile", "Marrakech", "lavage à domicile", "nettoyage voiture", "detailing auto", "lavage écologique", "Family Lavage", "lavage sur place"],
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
    title: "Family Lavage Group | Lavage Auto Mobile à Domicile — Marrakech",
    description: "Service de lavage auto mobile à Marrakech. On vient chez vous avec un équipement professionnel. Rapide, écologique et premium.",
    url: "https://familylavage.com",
    siteName: "Family Lavage Group",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/home-hero.png",
        width: 1200,
        height: 630,
        alt: "Family Lavage Group Marrakech — Lavage Auto Mobile",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Family Lavage Group | Lavage Auto Mobile à Domicile — Marrakech",
    description: "Service de lavage auto mobile à Marrakech. On vient chez vous avec un équipement professionnel.",
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
