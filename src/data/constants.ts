import {
  LayoutDashboard,
  Wallet,
  FileClock,
  PieChart,
  FileCheck,
  Receipt,
  PencilLine,
  Trash2,
  ShoppingBasket,
  RefreshCw,
  CalendarDays,
  LucideIcon,
} from "lucide-react";

export const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Wallet, label: "Budgets", path: "/budgets" },
  { icon: FileClock, label: "Activity Log", path: "/logs" },
  { icon: FileCheck, label: "Approvals", path: "/approvals" },
  { icon: PieChart, label: "Reports", path: "/reports" },
];

export const LOG_ACTION = {
  expense_recorded: { label: "Expense Recorded" },
  expense_updated: { label: "Expense Updated" },
  expense_deleted: { label: "Expense Deleted" },
  monthly_procurement_created: { label: "Monthly Procurement Created" },
  monthly_procurement_status_changed: { label: "Monthly Procurement Updated" },
  event_procurement_created: { label: "Event Procurement Created" },
  event_procurement_status_changed: { label: "Event Procurement Updated" },
} as const;

export type ActionType = keyof typeof LOG_ACTION;

export type LogConfig = {
  icon: LucideIcon;
  className: string;
  label: string;
};

export const LOG_CONFIG: Record<string, LogConfig> = {
  // Expense
  expense_recorded: {
    icon: Receipt,
    className: "bg-green-100 text-green-600",
    label: "Expense Recorded",
  },
  expense_updated: {
    icon: PencilLine,
    className: "bg-yellow-100 text-yellow-600",
    label: "Expense Updated",
  },
  expense_deleted: {
    icon: Trash2,
    className: "bg-red-100 text-red-600",
    label: "Expense Deleted",
  },

  // Monthly Procurement
  monthly_procurement_created: {
    icon: ShoppingBasket,
    className: "bg-blue-100 text-blue-600",
    label: "Monthly Procurement Created",
  },
  monthly_procurement_status_changed: {
    icon: RefreshCw,
    className: "bg-purple-100 text-purple-600",
    label: "Monthly Procurement Updated",
  },

  // Event Procurement
  event_procurement_created: {
    icon: CalendarDays,
    className: "bg-orange-100 text-orange-600",
    label: "Event Procurement Created",
  },
  event_procurement_status_changed: {
    icon: RefreshCw,
    className: "bg-indigo-100 text-indigo-600",
    label: "Event Procurement Updated",
  },
};
