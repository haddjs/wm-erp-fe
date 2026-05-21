// context/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  getUserProfile,
  isAuthenticated,
  clearAuthData,
} from "@/lib/auth";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Role constants
export const ROLES = {
  ADMIN: "Admin",
  GENERAL_AFFAIRS: "GeneralAffairs",
  FINANCE: "Finance",
} as const;

// Role helper functions
export function isAdmin(user: User | null): boolean {
  return user?.role === ROLES.ADMIN;
}

export function isGeneralAffairs(user: User | null): boolean {
  return user?.role === ROLES.GENERAL_AFFAIRS;
}

export function isFinance(user: User | null): boolean {
  return user?.role === ROLES.FINANCE;
}

export function hasRole(user: User | null, ...roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated()) {
        try {
          const res = await getUserProfile();
          setUser(res.data);
        } catch (error) {
          console.error("Failed to load user:", error);
          clearAuthData();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiLogin({ email, password });

    const userRes = await getUserProfile();
    setUser(userRes.data);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      clearAuthData();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
