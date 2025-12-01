import { env } from "../../../../libs/env";
import {
  CandidateSignUpRequest,
  CompanySignUpRequest,
  SignUpResponse,
} from "../types";
import { api } from "../../../../libs/api-client";

// =============================================
// CANDIDATE SIGN UP
// =============================================

/**
 * Realiza o signup de um candidato
 */
export async function signUpCandidate(
  data: CandidateSignUpRequest
): Promise<SignUpResponse> {
  const successUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/success`;
  const cancelUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/sign-up`;

  const response = await api
    .post("auth/signup/candidate", {
      json: {
        name: data.name,
        email: data.email,
        plan: data.plan,
        successUrl,
        cancelUrl,
      },
    })
    .json<SignUpResponse>();

  return response;
}

// =============================================
// COMPANY SIGN UP
// =============================================

/**
 * Realiza o signup de uma empresa
 */
export async function signUpCompany(
  data: CompanySignUpRequest
): Promise<SignUpResponse> {
  const successUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/success`;
  const cancelUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/sign-up`;

  const response = await api
    .post("auth/signup/company", {
      json: {
        companyName: data.companyName,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        domain: data.domain,
        plan: data.plan,
        successUrl,
        cancelUrl,
      },
    })
    .json<SignUpResponse>();

  return response;
}
