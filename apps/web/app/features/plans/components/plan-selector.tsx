"use client";

import { Box, Typography, Chip } from "@mui/material";
import { Check as CheckIcon, Star as StarIcon } from "@mui/icons-material";

import { UserType } from "@/app/shared/types";
import {
  PlanOption,
  PlanType,
  getPlansForUserType,
  formatPrice,
  isFreePlan,
} from "@/app/libs/plans-data";

// =============================================
// TYPES
// =============================================

interface PlanSelectorProps {
  userType: UserType;
  value: PlanType;
  onChange: (value: PlanType) => void;
  disabled?: boolean;
}

interface CompactPlanCardProps {
  plan: PlanOption;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

// =============================================
// COMPACT PLAN CARD (for forms)
// =============================================

const CompactPlanCard = ({
  plan,
  isSelected,
  onSelect,
  disabled,
}: CompactPlanCardProps) => {
  const isFree = isFreePlan(plan);

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-200 text-left w-full
        ${
          isSelected
            ? "border-blue-500 bg-blue-50 shadow-md"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {/* Badges */}
      <Box className="absolute top-0 right-0 flex gap-1">
        {plan.isPopular && (
          <Chip
            icon={<StarIcon sx={{ fontSize: 14 }} />}
            label="Popular"
            size="small"
            color="primary"
            sx={{
              borderTopRightRadius: 10,
              borderBottomLeftRadius: 10,
              borderTopLeftRadius: 0,
              borderBottomRightRadius: 0,
              fontSize: "0.65rem",
              height: 22,
            }}
          />
        )}
        {isFree && (
          <Chip
            label="Grátis"
            size="small"
            color="success"
            sx={{
              borderTopRightRadius: plan.isPopular ? 0 : 10,
              borderBottomLeftRadius: 10,
              borderTopLeftRadius: 0,
              borderBottomRightRadius: 0,
              fontSize: "0.65rem",
              height: 22,
            }}
          />
        )}
      </Box>

      {/* Selected indicator */}
      {isSelected && (
        <Box className="absolute top-3 left-3">
          <Box className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
            <CheckIcon sx={{ fontSize: 14, color: "white" }} />
          </Box>
        </Box>
      )}

      {/* Plan info */}
      <Box className={`${isSelected ? "pl-7" : ""} mt-2`}>
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          className="text-gray-900"
        >
          {plan.label}
        </Typography>

        <Typography
          variant="body2"
          className="text-gray-500 mt-1 line-clamp-2 min-h-10"
        >
          {plan.description}
        </Typography>

        {/* Price */}
        <Box className="mt-3 flex items-baseline gap-1">
          <Typography
            variant="h5"
            fontWeight="bold"
            className={isFree ? "text-green-600" : "text-gray-900"}
          >
            {formatPrice(plan.price, plan.currency)}
          </Typography>
          {plan.price > 0 && (
            <Typography variant="body2" className="text-gray-500">
              /mês
            </Typography>
          )}
        </Box>

        {/* Top features preview */}
        <Box className="mt-3 space-y-1">
          {plan.features.slice(0, 3).map((feature, index) => (
            <Box key={index} className="flex items-center gap-2">
              <CheckIcon sx={{ fontSize: 14, color: "green" }} />
              <Typography variant="caption" className="text-gray-600">
                {feature}
              </Typography>
            </Box>
          ))}
          {plan.features.length > 3 && (
            <Typography variant="caption" className="text-blue-600 font-medium">
              +{plan.features.length - 3} mais recursos
            </Typography>
          )}
        </Box>
      </Box>
    </button>
  );
};

// =============================================
// PLAN SELECTOR COMPONENT
// =============================================

export const PlanSelector = ({
  userType,
  value,
  onChange,
  disabled = false,
}: PlanSelectorProps) => {
  const plans = getPlansForUserType(
    userType === UserType.CANDIDATE ? "candidate" : "company"
  );

  return (
    <Box className="mt-4">
      <Typography
        variant="subtitle2"
        fontWeight="bold"
        className="text-gray-700 mb-3"
      >
        Selecione um Plano
      </Typography>

      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {plans.map((plan) => (
          <CompactPlanCard
            key={plan.value}
            plan={plan}
            isSelected={value === plan.value}
            onSelect={() => onChange(plan.value)}
            disabled={disabled}
          />
        ))}
      </Box>

      {/* Info text */}
      <Box className="mt-3">
        <Typography variant="caption" className="text-gray-500">
          {value === "FREE"
            ? "Comece gratuitamente e faça upgrade quando quiser."
            : "Você será redirecionado para o pagamento seguro."}
        </Typography>
      </Box>
    </Box>
  );
};
