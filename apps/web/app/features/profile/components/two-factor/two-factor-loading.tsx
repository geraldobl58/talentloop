import { memo } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";

export const TwoFactorLoading = memo(() => {
  return (
    <Box className="space-y-6">
      <Card variant="outlined">
        <CardContent>
          <Box className="flex flex-col items-center justify-center py-8">
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" className="mt-4">
              Verificando status da autenticação...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
});

TwoFactorLoading.displayName = "TwoFactorLoading";
