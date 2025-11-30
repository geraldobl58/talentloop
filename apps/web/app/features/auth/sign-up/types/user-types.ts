export enum UserType {
  CANDIDATE = "candidate",
  COMPANY = "company",
}

export interface UserTypeConfig {
  type: UserType;
  label: string;
  description: string;
  showTenantId: boolean;
  dashboardTitle: string;
  dashboardDescription: string;
}

export const USER_TYPE_CONFIGS: Record<UserType, UserTypeConfig> = {
  [UserType.CANDIDATE]: {
    type: UserType.CANDIDATE,
    label: "Sou Candidato",
    description: "Encontre as melhores oportunidades de emprego",
    showTenantId: false,
    dashboardTitle: "Painel do Candidato",
    dashboardDescription:
      "Gerencie suas candidaturas e encontre novas oportunidades",
  },
  [UserType.COMPANY]: {
    type: UserType.COMPANY,
    label: "Sou Empresa",
    description: "Encontre os melhores talentos para sua equipe",
    showTenantId: true,
    dashboardTitle: "Painel da Empresa",
    dashboardDescription:
      "Gerencie suas vagas e encontre os melhores candidatos",
  },
};

// Default tenant ID for candidates (they don't need to specify)
export const DEFAULT_CANDIDATE_TENANT = "candidates";
