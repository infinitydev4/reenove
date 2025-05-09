// Types pour le statut d'onboarding de l'agent
export type AgentOnboardingStatus = {
  profile: boolean;
  commissionRules: boolean;
  bankDetails: boolean;
}

// Types pour les statistiques du dashboard agent
export type AgentDashboardStats = {
  totalCommissions: {
    month: string;
    quarter: string;
    year: string;
    percentChange: string;
  };
  activeAffiliates: {
    month: number;
    quarter: number;
    year: number;
    percentChange: string;
  };
  projectsReferred: {
    month: number;
    quarter: number;
    year: number;
    percentChange: string;
  };
  artisansReferred: {
    month: number;
    quarter: number;
    year: number;
    percentChange: string;
  };
}

// Types pour les commissions
export type Commission = {
  id: string;
  source: string;
  type: 'project' | 'artisan' | 'affiliate';
  amount: string;
  date: string;
  status: 'pending' | 'paid' | 'declined';
  statusLabel: string;
  paymentDate?: string;
  reason?: string;
}

export type DetailedCommission = Commission & {
  type: "project" | "artisan" | "affiliate";
  statusLabel: string;
  paymentDate?: string;
  reason?: string;
}

export type CommissionStats = {
  totalPending: {
    month: string;
    quarter: string;
    year: string;
  };
  totalPaid: {
    month: string;
    quarter: string;
    year: string;
  };
  nextPayment: {
    date: string;
    amount: string;
  };
  breakdown: {
    projects: number;
    artisans: number;
    affiliates: number;
  };
}

export type MonthlyCommission = {
  month: string;
  amount: number;
}

// Types pour les filleuls
export type Referral = {
  id: string;
  name: string;
  email: string;
  image?: string;
  joinDate: string;
  status: 'active' | 'pending' | 'inactive';
  statusLabel: string;
  commissions: string;
  referrals: number;
}

export type ReferralStats = {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  totalCommissions: string;
}

// Types pour les objectifs
export type Goal = {
  id: string;
  title: string;
  target: number;
  current: number;
  percentComplete: number;
  deadline: string;
  reward: string;
  type: 'affiliates' | 'artisans' | 'projects' | 'commissions';
}

// Types pour les artisans parrainés
export type SponsoredArtisan = {
  id: string;
  name: string;
  email: string;
  company: string;
  image: string;
  joinDate: string;
  specialty: string;
  status: "active" | "pending" | "inactive";
  statusLabel: string;
  commissions: string;
  projects: number;
  rating: number;
}

export type ArtisanStats = {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  totalCommissions: string;
}

// Types pour le programme de parrainage
export type CommissionRule = {
  type: string;
  description: string;
  commission: string;
  condition: string;
}

export type ReferralLink = {
  url: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
}

// Types pour le profil de l'agent
export type AgentProfile = {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  address: string;
  iban: string;
  affiliateCode: string;
  commissionRate: string;
}

// Types pour les préférences de notification
export type NotificationSetting = {
  id: string;
  label: string;
  enabled: boolean;
  description?: string;
} 