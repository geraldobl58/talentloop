"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deleteCookie } from "cookies-next";

import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, Lock, Info } from "@mui/icons-material";

import { APP_CONSTANTS } from "@/app/libs/constants";
import {
  changePasswordSchema,
  ChangePasswordInput,
} from "../schemas/change-password";
import { useChangePassword } from "../hooks/use-change-password";

const LOGOUT_DELAY_SECONDS = 5;

export const ProfilePasswordTab = () => {
  const router = useRouter();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutProgress, setLogoutProgress] = useState(0);
  const [logoutCountdown, setLogoutCountdown] = useState(LOGOUT_DELAY_SECONDS);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { mutate: changePassword, isPending } = useChangePassword({
    onSuccess: (data) => {
      if (data.success) {
        setFeedback({
          type: "success",
          message: data.message || "Senha alterada com sucesso!",
        });
        reset();
        setIsLoggingOut(true);
      } else {
        setFeedback({
          type: "error",
          message: data.message || "Erro ao alterar senha",
        });
      }
    },
    onError: (error) => {
      setFeedback({
        type: "error",
        message: error.message || "Erro inesperado ao alterar senha",
      });
    },
  });

  // Handle logout countdown and progress
  useEffect(() => {
    if (!isLoggingOut) return;

    const progressInterval = setInterval(() => {
      setLogoutProgress((prev) => {
        const newProgress = prev + 100 / (LOGOUT_DELAY_SECONDS * 10);
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 100);

    const countdownInterval = setInterval(() => {
      setLogoutCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const logoutTimeout = setTimeout(() => {
      deleteCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN);
      deleteCookie(APP_CONSTANTS.COOKIES.TENANT_TYPE);
      router.push("/auth/sign-in");
    }, LOGOUT_DELAY_SECONDS * 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(countdownInterval);
      clearTimeout(logoutTimeout);
    };
  }, [isLoggingOut, router]);

  const onSubmit = (data: ChangePasswordInput) => {
    setFeedback(null);
    changePassword(data);
  };

  return (
    <Box className="space-y-6">
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" className="mb-4 flex items-center gap-2">
            Alterar Senha
          </Typography>

          <Alert severity="info" className="mb-4" icon={<Info />}>
            <Typography variant="body2">
              Sua senha deve ter pelo menos 8 caracteres e incluir letras
              maiúsculas, minúsculas, números e caracteres especiais para maior
              segurança.
            </Typography>
          </Alert>

          <Alert severity="warning" className="mb-4" icon={<Info />}>
            <Typography variant="body2" className="mt-2 font-medium">
              Após salvar, você será desconectado automaticamente por questões
              de segurança.
            </Typography>
          </Alert>

          {isLoggingOut ? (
            <Box className="text-center py-8">
              <Lock color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" className="mb-2">
                Senha alterada com sucesso!
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                className="mb-4"
              >
                Você será desconectado em {logoutCountdown} segundos...
              </Typography>
              <Box className="max-w-md mx-auto">
                <LinearProgress
                  variant="determinate"
                  value={logoutProgress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                className="mt-2 block"
              >
                Por favor, faça login novamente com sua nova senha.
              </Typography>
            </Box>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box className="space-y-4 max-w-md mx-auto mb-6">
                <Box>
                  <TextField
                    fullWidth
                    label="Senha Atual"
                    type={showCurrentPassword ? "text" : "password"}
                    {...register("currentPassword")}
                    error={!!errors.currentPassword}
                    helperText={errors.currentPassword?.message}
                    disabled={isPending}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                              edge="end"
                              disabled={isPending}
                            >
                              {showCurrentPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Nova Senha"
                    type={showNewPassword ? "text" : "password"}
                    {...register("newPassword")}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword?.message}
                    disabled={isPending}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              edge="end"
                              disabled={isPending}
                            >
                              {showNewPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Confirmar Nova Senha"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    disabled={isPending}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              edge="end"
                              disabled={isPending}
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>

                {feedback && (
                  <Alert severity={feedback.type}>{feedback.message}</Alert>
                )}
              </Box>

              <Box className="flex justify-end">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isValid || isPending}
                  startIcon={
                    isPending ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                >
                  {isPending ? "Alterando..." : "Alterar Senha"}
                </Button>
              </Box>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
