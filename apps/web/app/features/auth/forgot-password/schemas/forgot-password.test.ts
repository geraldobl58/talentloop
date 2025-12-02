import { describe, it, expect } from "vitest";
import { formForgotPasswordSchema } from "./forgot-password";

describe("Forgot Password Schema", () => {
  describe("formForgotPasswordSchema", () => {
    it("should validate valid email", () => {
      const validData = {
        email: "user@email.com",
      };

      const result = formForgotPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should fail with empty email", () => {
      const invalidData = {
        email: "",
      };

      const result = formForgotPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("obrigatório");
      }
    });

    it("should fail with invalid email format", () => {
      const invalidData = {
        email: "invalid-email",
      };

      const result = formForgotPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("inválido");
      }
    });

    it("should transform email to lowercase", () => {
      const data = {
        email: "USER@EMAIL.COM",
      };

      const result = formForgotPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("user@email.com");
      }
    });

    it("should trim email", () => {
      const data = {
        email: "  user@email.com  ",
      };

      const result = formForgotPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("user@email.com");
      }
    });

    it("should fail with email exceeding max length", () => {
      const longEmail = "a".repeat(250) + "@email.com";
      const invalidData = {
        email: longEmail,
      };

      const result = formForgotPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
