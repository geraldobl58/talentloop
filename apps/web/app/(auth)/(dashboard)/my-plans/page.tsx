"use client";

import { useState } from "react";
import { getCookie } from "cookies-next";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Box, Tab, Paper } from "@mui/material";
import { CreditCard, TrendingUp, History } from "@mui/icons-material";

import { APP_CONSTANTS } from "@/app/libs/constants";
import { TenantType } from "@/app/shared/types/tenant-type";

import {
  CurrentPlanTab,
  UpgradePlanTab,
  PlanHistoryTab,
} from "@/app/features/plans/components";

enum PlanTab {
  CURRENT = "current",
  UPGRADE = "upgrade",
  HISTORY = "history",
}

const MyPlansPage = () => {
  const [activeTab, setActiveTab] = useState(PlanTab.CURRENT);

  // Get tenant type from cookie (set during login)
  const tenantType =
    (getCookie(APP_CONSTANTS.COOKIES.TENANT_TYPE) as TenantType) || "CANDIDATE";

  const handleTabChange = (_event: React.SyntheticEvent, newValue: PlanTab) => {
    setActiveTab(newValue);
  };

  return (
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
          <CurrentPlanTab tenantType={tenantType} />
        </TabPanel>

        <TabPanel value={PlanTab.UPGRADE}>
          <UpgradePlanTab tenantType={tenantType} />
        </TabPanel>

        <TabPanel value={PlanTab.HISTORY}>
          <PlanHistoryTab />
        </TabPanel>
      </TabContext>
    </Paper>
  );
};

export default MyPlansPage;
