import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes Réservations | Family Lavage Group",
  description: "Consultez et gérez vos réservations de lavage auto mobile à Marrakech.",
  alternates: {
    canonical: "/my-bookings",
  },
};

export default function MyBookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
