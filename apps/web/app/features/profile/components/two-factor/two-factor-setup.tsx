"use client";

import { memo, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Paper,
  Tooltip,
  IconButton,
  Button,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import {
  QrCode2,
  PhoneAndroid,
  ContentCopy,
  ShieldOutlined,
  Security,
} from "@mui/icons-material";

import { Enable2FAInput } from "../../schemas/profile-2fa";

const SETUP_STEPS = ["Baixar App", "Escanear QR Code", "Verificar Código"];

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

interface TwoFactorSetupProps {
  feedback: FeedbackState | null;
  qrCode: string;
  secret: string;
  copied: boolean;
  activeStep: number;
  enableForm: UseFormReturn<Enable2FAInput>;
  isEnabling: boolean;
  onSetActiveStep: (step: number) => void;
  onCopySecret: () => void;
  onEnable: (data: Enable2FAInput) => void;
  onCancel: () => void;
}

export const TwoFactorSetup = memo(
  ({
    feedback,
    qrCode,
    secret,
    copied,
    activeStep,
    enableForm,
    isEnabling,
    onSetActiveStep,
    onCopySecret,
    onEnable,
    onCancel,
  }: TwoFactorSetupProps) => {
    // Memoize step click handlers
    const handleStep0Click = useCallback(
      () => onSetActiveStep(0),
      [onSetActiveStep]
    );
    const handleStep1Click = useCallback(
      () => onSetActiveStep(1),
      [onSetActiveStep]
    );
    const handleStep2Click = useCallback(
      () => onSetActiveStep(2),
      [onSetActiveStep]
    );

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
                onClick={handleStep0Click}
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
                onClick={handleStep1Click}
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
                              <IconButton size="small" onClick={onCopySecret}>
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
                onClick={handleStep2Click}
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
                      Digite o código de 6 dígitos (apenas números) exibido no
                      seu aplicativo autenticador.
                    </Typography>

                    <form onSubmit={enableForm.handleSubmit(onEnable)}>
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
                              inputMode: "numeric",
                              pattern: "[0-9]*",
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
              <Button variant="outlined" onClick={onCancel}>
                Cancelar
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }
);

TwoFactorSetup.displayName = "TwoFactorSetup";
