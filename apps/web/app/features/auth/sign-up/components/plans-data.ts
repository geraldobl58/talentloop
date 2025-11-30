// Planos baseados no ROADMAP do TalentLoop
// Candidatos: FREE, PRO, PREMIUM
// Empresas: STARTUP, BUSINESS, ENTERPRISE

export type CandidatePlanType = "FREE" | "PRO" | "PREMIUM";
export type CompanyPlanType = "STARTUP" | "BUSINESS" | "ENTERPRISE";
export type PlanType = CandidatePlanType | CompanyPlanType;

export interface PlanOption {
  value: PlanType;
  label: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: "month" | "year";
  isTrial?: boolean;
  trialDays?: number;
  isPopular?: boolean;
  features: string[];
  limits: {
    jobsPerDay?: number;
    applicationsPerDay?: number;
    autoApplyPerDay?: number;
    activeJobs?: number;
    recruiters?: number;
    applicationsPerMonth?: number;
    crmContacts?: number;
  };
}

// =============================================
// PLANOS PARA CANDIDATOS (B2C)
// =============================================
export const CANDIDATE_PLANS: PlanOption[] = [
  {
    value: "FREE",
    label: "Free",
    description: "Para começar sua busca de emprego",
    price: 0,
    currency: "BRL",
    billingPeriod: "month",
    isTrial: false,
    features: [
      "100 vagas visíveis por dia",
      "10 candidaturas manuais por dia",
      "AI Matching básico",
      "1 carta de apresentação IA/mês",
      "Email de vagas diário",
    ],
    limits: {
      jobsPerDay: 100,
      applicationsPerDay: 10,
      autoApplyPerDay: 0,
      crmContacts: 0,
    },
  },
  {
    value: "PRO",
    label: "Pro",
    description: "Para candidatos que querem se destacar",
    price: 29,
    currency: "BRL",
    billingPeriod: "month",
    isTrial: true,
    trialDays: 7,
    isPopular: true,
    features: [
      "Vagas ilimitadas",
      "50 candidaturas por dia",
      "10 AutoApply por dia",
      "AI Matching detalhado",
      "20 cartas de apresentação IA/mês",
      "5 adaptações de CV por IA/mês",
      "CRM de Recrutadores (50 contatos)",
      "Push notifications em tempo real",
      "Relatórios completos",
      "Suporte por email",
    ],
    limits: {
      jobsPerDay: -1, // unlimited
      applicationsPerDay: 50,
      autoApplyPerDay: 10,
      crmContacts: 50,
    },
  },
  {
    value: "PREMIUM",
    label: "Premium",
    description: "Máximo poder na sua busca de emprego",
    price: 79,
    currency: "BRL",
    billingPeriod: "month",
    isTrial: true,
    trialDays: 7,
    features: [
      "Tudo do plano Pro",
      "Candidaturas ilimitadas",
      "30 AutoApply por dia",
      "AI Matching + Sugestões personalizadas",
      "Cartas de apresentação ilimitadas",
      "Adaptações de CV ilimitadas",
      "CRM de Recrutadores ilimitado",
      "Push + WhatsApp notifications",
      "Relatórios + Exportação",
      "Suporte prioritário",
    ],
    limits: {
      jobsPerDay: -1,
      applicationsPerDay: -1,
      autoApplyPerDay: 30,
      crmContacts: -1,
    },
  },
];

// =============================================
// PLANOS PARA EMPRESAS (B2B)
// =============================================
export const COMPANY_PLANS: PlanOption[] = [
  {
    value: "STARTUP",
    label: "Startup",
    description: "Ideal para pequenas empresas",
    price: 299,
    currency: "BRL",
    billingPeriod: "month",
    isTrial: true,
    trialDays: 14,
    features: [
      "5 vagas ativas",
      "2 recrutadores",
      "100 candidaturas recebidas/mês",
      "Filtros básicos",
      "ATS básico integrado",
      "Suporte por email",
    ],
    limits: {
      activeJobs: 5,
      recruiters: 2,
      applicationsPerMonth: 100,
    },
  },
  {
    value: "BUSINESS",
    label: "Business",
    description: "Para empresas em crescimento",
    price: 799,
    currency: "BRL",
    billingPeriod: "month",
    isTrial: true,
    trialDays: 14,
    isPopular: true,
    features: [
      "20 vagas ativas",
      "10 recrutadores",
      "500 candidaturas/mês",
      "Acesso ao banco de CVs (busca)",
      "Filtros avançados completos",
      "ATS completo integrado",
      "Analytics de vagas",
      "Página da empresa (Employer Branding)",
      "Suporte por chat",
      "SLA 99.5%",
    ],
    limits: {
      activeJobs: 20,
      recruiters: 10,
      applicationsPerMonth: 500,
    },
  },
  {
    value: "ENTERPRISE",
    label: "Enterprise",
    description: "Solução completa para grandes empresas",
    price: 0, // Sob consulta
    currency: "BRL",
    billingPeriod: "month",
    features: [
      "Vagas ilimitadas",
      "Recrutadores ilimitados",
      "Candidaturas ilimitadas",
      "Banco de CVs completo + Export",
      "Filtros avançados + IA",
      "ATS customizado",
      "Analytics + API",
      "Página + Destaques",
      "API de integração",
      "Suporte dedicado",
      "SLA 99.9%",
    ],
    limits: {
      activeJobs: -1,
      recruiters: -1,
      applicationsPerMonth: -1,
    },
  },
];

// Helper para obter planos baseado no tipo de usuário
export const getPlansForUserType = (
  userType: "candidate" | "company"
): PlanOption[] => {
  return userType === "candidate" ? CANDIDATE_PLANS : COMPANY_PLANS;
};

// Helper para obter plano por valor
export const getPlanByValue = (value: PlanType): PlanOption | undefined => {
  return [...CANDIDATE_PLANS, ...COMPANY_PLANS].find((p) => p.value === value);
};

// Formatador de preço
export const formatPrice = (
  price: number,
  currency: string = "BRL"
): string => {
  if (price === 0) return "Grátis";
  return price.toLocaleString("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Plano padrão para cada tipo
export const DEFAULT_CANDIDATE_PLAN: CandidatePlanType = "FREE";
export const DEFAULT_COMPANY_PLAN: CompanyPlanType = "STARTUP";
