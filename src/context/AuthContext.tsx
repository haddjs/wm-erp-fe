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
import type { UserRole } from "@/types/user";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export const ROLES = {
  ADMIN: 1,
  GA: 2,
  FINANCE: 3,
} as const satisfies Record<string, UserRole>;

const ROLE_MAP: Record<string, UserRole> = {
  Admin: 1,
  "General Affairs": 2,
  Finance: 3,
};

export function isAdmin(user: User | null): boolean {
  return user?.role === ROLES.ADMIN;
}

export function isGeneralAffairs(user: User | null): boolean {
  return user?.role === ROLES.GA;
}

export function isFinance(user: User | null): boolean {
  return user?.role === ROLES.FINANCE;
}

export function hasRole(user: User | null, ...roles: UserRole[]): boolean {
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
          setUser({ ...res.data, role: ROLE_MAP[res.data.role] ?? 1 });
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
    await apiLogin({ email, password });
    const userRes = await getUserProfile();
    setUser({ ...userRes.data, role: ROLE_MAP[userRes.data.role] ?? 1 });
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
