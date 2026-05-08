import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réserver votre Lavage Auto | Family Lavage Casablanca",
  description: "Réservez votre séance de lavage auto premium au parking Marjane Casablanca. Simple, rapide et professionnel.",
  alternates: {
    canonical: "/booking",
  },
  openGraph: {
    title: "Réserver votre Lavage Auto | Family Lavage Casablanca",
    description: "Réservez votre séance de lavage auto premium au parking Marjane Casablanca.",
    url: "https://familylavage.com/booking",
  },
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
