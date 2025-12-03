"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Button,
  CircularProgress,
} from "@mui/material";
import { Security, Info } from "@mui/icons-material";

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

interface TwoFactorDisabledProps {
  feedback: FeedbackState | null;
  isGenerating: boolean;
  onStartSetup: () => void;
}

export const TwoFactorDisabled = ({
  feedback,
  isGenerating,
  onStartSetup,
}: TwoFactorDisabledProps) => {
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
                onClick={onStartSetup}
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
