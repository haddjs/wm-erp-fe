"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { ROUTE_ROLES } from "@/config/routeRoles";
import type { UserRole } from "@/types/user";

interface RoleGuardProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export function RoleGuard({ children, roles }: RoleGuardProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  const allowedRoles = roles ?? ROUTE_ROLES[pathname];

  if (!allowedRoles) {
    return <AccessDenied />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}

function AccessDenied() {
  return (
    <div className="p-8">
      <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
        ⚠️ Access Denied
        <p className="text-sm mt-1 text-red-600">
          You don't have permission to view this page.
        </p>
      </div>
    </div>
  );
}
