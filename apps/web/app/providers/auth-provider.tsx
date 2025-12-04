"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getCookie, deleteCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";

import { APP_CONSTANTS } from "@/app/libs/constants";
import { useRefreshToken } from "../features/auth/sign-in/hooks/use-refresh-token";
import { TenantType } from "@/app/shared/types/tenant-type";

interface JwtPayload {
  exp: number;
  sub: string;
  tenantType?: TenantType;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  tenantType: TenantType | null;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Refresh 5 minutos antes de expirar
const REFRESH_THRESHOLD_SECONDS = 5 * 60;

// Intervalo de verificação (1 minuto)
const CHECK_INTERVAL_MS = 60 * 1000;

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tenantType, setTenantType] = useState<TenantType | null>(null);

  const { refresh, isRefreshing } = useRefreshToken({
    onSuccess: (data) => {
      if (data.tenantType) {
        setTenantType(data.tenantType);
      }
    },
    onError: () => {
      setIsAuthenticated(false);
      setTenantType(null);
      router.push(APP_CONSTANTS.ROUTES.SIGN_IN);
    },
  });

  const logout = useCallback(() => {
    deleteCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN);
    deleteCookie(APP_CONSTANTS.COOKIES.TENANT_TYPE);
    setIsAuthenticated(false);
    setTenantType(null);
    router.push(APP_CONSTANTS.ROUTES.SIGN_IN);
  }, [router]);

  const refreshSession = useCallback(async () => {
    await refresh();
  }, [refresh]);

  // Verifica se o token precisa ser renovado
  const checkAndRefreshToken = useCallback(async () => {
    const token = getCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN);

    if (!token || typeof token !== "string") {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;

      // Token expirado
      if (timeUntilExpiry <= 0) {
        logout();
        return;
      }

      // Token válido - atualiza estado
      setIsAuthenticated(true);
      setTenantType(
        (getCookie(APP_CONSTANTS.COOKIES.TENANT_TYPE) as TenantType) ||
          decoded.tenantType ||
          null
      );

      // Token perto de expirar - faz refresh
      if (timeUntilExpiry < REFRESH_THRESHOLD_SECONDS) {
        await refresh();
      }
    } catch {
      // Token inválido
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout, refresh]);

  // Verifica token no mount e periodicamente
  useEffect(() => {
    checkAndRefreshToken();

    const interval = setInterval(checkAndRefreshToken, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [checkAndRefreshToken]);

  // Escuta mudanças de visibilidade da página
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAndRefreshToken();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkAndRefreshToken]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading: isLoading || isRefreshing,
        tenantType,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
