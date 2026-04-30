"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  signup as signupRequest,
} from "@/lib/api";

import type { AuthUser, UserRole } from "@/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  signup: (email: string, password: string) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const roleHomePaths: Record<UserRole, string> = {
  BORROWER: "/borrower",
  SALES: "/sales",
  SANCTION: "/sanction",
  DISBURSEMENT: "/disbursement",
  COLLECTION: "/collection",
  ADMIN: "/admin",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");


  async function refreshUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setStatus(currentUser ? "authenticated" : "unauthenticated");
      return currentUser;
    } catch {
      setUser(null);
      setStatus("unauthenticated");
      return null;
    }
  }

  // 🔐 Login
  async function login(email: string, password: string) {
    const currentUser = await loginRequest(email, password);
    setUser(currentUser);
    setStatus(currentUser ? "authenticated" : "unauthenticated");
    return currentUser;
  }

  
  async function signup(email: string, password: string) {
    await signupRequest(email, password);

    const currentUser = await getCurrentUser();

    setUser(currentUser);
    setStatus(currentUser ? "authenticated" : "unauthenticated");

    return currentUser;
  }

  // 🚪 Logout
  async function logout() {
    await logoutRequest();
    setUser(null);
    setStatus("unauthenticated");
  }

  // 🔄 Initial session check
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const currentUser = await getCurrentUser();

        if (cancelled) return;

        setUser(currentUser);
        setStatus(currentUser ? "authenticated" : "unauthenticated");
      } catch {
        if (cancelled) return;

        setUser(null);
        setStatus("unauthenticated");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        login,
        signup, 
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 🔌 Hook
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}