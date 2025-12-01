"use client";

import { Box, Tab } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import { UserType, USER_TYPE_CONFIGS } from "../types";

interface AuthTabsProps {
  value: UserType;
  onChange: (userType: UserType) => void;
  children: React.ReactNode;
}

export const AuthTabs = ({ value, onChange, children }: AuthTabsProps) => {
  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    onChange(newValue as UserType);
  };

  return (
    <Box sx={{ typography: "body1" }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="auth tabs" centered>
            <Tab
              label={USER_TYPE_CONFIGS[UserType.CANDIDATE].label}
              value={UserType.CANDIDATE}
              disabled={UserType.COMPANY === value}
            />
            <Tab
              label={USER_TYPE_CONFIGS[UserType.COMPANY].label}
              value={UserType.COMPANY}
              disabled={UserType.CANDIDATE === value}
            />
          </TabList>
        </Box>
        {children}
      </TabContext>
    </Box>
  );
};

interface AuthTabPanelProps {
  value: UserType;
  children: React.ReactNode;
}

export const AuthTabPanel = ({ value, children }: AuthTabPanelProps) => {
  return (
    <TabPanel value={value} sx={{ px: 0 }}>
      {children}
    </TabPanel>
  );
};
