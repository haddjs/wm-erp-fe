import { useAuth } from "@/context/AuthContext";
import { SIDEBAR_ITEMS } from "@/config/user";

export function useFilteredSidebar() {
  const { user } = useAuth();

  if (!user) return [];

  return (SIDEBAR_ITEMS.filter ?? [])((item) => item.roles.includes(user.role));
}
