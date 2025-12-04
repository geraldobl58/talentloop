"use client";

import { memo } from "react";
import { UseFormReturn } from "react-hook-form";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Alert,
  Divider,
  Button,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { CheckCircle, Refresh, SecurityOutlined } from "@mui/icons-material";

import { Disable2FAInput } from "../../schemas/profile-2fa";

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

interface TwoFactorEnabledProps {
  feedback: FeedbackState | null;
  disableForm: UseFormReturn<Disable2FAInput>;
  isDisabling: boolean;
  onDisable: (data: Disable2FAInput) => void;
  onOpenRegenerateDialog: () => void;
}

export const TwoFactorEnabled = memo(
  ({
    feedback,
    disableForm,
    isDisabling,
    onDisable,
    onOpenRegenerateDialog,
  }: TwoFactorEnabledProps) => {
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
                  Digite seu código TOTP (6 dígitos) ou código de backup (8
                  caracteres alfanuméricos) para desativar.
                </Typography>
              </Box>

              <Box>
                <form onSubmit={disableForm.handleSubmit(onDisable)}>
                  <Box className="flex flex-col items-center justify-center gap-3 mb-4">
                    <TextField
                      fullWidth
                      label="Código de verificação"
                      placeholder="000000 ou ABCD1234"
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
                          maxLength: 8,
                          style: {
                            textAlign: "center",
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            letterSpacing: "0.3rem",
                            textTransform: "uppercase",
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
                      onClick={onOpenRegenerateDialog}
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
      </Box>
    );
  }
);

TwoFactorEnabled.displayName = "TwoFactorEnabled";
