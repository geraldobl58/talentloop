import { describe, it, expect } from "vitest";
import { formResetPasswordSchema } from "./reset-password";

describe("Reset Password Schema", () => {
  describe("formResetPasswordSchema", () => {
    it("should validate valid password reset data", () => {
      const validData = {
        newPassword: "Password1@",
        confirmPassword: "Password1@",
      };

      const result = formResetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should fail with empty newPassword", () => {
      const invalidData = {
        newPassword: "",
        confirmPassword: "Password1@",
      };

      const result = formResetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should fail with password less than 8 characters", () => {
      const invalidData = {
        newPassword: "Pass1@",
        confirmPassword: "Pass1@",
      };

      const result = formResetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("8 caracteres");
      }
    });

    it("should fail with password without uppercase letter", () => {
      const invalidData = {
        newPassword: "password1@",
        confirmPassword: "password1@",
      };

      const result = formResetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("maiúscula");
      }
    });

    it("should fail with password without lowercase letter", () => {
      const invalidData = {
        newPassword: "PASSWORD1@",
        confirmPassword: "PASSWORD1@",
      };

      const result = formResetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should fail with password without number", () => {
      const invalidData = {
        newPassword: "Password@@@",
        confirmPassword: "Password@@@",
      };

      const result = formResetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should fail with password without special character", () => {
      const invalidData = {
        newPassword: "Password123",
        confirmPassword: "Password123",
      };

      const result = formResetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("caractere especial");
      }
    });

    it("should fail when passwords do not match", () => {
      const invalidData = {
        newPassword: "Password1@",
        confirmPassword: "DifferentPass1@",
      };

      const result = formResetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmError = result.error.issues.find((issue) =>
          issue.path.includes("confirmPassword")
        );
        expect(confirmError?.message).toContain("não coincidem");
      }
    });

    it("should accept optional token", () => {
      const validData = {
        token: "some-reset-token",
        newPassword: "Password1@",
        confirmPassword: "Password1@",
      };

      const result = formResetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
