// src/components/auth-provider.tsx
"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthPayload, AuthUser } from "@/lib/auth";
import { fetchMe, logout as apiLogout, refreshAccessToken } from "@/lib/auth";
import { clearSessionHint, setSessionHint } from "@/lib/session-cookie";

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isReady: boolean;
  setSession: (payload: AuthPayload) => void;
  clearSession: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const LEGACY_TOKEN_KEY = "zario.accessToken";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  const applySession = useCallback((newToken: string, newUser: AuthUser) => {
    setSessionHint(newUser.isEmailVerified);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const wipeSession = useCallback(() => {
    clearSessionHint();
    setToken(null);
    setUser(null);
  }, []);

  // Access tokens stay in memory. A secure httpOnly refresh cookie restores the
  // session after reload, so JavaScript-readable browser storage never contains
  // a bearer token.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      // Remove tokens persisted by older frontend releases.
      window.localStorage.removeItem(LEGACY_TOKEN_KEY);
      try {
        const restoreSession = async () => {
          const newToken = await refreshAccessToken();
          const me = await fetchMe(newToken);
          return { newToken, me };
        };
        // Refresh tokens rotate. Serialize restoration across tabs so two page
        // loads cannot attempt to consume the same cookie at the same time.
        const { newToken, me } = navigator.locks
          ? await navigator.locks.request(
              "zario-session-refresh",
              restoreSession,
            )
          : await restoreSession();
        if (!cancelled) applySession(newToken, me);
      } catch {
        if (!cancelled) wipeSession();
      } finally {
        if (!cancelled) setIsReady(true);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [applySession, wipeSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isReady,
      setSession(payload) {
        applySession(payload.accessToken, payload.user);
      },
      clearSession() {
        wipeSession();
      },
      async logout() {
        await apiLogout(token).catch(() => {});
        wipeSession();
      },
      async refreshUser() {
        if (!token) return null;
        try {
          const me = await fetchMe(token);
          setUser(me);
          setSessionHint(me.isEmailVerified);
          return me;
        } catch {
          return null;
        }
      },
    }),
    [applySession, isReady, token, user, wipeSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
