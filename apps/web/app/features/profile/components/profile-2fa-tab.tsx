"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import {
  Security,
  QrCode2,
  CheckCircle,
  PhoneAndroid,
  ContentCopy,
  Refresh,
  Close,
  Info,
  ShieldOutlined,
  SecurityOutlined,
} from "@mui/icons-material";

import {
  enable2FASchema,
  disable2FASchema,
  Enable2FAInput,
  Disable2FAInput,
} from "../schemas/profile-2fa";
import { useProfile2FA } from "../hooks/use-profile-2FA";

// User-initiated states that override the query-derived state
type UserAction = "setup" | "success" | "regenerate-success" | null;

const SETUP_STEPS = ["Baixar App", "Escanear QR Code", "Verificar Código"];

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

  // Loading state
  if (viewState === "loading" || isLoadingStatus) {
    return (
      <Box className="space-y-6">
        <Card variant="outlined">
          <CardContent>
            <Box className="flex flex-col items-center justify-center py-8">
              <CircularProgress size={40} />
              <Typography
                variant="body2"
                color="text.secondary"
                className="mt-4"
              >
                Verificando status da autenticação...
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Success state - show backup codes after enabling
  if (viewState === "success" || viewState === "regenerate-success") {
    const isRegenerate = viewState === "regenerate-success";

    return (
      <Box className="space-y-6">
        <Card variant="outlined">
          <CardContent>
            <Alert severity="success" className="mb-4" icon={<CheckCircle />}>
              <Typography variant="body2" fontWeight="medium">
                {isRegenerate
                  ? "Códigos de backup regenerados com sucesso!"
                  : "2FA ativado com sucesso!"}
              </Typography>
              {isRegenerate && (
                <Typography variant="caption" display="block">
                  Os códigos anteriores não funcionarão mais.
                </Typography>
              )}
            </Alert>

            <Box className="mb-4">
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                className="mb-2"
              >
                {isRegenerate
                  ? "Seus novos códigos de backup"
                  : "Códigos de backup"}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                className="mb-3"
              >
                Salve esses códigos em um local seguro. Use-os para acessar sua
                conta se perder acesso ao seu app de autenticação.
              </Typography>

              <Paper variant="outlined" className="p-4 bg-gray-50">
                <Box className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      fontFamily="monospace"
                      className="text-center py-1"
                    >
                      {code}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            </Box>

            <Box className="flex justify-end">
              <Button variant="contained" onClick={handleFinishSuccess}>
                Concluído
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // 2FA enabled state
  if (viewState === "enabled") {
    return (
      <Box className="space-y-6">
        <Card variant="outlined">
          <CardContent>
            <Box className="flex items-center gap-3 mb-4">
              <CheckCircle color="success" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6">
                  Autenticação de Dois Fatores Ativada
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sua conta está protegida com autenticação adicional
                </Typography>
              </Box>
            </Box>

            <Alert severity="success" className="mb-4">
              A autenticação de dois fatores está ativada para sua conta. Você
              precisará inserir um código do seu aplicativo autenticador toda
              vez que fizer login.
            </Alert>

            {feedback && (
              <Alert severity={feedback.type} className="mb-4">
                {feedback.message}
              </Alert>
            )}

            <Divider className="my-4" />

            <Box className="space-y-4 mb-4 mt-4">
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  className="mb-2"
                >
                  Desativar autenticação em dois fatores
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  className="mb-3"
                >
                  Digite seu código TOTP (6 dígitos) ou código de backup (6-8
                  caracteres) para desativar.
                </Typography>
              </Box>

              <Box>
                <form onSubmit={disableForm.handleSubmit(handleDisable2FA)}>
                  <Box className="flex flex-col items-center justify-center gap-3  mb-4">
                    <TextField
                      fullWidth
                      label="Código de verificação"
                      placeholder="000000"
                      {...disableForm.register("token")}
                      error={!!disableForm.formState.errors.token}
                      helperText={disableForm.formState.errors.token?.message}
                      disabled={isDisabling}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SecurityOutlined color="action" />
                            </InputAdornment>
                          ),
                        },
                        htmlInput: {
                          maxLength: 6,
                          style: {
                            textAlign: "center",
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            letterSpacing: "0.5rem",
                          },
                        },
                      }}
                    />
                  </Box>

                  <Box className="flex gap-3">
                    <Button
                      type="submit"
                      variant="outlined"
                      color="error"
                      disabled={!disableForm.formState.isValid || isDisabling}
                      startIcon={
                        isDisabling ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : null
                      }
                    >
                      {isDisabling ? "Desativando..." : "Desativar 2FA"}
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={() => setShowRegenerateDialog(true)}
                      startIcon={<Refresh />}
                    >
                      Regenerar Códigos
                    </Button>
                  </Box>
                </form>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Regenerate backup codes dialog */}
        <Dialog
          open={showRegenerateDialog}
          onClose={() => {
            setShowRegenerateDialog(false);
            regenerateForm.reset();
            setFeedback(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle className="flex items-center justify-between">
            <Box className="flex items-center gap-2">
              <Refresh color="primary" />
              Regenerar códigos de backup
            </Box>
            <IconButton
              onClick={() => {
                setShowRegenerateDialog(false);
                regenerateForm.reset();
                setFeedback(null);
              }}
              size="small"
            >
              <Close />
            </IconButton>
          </DialogTitle>

          <form
            onSubmit={regenerateForm.handleSubmit(handleRegenerateBackupCodes)}
          >
            <DialogContent>
              <Alert severity="warning" className="mb-4">
                Os códigos de backup antigos não funcionarão mais após a
                regeneração.
              </Alert>

              <Typography
                variant="body2"
                color="text.secondary"
                className="mb-3"
              >
                Digite seu código TOTP (6 dígitos) ou código de backup (6-8
                caracteres) para confirmar.
              </Typography>

              <TextField
                fullWidth
                label="Código de verificação"
                placeholder="000000"
                {...regenerateForm.register("token")}
                error={!!regenerateForm.formState.errors.token}
                helperText={regenerateForm.formState.errors.token?.message}
                disabled={isRegenerating}
                inputProps={{ maxLength: 8 }}
              />

              {feedback && (
                <Alert severity={feedback.type} className="mt-3">
                  {feedback.message}
                </Alert>
              )}
            </DialogContent>

            <DialogActions>
              <Button
                onClick={() => {
                  setShowRegenerateDialog(false);
                  regenerateForm.reset();
                  setFeedback(null);
                }}
                disabled={isRegenerating}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!regenerateForm.formState.isValid || isRegenerating}
                startIcon={
                  isRegenerating ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
              >
                {isRegenerating ? "Regenerando..." : "Regenerar"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    );
  }

  // Setup state - show QR code and verification
  if (viewState === "setup") {
    return (
      <Box className="space-y-6">
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" className="mb-4 flex items-center gap-2">
              Configurar Autenticação de Dois Fatores
            </Typography>

            <Stepper activeStep={activeStep} className="mb-6 mt-6">
              {SETUP_STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {feedback && (
              <Alert severity={feedback.type} className="mb-4">
                {feedback.message}
              </Alert>
            )}

            <Box className="space-y-4">
              {/* Step 1: Download App */}
              <Paper
                variant="outlined"
                className={`p-4 ${activeStep === 0 ? "border-primary" : ""}`}
                onClick={() => setActiveStep(0)}
                sx={{ cursor: "pointer" }}
              >
                <Box className="flex items-start gap-4">
                  <PhoneAndroid
                    color={activeStep === 0 ? "primary" : "disabled"}
                    sx={{ fontSize: 40 }}
                  />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      1. Baixe um aplicativo autenticador
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Recomendamos o Google Authenticator, Microsoft
                      Authenticator ou Authy. Disponíveis gratuitamente na App
                      Store e Google Play.
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Step 2: Scan QR Code */}
              <Paper
                variant="outlined"
                className={`p-4 ${activeStep === 1 ? "border-primary" : ""}`}
                onClick={() => setActiveStep(1)}
                sx={{ cursor: "pointer" }}
              >
                <Box className="flex items-start gap-4">
                  <QrCode2
                    color={activeStep === 1 ? "primary" : "disabled"}
                    sx={{ fontSize: 40 }}
                  />
                  <Box className="flex-1">
                    <Typography variant="subtitle1" fontWeight="bold">
                      2. Escaneie o QR Code
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      className="mb-4"
                    >
                      Use o aplicativo autenticador para escanear o código
                      abaixo.
                    </Typography>

                    {qrCode && (
                      <Box className="flex flex-col items-center">
                        <Box
                          component="img"
                          src={qrCode}
                          alt="QR Code para 2FA"
                          className="w-48 h-48 border rounded-lg"
                        />

                        <Box className="mt-4 text-center">
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Ou digite o código manualmente:
                          </Typography>
                          <Box className="flex items-center justify-center gap-2 mt-1">
                            <Typography
                              variant="body2"
                              fontFamily="monospace"
                              className="bg-gray-100 px-3 py-1 rounded"
                            >
                              {secret}
                            </Typography>
                            <Tooltip title={copied ? "Copiado!" : "Copiar"}>
                              <IconButton
                                size="small"
                                onClick={handleCopySecret}
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Paper>

              {/* Step 3: Verify Code */}
              <Paper
                variant="outlined"
                className={`p-4 ${activeStep === 2 ? "border-primary" : ""}`}
                onClick={() => setActiveStep(2)}
                sx={{ cursor: "pointer" }}
              >
                <Box className="flex items-start gap-4">
                  <ShieldOutlined
                    color={activeStep === 2 ? "primary" : "disabled"}
                    sx={{ fontSize: 40 }}
                  />
                  <Box className="flex-1">
                    <Typography variant="subtitle1" fontWeight="bold">
                      3. Insira o código de verificação
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      className="mb-4"
                    >
                      Digite o código de 6 dígitos exibido no seu aplicativo
                      autenticador.
                    </Typography>

                    <form onSubmit={enableForm.handleSubmit(handleEnable2FA)}>
                      <Box className="flex flex-col justify-center mt-8 gap-3">
                        <TextField
                          fullWidth
                          label="Código de Verificação"
                          placeholder="000000"
                          {...enableForm.register("token")}
                          error={!!enableForm.formState.errors.token}
                          helperText={
                            enableForm.formState.errors.token?.message
                          }
                          disabled={isEnabling}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Security color="action" />
                                </InputAdornment>
                              ),
                            },
                            htmlInput: {
                              maxLength: 6,
                              style: {
                                textAlign: "center",
                                fontSize: "1.5rem",
                                fontWeight: "bold",
                                letterSpacing: "0.5rem",
                              },
                            },
                          }}
                        />
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={!enableForm.formState.isValid || isEnabling}
                          startIcon={
                            isEnabling ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : null
                          }
                        >
                          {isEnabling ? "Verificando..." : "Verificar e Ativar"}
                        </Button>
                      </Box>
                    </form>
                  </Box>
                </Box>
              </Paper>
            </Box>

            <Divider className="my-4" />

            <Box className="flex justify-end mt-8">
              <Button variant="outlined" onClick={handleCancelSetup}>
                Cancelar
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Disabled state - show enable button
  return (
    <Box className="space-y-6">
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" className="mb-4 flex items-center gap-2">
            <Security color="primary" />
            Autenticação de Dois Fatores (2FA)
          </Typography>

          <Alert severity="info" className="mb-4" icon={<Info />}>
            <Typography variant="body2">
              Melhore significativamente a segurança da sua conta habilitando a
              autenticação em dois fatores. Ao ativar, você precisará inserir um
              código do seu aplicativo autenticador além da senha ao fazer
              login.
            </Typography>
          </Alert>

          {feedback && (
            <Alert severity={feedback.type} className="mb-4">
              {feedback.message}
            </Alert>
          )}

          <Box className="text-center space-y-6 py-6">
            <Box>
              <Security
                sx={{ fontSize: 80, color: "grey.400" }}
                className="mb-4"
              />
              <Typography variant="h6" className="mb-2">
                Proteja sua conta
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                className="mb-4"
              >
                Adicione uma camada extra de segurança à sua conta usando um
                aplicativo autenticador.
              </Typography>
            </Box>
            <Box>
              <Button
                variant="contained"
                onClick={handleStartSetup}
                disabled={isGenerating}
                startIcon={
                  isGenerating ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Security />
                  )
                }
              >
                {isGenerating
                  ? "Gerando código..."
                  : "Ativar Autenticação de Dois Fatores"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
