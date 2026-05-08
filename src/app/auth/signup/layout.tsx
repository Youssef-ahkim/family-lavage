import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un Compte | Family Lavage Group",
  description: "Inscrivez-vous à Family Lavage pour bénéficier de nos services de lavage premium et abonnements exclusifs.",
  alternates: {
    canonical: "/auth/signup",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
