"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { Box, CircularProgress } from "@mui/material";

import { APP_CONSTANTS } from "@/app/libs/constants";
import { CandidateCard } from "@/app/features/dashboard/candidate/components/candidate-card";
import { CompanyCard } from "@/app/features/dashboard/company/components/company-card";

import { TenantType } from "@/app/shared/types/tenant-type";
import { UserType } from "@/app/shared/types/user-type";

import { mapTenantTypeToUserType } from "@/app/libs/map-tenant-type-to-user-type";

const DashboardPage = () => {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tenantType = getCookie(APP_CONSTANTS.COOKIES.TENANT_TYPE) as
      | TenantType
      | undefined;
    const mappedUserType = mapTenantTypeToUserType(tenantType);

    queueMicrotask(() => {
      setUserType(mappedUserType);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !userType) {
    return (
      <Box className="flex items-center justify-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {userType === UserType.CANDIDATE ? <CandidateCard /> : <CompanyCard />}
    </Box>
  );
};

export default DashboardPage;
