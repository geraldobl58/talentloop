"use client";

import { Box, Card, CardContent, Typography, Grid } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";

import { PlanInfo } from "../types";

interface PlanFeaturesCardProps {
  plan: PlanInfo;
}

export const PlanFeaturesCard = ({ plan }: PlanFeaturesCardProps) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" className="mb-4">
          Recursos do Plano
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box className="flex items-center gap-2">
              {plan.hasAPI ? (
                <CheckCircle color="success" fontSize="small" />
              ) : (
                <Cancel color="disabled" fontSize="small" />
              )}
              <Typography variant="body2">Acesso à API</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box className="flex items-center gap-2">
              <CheckCircle color="success" fontSize="small" />
              <Typography variant="body2">
                {plan.maxUsers === -1
                  ? "Usuários ilimitados"
                  : `${plan.maxUsers ?? 0} usuários`}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box className="flex items-center gap-2">
              <CheckCircle color="success" fontSize="small" />
              <Typography variant="body2">
                {plan.maxContacts === -1
                  ? "Contatos ilimitados"
                  : `${plan.maxContacts ?? 0} contatos`}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
