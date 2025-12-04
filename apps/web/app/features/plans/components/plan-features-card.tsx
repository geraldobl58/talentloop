"use client";

import { memo, useMemo } from "react";
import { Box, Card, CardContent, Typography, Grid } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";

import { PlanInfo } from "../types";

interface PlanFeaturesCardProps {
  plan: PlanInfo;
}

export const PlanFeaturesCard = memo(({ plan }: PlanFeaturesCardProps) => {
  // Memoize computed feature display
  const { usersDisplay, contactsDisplay } = useMemo(
    () => ({
      usersDisplay:
        plan.maxUsers === -1
          ? "Usuários ilimitados"
          : `${plan.maxUsers ?? 0} usuários`,
      contactsDisplay:
        plan.maxContacts === -1
          ? "Contatos ilimitados"
          : `${plan.maxContacts ?? 0} contatos`,
    }),
    [plan.maxUsers, plan.maxContacts]
  );

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
              <Typography variant="body2">{usersDisplay}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box className="flex items-center gap-2">
              <CheckCircle color="success" fontSize="small" />
              <Typography variant="body2">{contactsDisplay}</Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
});

PlanFeaturesCard.displayName = "PlanFeaturesCard";
