"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Paper,
  Button,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";

interface TwoFactorSuccessProps {
  backupCodes: string[];
  isRegenerate?: boolean;
  onFinish: () => void;
}

export const TwoFactorSuccess = ({
  backupCodes,
  isRegenerate = false,
  onFinish,
}: TwoFactorSuccessProps) => {
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
            <Typography variant="subtitle1" fontWeight="bold" className="mb-2">
              {isRegenerate
                ? "Seus novos códigos de backup"
                : "Códigos de backup"}
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mb-3">
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
            <Button variant="contained" onClick={onFinish}>
              Concluído
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
