export const tiers = ["bronze", "argent", "or", "platine"] as const;
export type Tier = (typeof tiers)[number];

export const tierLabels: Record<Tier, string> = {
  bronze: "Bronze",
  argent: "Argent",
  or: "Or",
  platine: "Platine",
};

export const tierDescriptions: Record<Tier, string> = {
  bronze: "Jusqu'à 5 inscriptions validées",
  argent: "6 à 10 inscriptions validées",
  or: "11 à 20 inscriptions validées",
  platine: "Plus de 20 inscriptions validées",
};

export const howItWorksSteps = [
  {
    step: 1,
    title: "Créer un compte",
    description: "Inscription en ligne, validation par code e-mail.",
  },
  {
    step: 2,
    title: "Recevoir son code",
    description: "Chaque ambassadeur dispose d'un code et d'un lien de parrainage.",
  },
  {
    step: 3,
    title: "Orienter les candidats",
    description: "Les inscriptions passent par le catalogue des formations EIG.",
  },
  {
    step: 4,
    title: "Percevoir les commissions",
    description: "Rémunération après validation administrative de l'inscription.",
  },
] as const;

export type PlatformStats = {
  ambassadors: number;
  validatedEnrollments: number;
  totalDistributed: number;
};

export const defaultPlatformStats: PlatformStats = {
  ambassadors: 0,
  validatedEnrollments: 0,
  totalDistributed: 0,
};
