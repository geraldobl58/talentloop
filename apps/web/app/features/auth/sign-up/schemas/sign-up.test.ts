import { describe, it, expect } from "vitest";
import { formSignUpCandidateSchema, formSignUpCompanySchema } from "./sign-up";

describe("Sign Up Schemas", () => {
  describe("formSignUpCandidateSchema", () => {
    it("should validate a valid candidate", () => {
      const validCandidate = {
        name: "João Silva",
        email: "joao@email.com",
      };

      const result = formSignUpCandidateSchema.safeParse(validCandidate);
      expect(result.success).toBe(true);
    });

    it("should fail with empty name", () => {
      const invalidCandidate = {
        name: "",
        email: "joao@email.com",
      };

      const result = formSignUpCandidateSchema.safeParse(invalidCandidate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("obrigatório");
      }
    });

    it("should fail with invalid email", () => {
      const invalidCandidate = {
        name: "João Silva",
        email: "invalid-email",
      };

      const result = formSignUpCandidateSchema.safeParse(invalidCandidate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("inválido");
      }
    });

    it("should fail with name containing numbers", () => {
      const invalidCandidate = {
        name: "João123",
        email: "joao@email.com",
      };

      const result = formSignUpCandidateSchema.safeParse(invalidCandidate);
      expect(result.success).toBe(false);
    });

    it("should transform email to lowercase", () => {
      const candidate = {
        name: "João Silva",
        email: "JOAO@EMAIL.COM",
      };

      const result = formSignUpCandidateSchema.safeParse(candidate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("joao@email.com");
      }
    });

    it("should trim name", () => {
      const candidate = {
        name: "  João Silva  ",
        email: "joao@email.com",
      };

      const result = formSignUpCandidateSchema.safeParse(candidate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("João Silva");
      }
    });
  });

  describe("formSignUpCompanySchema", () => {
    it("should validate a valid company", () => {
      const validCompany = {
        companyName: "Empresa LTDA",
        domain: "empresa-ltda",
        contactName: "Maria Santos",
        contactEmail: "maria@empresa.com",
      };

      const result = formSignUpCompanySchema.safeParse(validCompany);
      expect(result.success).toBe(true);
    });

    it("should fail with empty companyName", () => {
      const invalidCompany = {
        companyName: "",
        domain: "empresa",
        contactName: "Maria Santos",
        contactEmail: "maria@empresa.com",
      };

      const result = formSignUpCompanySchema.safeParse(invalidCompany);
      expect(result.success).toBe(false);
    });

    it("should fail with invalid domain format", () => {
      const invalidCompany = {
        companyName: "Empresa LTDA",
        domain: "EMPRESA LTDA",
        contactName: "Maria Santos",
        contactEmail: "maria@empresa.com",
      };

      const result = formSignUpCompanySchema.safeParse(invalidCompany);
      expect(result.success).toBe(false);
    });

    it("should fail with domain starting with hyphen", () => {
      const invalidCompany = {
        companyName: "Empresa LTDA",
        domain: "-empresa",
        contactName: "Maria Santos",
        contactEmail: "maria@empresa.com",
      };

      const result = formSignUpCompanySchema.safeParse(invalidCompany);
      expect(result.success).toBe(false);
    });

    it("should validate domain with numbers and hyphens", () => {
      const validCompany = {
        companyName: "Tech 123",
        domain: "tech-123",
        contactName: "Maria Santos",
        contactEmail: "maria@empresa.com",
      };

      const result = formSignUpCompanySchema.safeParse(validCompany);
      expect(result.success).toBe(true);
    });

    it("should fail with invalid contact email", () => {
      const invalidCompany = {
        companyName: "Empresa LTDA",
        domain: "empresa",
        contactName: "Maria Santos",
        contactEmail: "not-an-email",
      };

      const result = formSignUpCompanySchema.safeParse(invalidCompany);
      expect(result.success).toBe(false);
    });

    it("should transform contactEmail to lowercase", () => {
      const company = {
        companyName: "Empresa LTDA",
        domain: "empresa",
        contactName: "Maria Santos",
        contactEmail: "MARIA@EMPRESA.COM",
      };

      const result = formSignUpCompanySchema.safeParse(company);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contactEmail).toBe("maria@empresa.com");
      }
    });
  });
});
