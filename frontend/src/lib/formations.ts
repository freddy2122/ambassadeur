export type FormationCategory = "licence" | "certifiante" | "continue";

export type Formation = {
  slug: string;
  title: string;
  category: FormationCategory;
  duration: string;
  imageUrl: string;
  excerpt: string;
  skills: string[];
  /** Tarifs de secours si l’API catalogue est vide / indisponible (la base Laravel reste la source de vérité en prod). */
  defaultPricing: { annualFcfa: number; registrationFcfa: number };
  details?: {
    careers: string[];
    objective: string;
    curriculum: Array<{
      title: string;
      items: string[];
    }>;
    annualCostFcfa: number;
    registrationFeeFcfa: number;
  };
};

export const formationCategories: Array<{
  id: FormationCategory;
  label: string;
}> = [
  {
    id: "licence",
    label: "Formations en licence professionnelle",
  },
  {
    id: "certifiante",
    label: "Formations professionnelles Certifiantes",
  },
  {
    id: "continue",
    label: "Formations Continues (Cours du soir)",
  },
];

/** Images hébergées localement (certificat SSL eiggroupe.com expiré). */
const formationImages = {
  licence: "/formations/stream-licence-pro.png",
  certifiante: "/formations/stream-formation-certifiante.png",
  continue: "/formations/stream-formation-continue.png",
  marketing: "/formations/Frame-1171277778.png",
  journalisme: "/formations/Frame-1171277778-3.png",
} as const;

