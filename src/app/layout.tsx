import type { Metadata } from "next";
import "./globals.css";

import { LanguageProvider } from "@/context/LanguageContext";
import { ProfileProvider } from "@/context/ProfileContext";

export const metadata: Metadata = {
  title: "Family Lavage Group | Lavage Auto Premium à Marjane Casablanca",
  description: "Services de lavage auto professionnels pendant vos courses. Lavage en 15 minutes, technologie écologique et detailing premium à Casablanca.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="scroll-smooth" data-scroll-behavior="smooth">
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
