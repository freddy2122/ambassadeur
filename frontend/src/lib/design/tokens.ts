export const tiers = ["bronze", "argent", "or", "platine"] as const;
export type Tier = (typeof tiers)[number];

export const tierLabels: Record<Tier, string> = {
  bronze: "Bronze",
  argent: "Argent",
  or: "Or",
  platine: "Platine",
};

export const tierDescriptions: Record<Tier, string> = {
  bronze: "0 – 5 inscriptions validées",
  argent: "6 – 10 inscriptions validées",
  or: "11 – 20 inscriptions validées",
  platine: "21+ inscriptions validées",
};

export const howItWorksSteps = [
  {
    step: 1,
    title: "Je crée mon compte",
    description: "Inscription gratuite en quelques minutes pour rejoindre le programme.",
  },
  {
    step: 2,
    title: "Je partage mon code",
    description: "Partage ton lien ou code ambassadeur avec ton réseau.",
  },
  {
    step: 3,
    title: "Mes amis s'inscrivent",
    description: "Tes filleuls choisissent une formation EIG via ton lien.",
  },
  {
    step: 4,
    title: "Je gagne des récompenses",
    description: "Commission versée à chaque inscription validée.",
  },
] as const;

export type PlatformStats = {
  ambassadors: number;
  validatedEnrollments: number;
  totalDistributed: number;
};

export const defaultPlatformStats: PlatformStats = {
  ambassadors: 245,
  validatedEnrollments: 128,
  totalDistributed: 3_250_000,
};
