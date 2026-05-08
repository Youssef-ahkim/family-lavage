import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion | Family Lavage Group",
  description: "Connectez-vous à votre compte Family Lavage pour gérer vos réservations et abonnements.",
  alternates: {
    canonical: "/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
