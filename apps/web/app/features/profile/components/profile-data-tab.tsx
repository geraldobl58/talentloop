"use client";

import { memo, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
} from "@mui/material";

import { UserProfile } from "@/app/hooks/use-profile";
import { formatDate } from "@/app/libs/plans-data";

interface ProfileDataTabProps {
  profile: UserProfile | undefined;
}

export const ProfileDataTab = memo(({ profile }: ProfileDataTabProps) => {
  // Memoize computed values
  const { accountTypeLabel, accountTypeColor, planName, planExpiryDate } =
    useMemo(
      () => ({
        accountTypeLabel:
          profile?.tenantType === "COMPANY" ? "Empresa" : "Candidato",
        accountTypeColor:
          profile?.tenantType === "COMPANY"
            ? ("info" as const)
            : ("primary" as const),
        planName: profile?.tenant?.plan || "FREE",
        planExpiryDate: formatDate(profile?.tenant?.planExpiresAt ?? null),
      }),
      [
        profile?.tenantType,
        profile?.tenant?.plan,
        profile?.tenant?.planExpiresAt,
      ]
    );

  const tenantInfoTitle = useMemo(
    () =>
      profile?.tenantType === "COMPANY"
        ? "Informações da Empresa"
        : "Informações da Conta",
    [profile?.tenantType]
  );

  if (!profile) return null;

  return (
    <Box className="space-y-6">
      {/* Informações Pessoais */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" className="mb-4 flex items-center gap-2">
            Informações Pessoais
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" color="text.secondary">
                {profile.name}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" color="text.secondary">
                {profile.email}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Informações do Tenant/Empresa */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" className="mb-4 flex items-center gap-2">
            {tenantInfoTitle}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box className="flex items-center gap-2 mb-2">
                <Typography variant="body2" color="text.secondary">
                  Tipo de Conta:
                </Typography>
                <Chip
                  label={accountTypeLabel}
                  color={accountTypeColor}
                  size="small"
                />
              </Box>
            </Grid>

            {profile.role && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Box className="flex items-center gap-2 mb-2">
                  <Typography variant="body2" color="text.secondary">
                    Função:
                  </Typography>
                  <Chip label={profile.role} size="small" variant="outlined" />
                </Box>
                {profile.roleDescription && (
                  <Typography variant="caption" color="text.secondary">
                    {profile.roleDescription}
                  </Typography>
                )}
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <Divider className="my-2" />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box className="flex items-center gap-2">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    ID do Tenant
                  </Typography>
                  <Typography variant="body2" className="font-mono text-xs">
                    {profile.tenantId}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box className="flex items-center gap-2">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    ID do Usuário
                  </Typography>
                  <Typography variant="body2" className="font-mono text-xs">
                    {profile.userId}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Informações do Plano */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" className="mb-4 flex items-center gap-2">
            Informações do Plano
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box className="flex items-center gap-2">
                <Typography variant="body2" color="text.secondary">
                  Plano Atual:
                </Typography>
                <Chip label={planName} color="info" size="small" />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box className="flex items-center gap-2">
                <Typography variant="body2" color="text.secondary">
                  Expira em:
                </Typography>
                <Typography variant="body2">{planExpiryDate}</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
});

ProfileDataTab.displayName = "ProfileDataTab";
