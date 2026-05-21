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
} from "lucide-react";

export type Role = "admin" | "finance" | "ga";

export interface SidebarItem {
  icon: any;
  label: string;
  path: string;
  roles: Role[];
}

export const SIDEBAR_ITEMS = [
  //Finance Access
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/",
    roles: ["admin", "finance", "ga"],
  },
  {
    icon: Pen,
    label: "Item",
    path: "/items",
    roles: ["admin", "finance"],
  },
  {
    icon: MapPin,
    label: "Branches",
    path: "/branches",
    roles: ["admin"],
  },
  {
    icon: Tag,
    label: "Category",
    path: "/category",
    roles: ["admin"],
  },

  //GA Access
  {
    icon: CircleCheck,
    label: "Monthly Procurement",
    path: "/monthly-procurement",
    roles: ["admin", "finance"],
  },
  {
    icon: BriefcaseBusiness,
    label: "Event Procurement",
    path: "/event-procurement",
    roles: ["admin", "ga"],
  },
  {
    icon: Wallet,
    label: "Expenses",
    path: "/expense",
    roles: ["admin", "ga"],
  },
  {
    icon: Timer,
    label: "Purchase Record",
    path: "/purchase-records",
    roles: ["admin", "ga"],
  },
  {
    icon: Clock,
    label: "Activity Log",
    path: "/logs",
    roles: ["admin", "finance", "ga"],
  },
];
