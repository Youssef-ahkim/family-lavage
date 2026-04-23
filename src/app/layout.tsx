import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Lavage Group | Premium Car Wash at Marjane Casablanca",
  description: "Professional car wash services while you shop. 15-minute turnaround, water-saving technology, and premium detailing in Casablanca.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}
