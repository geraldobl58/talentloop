"use server";

import { z } from "zod";
import { HTTPError } from "ky";

import { signUpCandidate, signUpCompany } from "../http";

// =============================================
// INTERNAL SCHEMAS (with plan)
// =============================================

const candidatePlanSchema = z.enum(["FREE", "PRO", "PREMIUM"]);
const companyPlanSchema = z.enum(["STARTUP", "BUSINESS", "ENTERPRISE"]);

const signUpCandidateSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().min(5),
  plan: candidatePlanSchema,
});

const signUpCompanySchema = z.object({
  companyName: z.string().min(2).max(100),
  domain: z.string().min(3).max(50),
  contactName: z.string().min(2).max(100),
  contactEmail: z.string().email().min(5),
  plan: companyPlanSchema,
});

// =============================================
// TYPES
// =============================================

export type SignUpActionState = {
  success: boolean;
  message?: string;
  checkoutUrl?: string;
  isFree?: boolean;
  isTrial?: boolean;
  tenantSlug?: string;
  tenantId?: string;
  token?: string;
  errors?: Record<string, string[]> | null;
};

// =============================================
// CANDIDATE SIGN UP ACTION
// =============================================

/**
 * Server Action para cadastro de candidato
 */
export async function signUpCandidateAction(
  formData: FormData
): Promise<SignUpActionState> {
  try {
    const rawData = Object.fromEntries(formData);
    const validationResult = signUpCandidateSchema.safeParse(rawData);

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Validação falhou. Verifique os campos.",
        errors: fieldErrors,
      };
    }

    const data = validationResult.data;

    console.log("[SignUp Candidate Debug]", {
      name: data.name,
      email: data.email,
      plan: data.plan,
    });

    const response = await signUpCandidate({
      name: data.name,
      email: data.email,
      plan: data.plan,
    });

    if (!response.success) {
      return {
        success: false,
        message: response.message || "Erro ao criar conta",
      };
    }

    // Plano FREE ou trial - retorna token para login automático
    if (response.token) {
      return {
        success: true,
        message: "Conta criada com sucesso!",
        token: response.token,
        isTrial: response.isTrial,
      };
    }

    // Plano pago - redirecionar para checkout
    if (response.checkoutUrl) {
      return {
        success: true,
        message: "Redirecionando para pagamento...",
        checkoutUrl: response.checkoutUrl,
      };
    }

    return {
      success: true,
      message: "Conta criada com sucesso! Verifique seu email para acessar.",
    };
  } catch (error) {
    console.error("[SignUp Candidate Error]", error);

    if (error instanceof HTTPError) {
      try {
        const errorData = (await error.response.json()) as { message?: string };
        return {
          success: false,
          message:
            errorData.message || "Erro ao conectar com a API. Tente novamente.",
        };
      } catch {
        return {
          success: false,
          message: "Erro ao processar resposta do servidor.",
        };
      }
    }

    return {
      success: false,
      message: "Erro inesperado. Tente novamente mais tarde.",
    };
  }
}

// =============================================
// COMPANY SIGN UP ACTION
// =============================================

/**
 * Server Action para cadastro de empresa
 */
export async function signUpCompanyAction(
  formData: FormData
): Promise<SignUpActionState> {
  try {
    const rawData = Object.fromEntries(formData);
    const validationResult = signUpCompanySchema.safeParse(rawData);

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Validação falhou. Verifique os campos.",
        errors: fieldErrors,
      };
    }

    const data = validationResult.data;

    console.log("[SignUp Company Debug]", {
      companyName: data.companyName,
      domain: data.domain,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      plan: data.plan,
    });

    const response = await signUpCompany({
      companyName: data.companyName,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      domain: data.domain,
      plan: data.plan,
    });

    if (!response.success) {
      return {
        success: false,
        message: response.message || "Erro ao criar conta",
      };
    }

    // Trial - retorna token para login automático
    if (response.isTrial && response.token) {
      return {
        success: true,
        message: "Conta criada com sucesso! Período de teste iniciado.",
        token: response.token,
        isTrial: true,
        tenantSlug: response.tenant?.slug,
      };
    }

    // Plano pago - redirecionar para checkout
    if (response.checkoutUrl) {
      return {
        success: true,
        message: "Redirecionando para pagamento...",
        checkoutUrl: response.checkoutUrl,
        tenantSlug: response.tenant?.slug,
      };
    }

    return {
      success: true,
      message: "Conta criada com sucesso! Verifique seu email para acessar.",
      tenantSlug: response.tenant?.slug,
    };
  } catch (error) {
    console.error("[SignUp Company Error]", error);

    if (error instanceof HTTPError) {
      try {
        const errorData = (await error.response.json()) as { message?: string };
        return {
          success: false,
          message:
            errorData.message || "Erro ao conectar com a API. Tente novamente.",
        };
      } catch {
        return {
          success: false,
          message: "Erro ao processar resposta do servidor.",
        };
      }
    }

    return {
      success: false,
      message: "Erro inesperado. Tente novamente mais tarde.",
    };
  }
}

// =============================================
// LEGACY ACTION (for backward compatibility)
// =============================================

/**
 * @deprecated Use signUpCandidateAction or signUpCompanyAction instead
 */
export async function signUpAction(
  formData: FormData
): Promise<SignUpActionState> {
  const userType = formData.get("userType") as string;

  if (userType === "candidate") {
    return signUpCandidateAction(formData);
  }

  return signUpCompanyAction(formData);
}
