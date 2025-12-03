"use client";

import { useState } from "react";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Box, Tab, Paper, CircularProgress } from "@mui/material";
import { Person, PhotoCamera, Lock, Security } from "@mui/icons-material";

import { useProfile } from "@/app/hooks/use-profile";

import {
  ProfileDataTab,
  ProfileAvatarTab,
  ProfilePasswordTab,
  Profile2FATab,
} from "@/app/features/profile/components";

enum ProfileTab {
  DATA = "data",
  AVATAR = "avatar",
  PASSWORD = "password",
  TWO_FA = "2fa",
}

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState(ProfileTab.DATA);
  const { data: profile, isLoading } = useProfile();

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: ProfileTab
  ) => {
    setActiveTab(newValue);
  };

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={0}>
      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList
            onChange={handleTabChange}
            aria-label="Configurações de perfil"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label="Meus Dados"
              value={ProfileTab.DATA}
              icon={<Person />}
              iconPosition="start"
            />
            <Tab
              label="Meu Avatar"
              value={ProfileTab.AVATAR}
              icon={<PhotoCamera />}
              iconPosition="start"
            />
            <Tab
              label="Alterar Senha"
              value={ProfileTab.PASSWORD}
              icon={<Lock />}
              iconPosition="start"
            />
            <Tab
              label="Autenticação 2FA"
              value={ProfileTab.TWO_FA}
              icon={<Security />}
              iconPosition="start"
            />
          </TabList>
        </Box>

        <TabPanel value={ProfileTab.DATA}>
          <ProfileDataTab profile={profile} />
        </TabPanel>

        <TabPanel value={ProfileTab.AVATAR}>
          <ProfileAvatarTab profile={profile} />
        </TabPanel>

        <TabPanel value={ProfileTab.PASSWORD}>
          <ProfilePasswordTab />
        </TabPanel>

        <TabPanel value={ProfileTab.TWO_FA}>
          <Profile2FATab />
        </TabPanel>
      </TabContext>
    </Paper>
  );
};

export default ProfilePage;
