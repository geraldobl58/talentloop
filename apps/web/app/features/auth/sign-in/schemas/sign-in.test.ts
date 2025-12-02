import { describe, it, expect } from "vitest";
import { formSignInSchema } from "./sign-in";

describe("Sign In Schema", () => {
  describe("formSignInSchema", () => {
    it("should validate valid credentials", () => {
      const validCredentials = {
        email: "user@email.com",
        password: "password123",
      };

      const result = formSignInSchema.safeParse(validCredentials);
      expect(result.success).toBe(true);
    });

    it("should fail with empty email", () => {
      const invalidCredentials = {
        email: "",
        password: "password123",
      };

      const result = formSignInSchema.safeParse(invalidCredentials);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("obrigatório");
      }
    });

    it("should fail with invalid email format", () => {
      const invalidCredentials = {
        email: "invalid-email",
        password: "password123",
      };

      const result = formSignInSchema.safeParse(invalidCredentials);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("inválido");
      }
    });

    it("should fail with empty password", () => {
      const invalidCredentials = {
        email: "user@email.com",
        password: "",
      };

      const result = formSignInSchema.safeParse(invalidCredentials);
      expect(result.success).toBe(false);
    });

    it("should fail with password less than 6 characters", () => {
      const invalidCredentials = {
        email: "user@email.com",
        password: "12345",
      };

      const result = formSignInSchema.safeParse(invalidCredentials);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("6 caracteres");
      }
    });

    it("should transform email to lowercase", () => {
      const credentials = {
        email: "USER@EMAIL.COM",
        password: "password123",
      };

      const result = formSignInSchema.safeParse(credentials);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("user@email.com");
      }
    });

    it("should trim email", () => {
      const credentials = {
        email: "  user@email.com  ",
        password: "password123",
      };

      const result = formSignInSchema.safeParse(credentials);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("user@email.com");
      }
    });

    it("should accept optional twoFactorToken", () => {
      const credentials = {
        email: "user@email.com",
        password: "password123",
        twoFactorToken: "123456",
      };

      const result = formSignInSchema.safeParse(credentials);
      expect(result.success).toBe(true);
    });

    it("should fail with invalid twoFactorToken format", () => {
      const credentials = {
        email: "user@email.com",
        password: "password123",
        twoFactorToken: "12345",
      };

      const result = formSignInSchema.safeParse(credentials);
      expect(result.success).toBe(false);
    });

    it("should fail with non-numeric twoFactorToken", () => {
      const credentials = {
        email: "user@email.com",
        password: "password123",
        twoFactorToken: "abcdef",
      };

      const result = formSignInSchema.safeParse(credentials);
      expect(result.success).toBe(false);
    });
  });
});
