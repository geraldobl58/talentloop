"use server";

import { HTTPError } from "ky";
import { formSignInSchema } from "../schemas";
import { signIn } from "../http";
import { TenantType } from "../types";

export type SignInActionState = {
  success: boolean;
  message?: string;
  token?: string;
  requiresTwoFactor?: boolean;
  tenantType?: TenantType;
  userId?: string;
  errors?: Record<string, string[]> | null;
};

/**
 * Server Action para realizar signin do usuário
 * O sistema detecta automaticamente se é candidato ou empresa pelo email
 * @param formData - FormData contendo dados do signin
 * @returns Resultado da ação com status de sucesso/erro
 */
export async function signInAction(
  formData: FormData
): Promise<SignInActionState> {
  try {
    // Parse e validação dos dados
    const rawData = Object.fromEntries(formData);
    const validationResult = formSignInSchema.safeParse(rawData);

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Validação falhou. Verifique os campos.",
        errors: fieldErrors,
      };
    }

    const formData_ = validationResult.data;

    // Usar rota unificada (detecção automática de tipo pelo email)
    const response = await signIn({
      email: formData_.email,
      password: formData_.password,
      twoFactorToken: formData_.twoFactorToken,
    });

    // Verificar se o signin foi bem-sucedido
    if (!response.success) {
      return {
        success: false,
        message: response.message || "Erro ao realizar signin",
      };
    }

    // Retornar resposta com token e tenant type
    // Redirecionamento será feito no cliente
    return {
      success: true,
      message: response.message || "Login realizado com sucesso",
      token: response.token,
      requiresTwoFactor: response.requiresTwoFactor,
      tenantType: response.tenantType,
      userId: response.userId,
    };
  } catch (error) {
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
