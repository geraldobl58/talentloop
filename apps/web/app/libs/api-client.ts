import ky from "ky";
import { getCookie } from "cookies-next";
import { env } from "./env";

const TOKEN_COOKIE_NAME = "access_token";

export const api = ky.create({
  prefixUrl: env.NEXT_PUBLIC_API_URL,
  hooks: {
    beforeRequest: [
      async (request) => {
        let token: string | undefined;

        try {
          // Server-side: try to read from cookies first (required for Server Actions)
          if (typeof window === "undefined") {
            try {
              const { cookies: serverCookies } = await import("next/headers");
              const cookieStore = await serverCookies();
              token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
            } catch {
              // Silently fail on server - token might not be available
              token = undefined;
            }
          }

          // Client-side: get token from cookies
          if (!token && typeof window !== "undefined") {
            token = getCookie(TOKEN_COOKIE_NAME) as string | undefined;
          }

          if (token) {
            request.headers.set("Authorization", `Bearer ${token}`);
          }
        } catch (error) {
          console.error(
            "[API Client] Error setting authorization header:",
            error
          );
        }
      },
    ],
  },
});
