import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réserver votre Lavage Auto à Domicile | Family Lavage Marrakech",
  description: "Réservez votre lavage auto mobile à Marrakech. On vient chez vous avec notre équipement professionnel. Simple, rapide et premium.",
  alternates: {
    canonical: "/booking",
  },
  openGraph: {
    title: "Réserver votre Lavage Auto à Domicile | Family Lavage Marrakech",
    description: "Réservez votre lavage auto mobile à Marrakech. On se déplace chez vous.",
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
