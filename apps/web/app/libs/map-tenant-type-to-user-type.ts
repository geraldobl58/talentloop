// ============================================
// Helper: Map TenantType (from API) to UserType (for UI)

import { TenantType } from "../shared/types/tenant-type";
import { UserType } from "../shared/types/user-type";

// ============================================
export const mapTenantTypeToUserType = (
  tenantType: TenantType | undefined
): UserType => {
  if (tenantType === "COMPANY") {
    return UserType.COMPANY;
  }
  return UserType.CANDIDATE;
};
