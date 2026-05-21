import { useAuth } from "@/context/AuthContext";
import { ROLE_PERMISSIONS, type Permission } from "@/config/permission";

/**
 * Returns permission checkers based on the current user's role.
 *
 * Usage:
 *   const { can } = usePermission();
 *   can(PERMISSIONS.BRANCH_CREATE)           // boolean
 *   canAny(PERMISSIONS.X, PERMISSIONS.Y)     // true if user has at least one
 *   canAll(PERMISSIONS.X, PERMISSIONS.Y)     // true if user has all
 */
export function usePermission() {
  const { user } = useAuth();

  const can = (permission: Permission): boolean => {
    if (!user?.role) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false;
  };

  const canAny = (...permissions: Permission[]): boolean => {
    return permissions.some(can);
  };

  const canAll = (...permissions: Permission[]): boolean => {
    return permissions.every(can);
  };

  return { can, canAny, canAll };
}
