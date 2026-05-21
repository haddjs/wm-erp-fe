import { useAuth } from "@/context/AuthContext";
import { hasRole, ROLES } from "@/context/AuthContext";

export function useRoles() {
  const { user } = useAuth();

  return {
    isAdmin: hasRole(user, ROLES.ADMIN),
    isGA: hasRole(user, ROLES.GA),
    isFinance: hasRole(user, ROLES.FINANCE),
    can: (...roles: Parameters<typeof hasRole>[1][]) => hasRole(user, ...roles),
  };
}
