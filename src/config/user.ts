import { UserRole } from "@/types/user";
import {
  BriefcaseBusiness,
  CircleCheck,
  Clock,
  Wallet,
  LayoutDashboard,
  MapPin,
  Pen,
  Timer,
  Tag,
  Users,
  ShoppingCart,
} from "lucide-react";

export interface SidebarItem {
  icon: any;
  label: string;
  path: string;
  roles: UserRole[];
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", roles: [1, 2, 3] },
  { icon: Pen, label: "Item", path: "/items", roles: [1, 2, 3] },
  { icon: MapPin, label: "Branches", path: "/branches", roles: [1] },
  { icon: Tag, label: "Category", path: "/category", roles: [1, 2, 3] },
  { icon: Users, label: "Users", path: "/users", roles: [1] },
  {
    icon: CircleCheck,
    label: "Monthly Procurement",
    path: "/monthly-procurement",
    roles: [1, 2, 3],
  },
  {
    icon: BriefcaseBusiness,
    label: "Event Procurement",
    path: "/event-procurement",
    roles: [1, 2, 3],
  },
  { icon: Wallet, label: "Expenses", path: "/expense", roles: [1, 2] },
  {
    icon: Timer,
    label: "Purchase Record",
    path: "/purchase-records",
    roles: [1, 2, 3],
  },
  { icon: Clock, label: "Activity Log", path: "/logs", roles: [1, 2, 3] },
  { icon: ShoppingCart, label: "Shopee", path: "/shopee", roles: [1] },
];