export const formations: Formation[] = [
  {
    slug: "communication-visuelle-graphique-numerique",
    title: "Communication visuelle (Graphique et Numérique)",
    category: "licence",
    duration: "3 ans",
    imageUrl: formationImages.licence,
    excerpt: "Maîtrisez le branding, la direction artistique et les outils de création numérique pour produire des campagnes visuelles percutantes.",
    skills: ["Design graphique", "Direction artistique", "Branding", "Motion design"],
    defaultPricing: { annualFcfa: 742000, registrationFcfa: 49500 },
  },
  {
    slug: "developpement-web-mobile-logiciel",
    title: "Développement web, mobile et logiciel",
    category: "licence",
    duration: "3 ans",
    imageUrl: formationImages.certifiante,
    excerpt: "Développez des applications modernes, robustes et orientées produit, du front-end au back-end, sur web et mobile.",
    skills: ["Frontend", "Backend", "API", "Mobile"],
    defaultPricing: { annualFcfa: 788000, registrationFcfa: 55000 },
    details: {
      careers: [
        "Développeur d'application web et mobile",
        "Développeur logiciel",
        "Analyste programmeur",
        "Ingénieur en développement d'applications",
        "Administrateur de bases de données",
        "Architecte réseau",
        "Ingénieur systèmes et réseaux",
        "Data Analyste / Scientiste",
        "Auditeur en sécurité informatique",
      ],
      objective:
        "Cette formation prépare les étudiants aux métiers du génie logiciel en apportant les compétences essentielles en développement, architecture logicielle et gestion des systèmes informatiques, pour une insertion rapide en entreprise ou une poursuite en master.",
      curriculum: [
        {
          title: "Culture générale et Informatique",
          items: [
            "Initiation à l'informatique et introduction au web",
            "Techniques d'expression et de communication",
            "Anglais appliqué à l'informatique",
          ],
        },
        {
          title: "Mathématiques et Algorithmes",
          items: [
            "Analyse et algèbre",
            "Calcul numérique et équations différentielles",
            "Recherche opérationnelle",
          ],
        },
        {
          title: "Programmation et Développement Logiciel",
          items: [
            "Algorithmique et structures de données",
            "Programmation en C++, Java, Python et PHP",
            "Programmation orientée objet",
            "Développement mobile",
          ],
        },
        {
          title: "Développement Web et Applications",
          items: [
            "Développement web client",
            "Développement web dynamique et intégration des bases de données",
            "UX/UI Design et conception d'interfaces utilisateur",
          ],
        },
      ],
      annualCostFcfa: 788000,
      registrationFeeFcfa: 55000,
    },
  },
  {
    slug: "realisation-cinema-television",
    title: "Réalisation Cinéma et Télévision",
    category: "licence",
    duration: "3 ans",
    imageUrl: formationImages.continue,
    excerpt: "Apprenez l’écriture audiovisuelle, la réalisation, le cadrage et le montage pour créer des contenus impactants.",
    skills: ["Scénario", "Réalisation", "Montage", "Post-production"],
    defaultPricing: { annualFcfa: 768000, registrationFcfa: 52000 },
  },
  {
    slug: "marketing-communication-digitale",
    title: "Marketing et Communication digitale",
    category: "licence",
    duration: "3 ans",
    imageUrl: formationImages.marketing,
    excerpt: "Concevez des stratégies digitales orientées performance pour développer la visibilité et la conversion des marques.",
    skills: ["Social media", "Paid ads", "Content", "Analytics"],
    defaultPricing: { annualFcfa: 732000, registrationFcfa: 48500 },
  },
  {
    slug: "journalisme-multimedia",
    title: "Journalisme Multimédia",
    category: "licence",
    duration: "3 ans",
    imageUrl: formationImages.journalisme,
    excerpt: "Formez-vous au reportage numérique, à la narration interactive et aux formats éditoriaux web-first.",
    skills: ["Rédaction", "Interview", "Data journalisme", "Storytelling"],
    defaultPricing: { annualFcfa: 718000, registrationFcfa: 47500 },
  },
  {
    slug: "design-graphique-certifiante",
    title: "Design Graphique",
    category: "certifiante",
    duration: "1 an",
    imageUrl: formationImages.certifiante,
    excerpt:
      "Une formation intensive pour maîtriser les fondamentaux du design, de l'identité visuelle et de la production créative.",
    skills: ["PAO", "Identité visuelle", "Brand assets", "Création publicitaire"],
    defaultPricing: { annualFcfa: 628000, registrationFcfa: 35000 },
  },
  {
    slug: "ui-ux-design-certifiante",
    title: "UI/UX Design",
    category: "certifiante",
    duration: "1 an",
    imageUrl: formationImages.certifiante,
    excerpt:
      "Apprenez à concevoir des parcours utilisateurs fluides, des interfaces modernes et des prototypes prêts à tester.",
    skills: ["UX research", "UI design", "Figma", "Prototypage"],
    defaultPricing: { annualFcfa: 618000, registrationFcfa: 33500 },
  },
  {
    slug: "developpement-web-mobile-certifiante",
    title: "Développement Web et mobile",
    category: "certifiante",
    duration: "1 an",
    imageUrl: formationImages.certifiante,
    excerpt:
      "Maîtrisez les bases solides du développement d'applications web et mobiles orientées besoins métiers.",
    skills: ["HTML/CSS", "JavaScript", "API", "Mobile"],
    defaultPricing: { annualFcfa: 658000, registrationFcfa: 36000 },
  },
  {
    slug: "montage-video-certifiante",
    title: "Montage Vidéo",
    category: "certifiante",
    duration: "1 an",
    imageUrl: formationImages.certifiante,
    excerpt:
      "Développez vos compétences en montage, storytelling visuel et post-production pour des contenus professionnels.",
    skills: ["Montage", "Post-production", "Storytelling", "Habillage"],
    defaultPricing: { annualFcfa: 592000, registrationFcfa: 33000 },
  },
  {
    slug: "serigraphie-certifiante",
    title: "Sérigraphie",
    category: "certifiante",
    duration: "1 an",
    imageUrl: formationImages.certifiante,
    excerpt:
      "Initiez-vous aux techniques de sérigraphie pour produire des supports imprimés créatifs et de qualité.",
    skills: ["Impression", "Pré-presse", "Encres", "Production"],
    defaultPricing: { annualFcfa: 565000, registrationFcfa: 31000 },
  },
  {
    slug: "photographie-cadrage-certifiante",
    title: "Photographie et Cadrage",
    category: "certifiante",
    duration: "1 an",
    imageUrl: formationImages.certifiante,
    excerpt:
      "Apprenez à capturer des visuels percutants grâce à la maîtrise de la lumière, du cadrage et de la direction artistique.",
    skills: ["Cadrage", "Lumière", "Prise de vue", "Retouche"],
    defaultPricing: { annualFcfa: 598000, registrationFcfa: 33000 },
  },
  {
    slug: "graphisme-pao-continue",
    title: "Graphisme PAO",
    category: "continue",
    duration: "3 mois",
    imageUrl: formationImages.continue,
    excerpt:
      "Un format court pour renforcer vos bases en création visuelle et publication assistée par ordinateur.",
    skills: ["PAO", "Mise en page", "Création visuelle", "Workflow print"],
    defaultPricing: { annualFcfa: 325000, registrationFcfa: 19500 },
  },
  {
    slug: "ui-ux-design-continue",
    title: "UI/UX Design",
    category: "continue",
    duration: "3 mois",
    imageUrl: formationImages.continue,
    excerpt:
      "Un format court orienté produit pour apprendre la recherche utilisateur, le design d'interface et le prototypage.",
    skills: ["UX research", "Wireframes", "Prototypage", "Design system"],
    defaultPricing: { annualFcfa: 392000, registrationFcfa: 21500 },
  },
  {
    slug: "montage-video-continue",
    title: "Montage Vidéo",
    category: "continue",
    duration: "3 mois",
    imageUrl: formationImages.continue,
    excerpt:
      "Perfectionnez vos techniques de montage et de narration pour produire des vidéos engageantes rapidement.",
    skills: ["Montage", "Transitions", "Sound design", "Formats réseaux"],
    defaultPricing: { annualFcfa: 338000, registrationFcfa: 20000 },
  },
  {
    slug: "campagnes-communication-continue",
    title: "Conception et déploiement des campagnes de communication",
    category: "continue",
    duration: "3 mois",
    imageUrl: formationImages.continue,
    excerpt:
      "Construisez des campagnes multi-canales de la stratégie à l'exécution avec une approche orientée résultats.",
    skills: ["Stratégie", "Plan média", "Exécution", "Mesure"],
    defaultPricing: { annualFcfa: 365000, registrationFcfa: 20500 },
  },
  {
    slug: "analyse-donnees-python-continue",
    title: "Analyse de données avec python",
    category: "continue",
    duration: "3 mois",
    imageUrl: formationImages.continue,
    excerpt:
      "Apprenez à manipuler, analyser et visualiser des données avec Python pour mieux piloter les décisions.",
    skills: ["Python", "Pandas", "Data viz", "Analyse"],
    defaultPricing: { annualFcfa: 418000, registrationFcfa: 22500 },
  },
  {
    slug: "wordpress-continue",
    title: "WordPress",
    category: "continue",
    duration: "3 mois",
    imageUrl: formationImages.continue,
    excerpt:
      "Créez et administrez des sites web performants avec WordPress, du thème aux extensions essentielles.",
    skills: ["CMS", "Thèmes", "Plugins", "SEO basics"],
    defaultPricing: { annualFcfa: 275000, registrationFcfa: 18000 },
  },
];

/** Affichage / calcul côté front quand une ligne catalogue est absente ou l’API ne répond pas. */
export function getFormationPricingFallback(formation: Formation): {
  annualFcfa: number;
  registrationFcfa: number;
} {
  return formation.defaultPricing;
}

export function getFormationBySlug(slug: string): Formation | undefined {
  return formations.find((formation) => formation.slug === slug);
}
