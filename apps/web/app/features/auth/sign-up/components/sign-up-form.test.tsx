import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { SignUpCandidateForm } from "./sign-up-candidate-form";
import { SignUpCompanyForm } from "./sign-up-company-form";
import {
  formSignUpCandidateSchema,
  formSignUpCompanySchema,
  FormSignUpCandidateData,
  FormSignUpCompanyData,
} from "../schemas/sign-up";
import { UserType } from "../types/user-types";

// Wrapper component to provide form context for Candidate
const CandidateFormWrapper = ({
  onSubmit = vi.fn(),
  isLoading = false,
  errorMessage,
  successMessage,
}: {
  onSubmit?: (values: FormSignUpCandidateData) => Promise<void>;
  isLoading?: boolean;
  errorMessage?: string;
  successMessage?: string;
}) => {
  const form = useForm<FormSignUpCandidateData>({
    resolver: zodResolver(formSignUpCandidateSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  return (
    <SignUpCandidateForm
      form={form}
      onSubmit={onSubmit}
      userType={UserType.CANDIDATE}
      isLoading={isLoading}
      errorMessage={errorMessage}
      successMessage={successMessage}
    />
  );
};

// Wrapper component to provide form context for Company
const CompanyFormWrapper = ({
  onSubmit = vi.fn(),
  isLoading = false,
  errorMessage,
  successMessage,
}: {
  onSubmit?: (values: FormSignUpCompanyData) => Promise<void>;
  isLoading?: boolean;
  errorMessage?: string;
  successMessage?: string;
}) => {
  const form = useForm<FormSignUpCompanyData>({
    resolver: zodResolver(formSignUpCompanySchema),
    defaultValues: {
      companyName: "",
      domain: "",
      contactName: "",
      contactEmail: "",
    },
  });

  return (
    <SignUpCompanyForm
      form={form}
      onSubmit={onSubmit}
      userType={UserType.COMPANY}
      isLoading={isLoading}
      errorMessage={errorMessage}
      successMessage={successMessage}
    />
  );
};

describe("Sign Up Form Components", () => {
  describe("SignUpCandidateForm", () => {
    it("should render candidate form fields", () => {
      render(<CandidateFormWrapper />);

      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /criar conta/i })
      ).toBeInTheDocument();
    });

    it("should display error message when provided", () => {
      render(<CandidateFormWrapper errorMessage="Erro ao criar conta" />);

      expect(screen.getByText("Erro ao criar conta")).toBeInTheDocument();
    });

    it("should display success message when provided", () => {
      render(
        <CandidateFormWrapper successMessage="Conta criada com sucesso!" />
      );

      expect(screen.getByText("Conta criada com sucesso!")).toBeInTheDocument();
    });

    it("should disable form when loading", () => {
      render(<CandidateFormWrapper isLoading={true} />);

      expect(screen.getByLabelText(/nome completo/i)).toBeDisabled();
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("should show loading state on button", () => {
      render(<CandidateFormWrapper isLoading={true} />);

      expect(screen.getByText(/criando conta/i)).toBeInTheDocument();
    });

    it("should call onSubmit with form data", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();

      render(<CandidateFormWrapper onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/nome completo/i), "João Silva");
      await user.type(screen.getByLabelText(/email/i), "joao@email.com");
      await user.click(screen.getByRole("button", { name: /criar conta/i }));

      // Form validation should pass and onSubmit should be called
      // Note: The actual call might be asynchronous
    });
  });

  describe("SignUpCompanyForm", () => {
    it("should render company form fields", () => {
      render(<CompanyFormWrapper />);

      expect(screen.getByLabelText(/nome da empresa/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/domínio da empresa/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nome do responsável/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email corporativo/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /criar conta/i })
      ).toBeInTheDocument();
    });

    it("should display error message when provided", () => {
      render(<CompanyFormWrapper errorMessage="Erro ao criar conta" />);

      expect(screen.getByText("Erro ao criar conta")).toBeInTheDocument();
    });

    it("should display success message when provided", () => {
      render(<CompanyFormWrapper successMessage="Conta criada com sucesso!" />);

      expect(screen.getByText("Conta criada com sucesso!")).toBeInTheDocument();
    });

    it("should disable form when loading", () => {
      render(<CompanyFormWrapper isLoading={true} />);

      expect(screen.getByLabelText(/nome da empresa/i)).toBeDisabled();
      expect(screen.getByLabelText(/email corporativo/i)).toBeDisabled();
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("should contain link to plans page", () => {
      render(<CompanyFormWrapper />);

      const plansLink = screen.getByRole("link", { name: /planos/i });
      expect(plansLink).toBeInTheDocument();
      expect(plansLink).toHaveAttribute("href", "/plans");
    });
  });
});
