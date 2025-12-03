"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  enable2FASchema,
  disable2FASchema,
  Enable2FAInput,
  Disable2FAInput,
} from "../schemas/profile-2fa";
import { useProfile2FA } from "../hooks/use-profile-2FA";

import {
  TwoFactorLoading,
  TwoFactorSuccess,
  TwoFactorDisabled,
  TwoFactorEnabled,
  TwoFactorSetup,
  RegenerateBackupDialog,
} from "./two-factor";

// User-initiated states that override the query-derived state
type UserAction = "setup" | "success" | "regenerate-success" | null;

export const Profile2FATab = () => {
  // User action state - overrides query-derived state when set
  const [userAction, setUserAction] = useState<UserAction>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    isEnabled,
    isLoadingStatus,
    generate,
    isGenerating,
    enable,
    isEnabling,
    disable,
    isDisabling,
    regenerate,
    isRegenerating,
  } = useProfile2FA();

  // Enable 2FA form
  const enableForm = useForm<Enable2FAInput>({
    resolver: zodResolver(enable2FASchema),
    mode: "onChange",
    defaultValues: { token: "" },
  });

  // Disable 2FA form
  const disableForm = useForm<Disable2FAInput>({
    resolver: zodResolver(disable2FASchema),
    mode: "onChange",
    defaultValues: { token: "" },
  });

  // Regenerate backup codes form
  const regenerateForm = useForm<Disable2FAInput>({
    resolver: zodResolver(disable2FASchema),
    mode: "onChange",
    defaultValues: { token: "" },
  });

  // Derive view state: user action takes precedence, then query state
  const getViewState = () => {
    if (userAction) return userAction;
    if (isLoadingStatus) return "loading";
    if (isEnabled) return "enabled";
    return "disabled";
  };

  const viewState = getViewState();

  /**
   * Handle start 2FA setup
   */
  const handleStartSetup = async () => {
    setFeedback(null);

    try {
      const result = await generate();

      if (result.success && result.data) {
        setQrCode(result.data.qrCode);
        setSecret(result.data.secret);
        setActiveStep(0);
        setUserAction("setup");
      } else {
        setFeedback({
          type: "error",
          message: result.message || "Erro ao gerar código 2FA",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Erro inesperado ao gerar código 2FA",
      });
    }
  };

  /**
   * Handle copy secret to clipboard
   */
  const handleCopySecret = async () => {
    if (secret) {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /**
   * Handle enable 2FA
   */
  const handleEnable2FA = async (data: Enable2FAInput) => {
    setFeedback(null);

    try {
      const result = await enable(data.token);

      if (result.success && result.data) {
        setBackupCodes(result.data.backupCodes);
        setUserAction("success");
        enableForm.reset();
      } else {
        setFeedback({
          type: "error",
          message: result.message || "Código inválido",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Erro inesperado ao ativar 2FA",
      });
    }
  };

  /**
   * Handle disable 2FA
   */
  const handleDisable2FA = async (data: Disable2FAInput) => {
    setFeedback(null);

    try {
      const result = await disable(data.token);

      if (result.success) {
        setFeedback({
          type: "success",
          message: "2FA desativado com sucesso",
        });
        setUserAction(null);
        disableForm.reset();
      } else {
        setFeedback({
          type: "error",
          message: result.message || "Código inválido",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Erro inesperado ao desativar 2FA",
      });
    }
  };

  /**
   * Handle regenerate backup codes
   */
  const handleRegenerateBackupCodes = async (data: Disable2FAInput) => {
    setFeedback(null);

    try {
      const result = await regenerate(data.token);

      if (result.success && result.data) {
        setBackupCodes(result.data.backupCodes);
        setShowRegenerateDialog(false);
        setUserAction("regenerate-success");
        regenerateForm.reset();
      } else {
        setFeedback({
          type: "error",
          message: result.message || "Erro ao regenerar códigos de backup",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Erro inesperado ao regenerar códigos de backup",
      });
    }
  };

  /**
   * Handle cancel setup
   */
  const handleCancelSetup = () => {
    setUserAction(null);
    setActiveStep(0);
    setQrCode("");
    setSecret("");
    enableForm.reset();
    setFeedback(null);
  };

  /**
   * Handle finish success
   */
  const handleFinishSuccess = () => {
    setUserAction(null);
    setBackupCodes([]);
    setFeedback(null);
  };

  /**
   * Handle close regenerate dialog
   */
  const handleCloseRegenerateDialog = () => {
    setShowRegenerateDialog(false);
    setFeedback(null);
  };

  // Loading state
  if (viewState === "loading" || isLoadingStatus) {
    return <TwoFactorLoading />;
  }

  // Success state - show backup codes after enabling
  if (viewState === "success" || viewState === "regenerate-success") {
    return (
      <TwoFactorSuccess
        backupCodes={backupCodes}
        isRegenerate={viewState === "regenerate-success"}
        onFinish={handleFinishSuccess}
      />
    );
  }

  // 2FA enabled state
  if (viewState === "enabled") {
    return (
      <>
        <TwoFactorEnabled
          feedback={feedback}
          disableForm={disableForm}
          isDisabling={isDisabling}
          onDisable={handleDisable2FA}
          onOpenRegenerateDialog={() => setShowRegenerateDialog(true)}
        />
        <RegenerateBackupDialog
          open={showRegenerateDialog}
          feedback={feedback}
          regenerateForm={regenerateForm}
          isRegenerating={isRegenerating}
          onClose={handleCloseRegenerateDialog}
          onRegenerate={handleRegenerateBackupCodes}
        />
      </>
    );
  }

  // Setup state - show QR code and verification
  if (viewState === "setup") {
    return (
      <TwoFactorSetup
        feedback={feedback}
        qrCode={qrCode}
        secret={secret}
        copied={copied}
        activeStep={activeStep}
        enableForm={enableForm}
        isEnabling={isEnabling}
        onSetActiveStep={setActiveStep}
        onCopySecret={handleCopySecret}
        onEnable={handleEnable2FA}
        onCancel={handleCancelSetup}
      />
    );
  }

  // Disabled state - show enable button
  return (
    <TwoFactorDisabled
      feedback={feedback}
      isGenerating={isGenerating}
      onStartSetup={handleStartSetup}
    />
  );
};
