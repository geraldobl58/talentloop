"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
  lazy,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getCookie } from "cookies-next";

import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import {
  Box,
  Tab,
  Paper,
  Alert,
  CircularProgress,
  Snackbar,
  Skeleton,
} from "@mui/material";
import {
  CreditCard,
  TrendingUp,
  History,
  CheckCircle,
} from "@mui/icons-material";
import { RoleType } from "@talentloop/roles";

import { APP_CONSTANTS } from "@/app/libs/constants";
import { TenantType } from "@/app/shared/types/tenant-type";
import { useVerifyCheckout } from "@/app/features/plans/hooks";
import { RoleGuard, useRoleCheck } from "@/app/components/role-guard";

import { PlanTab } from "@/app/enums/plan-tab";

const CurrentPlanTab = lazy(() =>
  import("@/app/features/plans/components").then((mod) => ({
    default: mod.CurrentPlanTab,
  }))
);
const UpgradePlanTab = lazy(() =>
  import("@/app/features/plans/components").then((mod) => ({
    default: mod.UpgradePlanTab,
  }))
);
const PlanHistoryTab = lazy(() =>
  import("@/app/features/plans/components").then((mod) => ({
    default: mod.PlanHistoryTab,
  }))
);

const TabSkeleton = () => (
  <Box className="space-y-4 p-4">
    <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
    <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} />
  </Box>
);

function CheckoutVerifier({
  onVerificationStart,
  onVerificationComplete,
}: {
  onVerificationStart: () => void;
  onVerificationComplete: (
    message: string,
    severity: "success" | "error" | "info"
  ) => void;
}) {
  const hasProcessedRef = useRef(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const { mutate: verifyCheckout } = useVerifyCheckout({
    onSuccess: (data) => {
      localStorage.removeItem("stripe_checkout_session_id");
      if (data.success) {
        onVerificationComplete(
          data.message || `Plano atualizado para ${data.plan}!`,
          "success"
        );
      } else {
        onVerificationComplete(
          data.message || "Erro ao verificar checkout",
          "error"
        );
      }
      router.replace("/my-plans");
    },
    onError: (error) => {
      localStorage.removeItem("stripe_checkout_session_id");
      onVerificationComplete(
        error.message || "Erro ao verificar checkout",
        "error"
      );
      router.replace("/my-plans");
    },
  });

  useEffect(() => {
    if (hasProcessedRef.current) return;

    const success = searchParams.get("success");
    const cancelled = searchParams.get("cancelled");
    const sessionId = localStorage.getItem("stripe_checkout_session_id");

    if (success === "true" && sessionId) {
      hasProcessedRef.current = true;
      onVerificationStart();
      verifyCheckout(sessionId);
    } else if (success === "true" && !sessionId) {
      hasProcessedRef.current = true;
      onVerificationComplete(
        "Pagamento confirmado! Seu plano será atualizado em instantes.",
        "info"
      );
      router.replace("/my-plans");
    } else if (cancelled === "true") {
      hasProcessedRef.current = true;
      localStorage.removeItem("stripe_checkout_session_id");
      onVerificationComplete("Checkout cancelado", "info");
      router.replace("/my-plans");
    }
  }, [
    searchParams,
    verifyCheckout,
    router,
    onVerificationStart,
    onVerificationComplete,
  ]);

  return null;
}

const MyPlansPage = () => {
  const [activeTab, setActiveTab] = useState(PlanTab.CURRENT);
  const [verifyingCheckout, setVerifyingCheckout] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "info" });

  // Get role check info
  const { isCompany, tenantType: profileTenantType } = useRoleCheck();

  // Get tenant type from cookie or profile
  const tenantType =
    profileTenantType ||
    (getCookie(APP_CONSTANTS.COOKIES.TENANT_TYPE) as TenantType) ||
    "CANDIDATE";

  const handleVerificationStart = useCallback(() => {
    setVerifyingCheckout(true);
  }, []);

  const handleVerificationComplete = useCallback(
    (message: string, severity: "success" | "error" | "info") => {
      setVerifyingCheckout(false);
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: PlanTab) => {
    setActiveTab(newValue);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Show loading overlay while verifying checkout
  if (verifyingCheckout) {
    return (
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Box sx={{ textAlign: "center" }}>
          <Box
            component="h3"
            sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
          >
            <CheckCircle color="success" />
            Verificando pagamento...
          </Box>
          <Box component="p" sx={{ color: "text.secondary" }}>
            Estamos sincronizando sua assinatura. Por favor, aguarde.
          </Box>
        </Box>
      </Paper>
    );
  }

  // Content to render
  const plansContent = (
    <>
      <Suspense fallback={null}>
        <CheckoutVerifier
          onVerificationStart={handleVerificationStart}
          onVerificationComplete={handleVerificationComplete}
        />
      </Suspense>

      <Paper elevation={0}>
        <TabContext value={activeTab}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList
              onChange={handleTabChange}
              aria-label="Configurações do plano"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab
                label="Plano Atual"
                value={PlanTab.CURRENT}
                icon={<CreditCard />}
                iconPosition="start"
              />
              <Tab
                label="Fazer Upgrade"
                value={PlanTab.UPGRADE}
                icon={<TrendingUp />}
                iconPosition="start"
              />
              <Tab
                label="Histórico"
                value={PlanTab.HISTORY}
                icon={<History />}
                iconPosition="start"
              />
            </TabList>
          </Box>

          <TabPanel value={PlanTab.CURRENT}>
            <Suspense fallback={<TabSkeleton />}>
              <CurrentPlanTab tenantType={tenantType} />
            </Suspense>
          </TabPanel>

          <TabPanel value={PlanTab.UPGRADE}>
            <Suspense fallback={<TabSkeleton />}>
              <UpgradePlanTab tenantType={tenantType} />
            </Suspense>
          </TabPanel>

          <TabPanel value={PlanTab.HISTORY}>
            <Suspense fallback={<TabSkeleton />}>
              <PlanHistoryTab />
            </Suspense>
          </TabPanel>
        </TabContext>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );

  // For companies, require OWNER or ADMIN role to access billing
  if (isCompany) {
    return (
      <RoleGuard
        allowedTenantTypes={["COMPANY"]}
        allowedRoles={[RoleType.OWNER, RoleType.ADMIN]}
        fallbackRoute="/dashboard"
        deniedMessage="Apenas proprietários e administradores podem gerenciar planos."
      >
        {plansContent}
      </RoleGuard>
    );
  }

  // For candidates, no role restriction needed
  return plansContent;
};

export default MyPlansPage;
