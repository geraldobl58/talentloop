import { Box, Typography } from "@mui/material";

import { UserType } from "@/app/shared/types/user-type";
import { PlanType, getPlansForUserType } from "@/app/libs/plans-data";
import { CompactPlanCard } from "./plan-compact-card";

interface PlanSelectorProps {
  userType: UserType;
  value: PlanType;
  onChange: (value: PlanType) => void;
  disabled?: boolean;
}

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
