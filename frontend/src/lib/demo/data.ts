import { defaultPlatformStats } from "@/lib/design/tokens";

export const demoAmbassador = {
  id: 25,
  name: "Firmin Tovodounnon",
  first_name: "Firmin",
  email: "firmin.demo@gmail.com",
  phone: "+229 97 00 00 00",
  city: "Cotonou",
  code: "AMB-025",
  referralUrl: "https://www.eiggroupe.com/formations?ref=AMB-025",
  personalUrl: "https://www.eiggroupe.com/formations?ref=AMB-025",
};

export const demoPlatformStats = defaultPlatformStats;

export const demoDashboard = {
  profile: {
    name: demoAmbassador.name,
    first_name: demoAmbassador.first_name,
  },
  kpis: {
    prospects: 15,
    leads: 15,
    validated_enrollments: 8,
    available_earnings: 75_000,
    rank: 4,
    clicks: 142,
    total_commission: 220_000,
  },
  referral: {
    code: demoAmbassador.code,
    personal_url: demoAmbassador.personalUrl,
    display_url: demoAmbassador.referralUrl,
  },
  tier: {
    current_tier: "argent" as const,
    next_tier: "or" as const,
    progress_current: 7,
    progress_target: 10,
  },
  earnings: {
    available: 75_000,
    pending: 25_000,
    paid: 120_000,
  },
  challenge: {
    id: 1,
    title: "Challenge Flash",
    description: "Obtiens 5 inscriptions validées avant dimanche.",
    target_enrollments: 5,
    reward_amount: 50_000,
    current_enrollments: 4,
    ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
  },
};

export const demoLeaderboard = {
  leaderboard: [
    { id: 1, name: "Sarah", validated_enrollments: 15, rank: 1 },
    { id: 2, name: "Rodrigue", validated_enrollments: 12, rank: 2 },
    { id: 3, name: "David", validated_enrollments: 10, rank: 3 },
    { id: demoAmbassador.id, name: demoAmbassador.first_name, validated_enrollments: 8, rank: 4 },
    { id: 5, name: "Awa", validated_enrollments: 7, rank: 5 },
    { id: 6, name: "Koffi", validated_enrollments: 6, rank: 6 },
    { id: 7, name: "Mariam", validated_enrollments: 5, rank: 7 },
  ],
  me: {
    id: demoAmbassador.id,
    name: demoAmbassador.name,
    first_name: demoAmbassador.first_name,
    rank: 4,
    validated_enrollments: 8,
  },
};

export const demoEarnings = {
  earnings: demoDashboard.earnings,
  history: [
    {
      id: 1,
      date: "2026-06-15",
      label: "Licence Marketing",
      amount: 25_000,
      status: "validated",
      status_label: "Validé",
    },
    {
      id: 2,
      date: "2026-06-12",
      label: "Graphisme",
      amount: 25_000,
      status: "paid",
      status_label: "Payé",
    },
    {
      id: 3,
      date: "2026-06-08",
      label: "Développement Web",
      amount: 25_000,
      status: "pending",
      status_label: "En attente",
    },
  ],
};

export const demoPayoutEligibility = {
  earnings: demoDashboard.earnings,
  eligible_count: 3,
  eligible_total_xof: 75_000,
  commissions: [
    { id: 1, period_month: "2026-06", gross_amount: 25_000 },
    { id: 2, period_month: "2026-05", gross_amount: 25_000 },
    { id: 3, period_month: "2026-05", gross_amount: 25_000 },
  ],
  payment_profile: {
    payment_method: "mtn",
    payment_account: "+22997000000",
    payment_account_holder: demoAmbassador.name,
    phone: demoAmbassador.phone,
  },
  blockers: {
    email_verification_required: false,
    payment_profile_incomplete: false,
  },
};

export const demoProfile = {
  profile: {
    name: demoAmbassador.name,
    email: demoAmbassador.email,
    phone: demoAmbassador.phone,
    bio: "Ambassadeur EIG passionné.",
    email_verified: true,
    payment_method: "mtn",
    payment_account: "+22997000000",
    payment_account_holder: demoAmbassador.name,
    payment_bank_code: null,
  },
};

export const demoLeads = {
  leads: [
    { full_name: "Jean Akpovi", created_at: "2026-06-14T10:00:00Z", status: "prospect" },
    { full_name: "Aïcha Mensah", created_at: "2026-06-12T14:30:00Z", status: "preinscrit" },
    { full_name: "Paul Dossou", created_at: "2026-06-10T09:15:00Z", status: "validated" },
  ],
  meta: { current_page: 1, last_page: 1, per_page: 10, total: 3 },
};

export const demoNotifications = {
  unread_count: 2,
  notifications: [
    {
      id: "demo-1",
      title: "Nouveau prospect",
      message: "Jean Akpovi a consulté ton lien de parrainage.",
      read_at: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "demo-2",
      title: "Inscription validée",
      message: "Paul Dossou a finalisé son inscription via ton code AMB-025.",
      read_at: null,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
};
