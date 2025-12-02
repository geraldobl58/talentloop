"use server";

import { HTTPError } from "ky";

import { signUpCandidate, signUpCompany } from "../http";

import { SignUpActionState } from "../types/sign-up-action-state";

import { signUpCandidateSchema, signUpCompanySchema } from "../schemas/sign-up";

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

    // Plano FREE - retorna token para login automático
    if (response.token) {
      return {
        success: true,
        message: "Conta criada com sucesso!",
        token: response.token,
        isFree: response.isFree,
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

    // Token retornado - login automático
    if (response.token) {
      return {
        success: true,
        message: "Conta criada com sucesso!",
        token: response.token,
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
