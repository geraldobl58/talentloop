"use client";

import { useState } from "react";
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
} from "@mui/material";
import {
  Lock,
  Visibility,
  VisibilityOff,
  Key,
} from "@mui/icons-material";

export const ProfilePasswordTab = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (newPassword.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres");
      return;
    }

    // TODO: Implementar chamada à API
    console.log("Alterar senha");
  };

  const isFormValid =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  return (
    <Box className="space-y-6">
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" className="mb-4 flex items-center gap-2">
            <Key color="primary" />
            Alterar Senha
          </Typography>

          <Alert severity="info" className="mb-4">
            <Typography variant="body2">
              Sua senha deve ter pelo menos 8 caracteres e incluir letras maiúsculas,
              minúsculas, números e caracteres especiais para maior segurança.
            </Typography>
          </Alert>

          <form onSubmit={handleSubmit}>
            <Box className="space-y-4 max-w-md">
              <TextField
                fullWidth
                label="Senha Atual"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="text-gray-400" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                label="Nova Senha"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                helperText="Mínimo de 8 caracteres"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="text-gray-400" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                label="Confirmar Nova Senha"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={confirmPassword.length > 0 && newPassword !== confirmPassword}
                helperText={
                  confirmPassword.length > 0 && newPassword !== confirmPassword
                    ? "As senhas não coincidem"
                    : ""
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="text-gray-400" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {error && (
                <Alert severity="error">{error}</Alert>
              )}
            </Box>
          </form>
        </CardContent>
      </Card>

      <Box className="flex justify-end">
        <Button
          variant="contained"
          disabled={!isFormValid}
          onClick={handleSubmit}
        >
          Alterar Senha
        </Button>
      </Box>
    </Box>
  );
};
