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

const TOKEN_KEY = "zario.accessToken";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  const applySession = useCallback((newToken: string, newUser: AuthUser) => {
    window.localStorage.setItem(TOKEN_KEY, newToken);
    setSessionHint(newUser.isEmailVerified);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const wipeSession = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    clearSessionHint();
    setToken(null);
    setUser(null);
  }, []);

  // Bootstrap on first load: try stored token, fall back to silent refresh.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const stored = window.localStorage.getItem(TOKEN_KEY);

      if (stored) {
        try {
          const me = await fetchMe(stored);
          if (!cancelled) applySession(stored, me);
          if (!cancelled) setIsReady(true);
          return;
        } catch {
          // fall through to refresh
        }
      }

      try {
        const newToken = await refreshAccessToken();
        const me = await fetchMe(newToken);
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
