"use client";

import { useState } from "react";

import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Box, Tab, Paper, CircularProgress } from "@mui/material";
import { Person, PhotoCamera, Lock, Security } from "@mui/icons-material";

import { ProfileDataTab } from "@/app/features/profile/components/profile-data-tab";
import { ProfileAvatarTab } from "@/app/features/profile/components/profile-avatar-tab";
import { ProfilePasswordTab } from "@/app/features/profile/components/profile-password-tab";
import { Profile2FATab } from "@/app/features/profile/components/profile-2fa-tab";

import { useProfile } from "@/app/hooks/use-profile";

const ProfilePage = () => {
  const [value, setValue] = useState("1");
  const { data: profile, isLoading } = useProfile();

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={0} className="p-0">
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList
            onChange={handleChange}
            aria-label="Configurações de perfil"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label="Meus Dados"
              value="1"
              icon={<Person />}
              iconPosition="start"
            />
            <Tab
              label="Meu Avatar"
              value="2"
              icon={<PhotoCamera />}
              iconPosition="start"
            />
            <Tab
              label="Alterar Senha"
              value="3"
              icon={<Lock />}
              iconPosition="start"
            />
            <Tab
              label="Autenticação 2FA"
              value="4"
              icon={<Security />}
              iconPosition="start"
            />
          </TabList>
        </Box>

        <TabPanel value="1">
          <ProfileDataTab profile={profile} />
        </TabPanel>

        <TabPanel value="2">
          <ProfileAvatarTab profile={profile} />
        </TabPanel>

        <TabPanel value="3">
          <ProfilePasswordTab />
        </TabPanel>

        <TabPanel value="4">
          <Profile2FATab />
        </TabPanel>
      </TabContext>
    </Paper>
  );
};

export default ProfilePage;
