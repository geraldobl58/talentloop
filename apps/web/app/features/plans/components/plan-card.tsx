"use client";

import { Box, Button, Paper, Typography } from "@mui/material";
import { formatPrice, isFreePlan, PlanOption } from "@/app/libs/plans-data";

// =============================================
// TYPES
// =============================================

interface PlanCardProps {
  plan: PlanOption;
  isSelected: boolean;
  onSelect: () => void;
}

// =============================================
// PLAN CARD COMPONENT
// =============================================

export const PlanCard = ({ plan, isSelected, onSelect }: PlanCardProps) => {
  const isFree = isFreePlan(plan);

  return (
    <Paper
      elevation={isSelected ? 8 : plan.isPopular ? 4 : 2}
      onClick={onSelect}
      sx={{
        p: 3,
        cursor: "pointer",
        border: isSelected
          ? "3px solid"
          : plan.isPopular
            ? "2px solid"
            : "1px solid",
        borderColor: isSelected
          ? "primary.main"
          : plan.isPopular
            ? "primary.light"
            : "grey.300",
        backgroundColor: isSelected ? "primary.50" : "white",
        transition: "all 0.2s ease-in-out",
        position: "relative",
        transform: plan.isPopular ? "scale(1.02)" : "none",
        "&:hover": {
          boxShadow: 8,
          borderColor: "primary.main",
          transform: "scale(1.02)",
        },
      }}
    >
      {/* Popular Badge */}
      {plan.isPopular && (
        <Box
          sx={{
            position: "absolute",
            top: -14,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "primary.main",
            color: "white",
            px: 3,
            py: 0.75,
            borderRadius: 3,
            fontSize: "0.8rem",
            fontWeight: "bold",
            boxShadow: 3,
          }}
        >
          ⭐ Mais Popular
        </Box>
      )}

      {/* Free Badge */}
      {isFree && (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: "secondary.main",
            color: "white",
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            fontSize: "0.7rem",
            fontWeight: "bold",
          }}
        >
          Grátis
        </Box>
      )}

      {/* Plan Name */}
      <Typography
        variant="h5"
        fontWeight="bold"
        textAlign="center"
        mb={1}
        mt={plan.isPopular ? 2 : 0}
      >
        {plan.label}
      </Typography>

      {/* Description */}
      <Typography
        variant="body2"
        color="text.secondary"
        textAlign="center"
        mb={2}
        sx={{ minHeight: 48 }}
      >
        {plan.description}
      </Typography>

      {/* Price */}
      <Box textAlign="center" mb={3}>
        <Typography
          variant="h3"
          fontWeight="bold"
          color={isFree ? "secondary.main" : "primary.main"}
        >
          {formatPrice(plan.price, plan.currency)}
        </Typography>
        {plan.price > 0 && (
          <Typography variant="body2" color="text.secondary">
            por mês
          </Typography>
        )}
      </Box>

      {/* Features */}
      <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, mb: 2 }}>
        {plan.features.map((feature, index) => (
          <Box
            component="li"
            key={index}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
              py: 0.5,
              fontSize: "0.875rem",
            }}
          >
            <Box
              component="span"
              sx={{ color: "success.main", fontWeight: "bold", mt: 0.25 }}
            >
              ✓
            </Box>
            <span>{feature}</span>
          </Box>
        ))}
      </Box>

      {/* Select Button */}
      <Button
        fullWidth
        variant={isSelected ? "contained" : "outlined"}
        color="primary"
        sx={{ mt: 2 }}
      >
        {isSelected ? "✓ Selecionado" : "Selecionar Plano"}
      </Button>
    </Paper>
  );
};
