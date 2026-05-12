export const PLANS = {
  monthly: {
    id: "monthly",
    name: {
      fr: "Abonnement Mensuel",
      en: "Monthly Subscription",
      ar: "اشتراك شهري"
    },
    price: 350,
    washes: 4,
    durationDays: 30,
    features: {
      fr: ["1 lavage par semaine", "Polissage intérieur", "Polissage extérieur"],
      en: ["1 wash per week", "Interior polishing", "Exterior polishing"],
      ar: ["غسلة واحدة في الأسبوع", "تلميع داخلي", "تلميع خارجي"]
    }
  },
  yearly: {
    id: "yearly",
    name: {
      fr: "Abonnement Annuel",
      en: "Annual Subscription",
      ar: "اشتراك سنوي"
    },
    price: 3700,
    washes: 52,
    durationDays: 365,
    features: {
      fr: ["1 lavage par semaine", "Polissage intérieur", "Polissage extérieur", "Parfum spécial"],
      en: ["1 wash per week", "Interior polishing", "Exterior polishing", "Special scent"],
      ar: ["غسلة واحدة في الأسبوع", "تلميع داخلي", "تلميع خارجي", "معطر خاص"]
    }
  }
} as const;

export type PlanId = keyof typeof PLANS;
