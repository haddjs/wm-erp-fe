import {
  LayoutDashboard,
  Wallet,
  FileClock,
  FileCheck,
  PieChart,
  CheckCircle,
  Edit,
  ShoppingCart,
  FileText,
  ListChecks,
  Send,
  Pencil,
  FilePlus,
} from "lucide-react";

export const SIDEBAR_ITEMS = {
  admin: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: FileText, label: "Ajukan Permintaan", path: "/request" },
    { icon: FileClock, label: "Permintaan Saya", path: "/my-request" },
  ],
  finance: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: FileCheck, label: "Approve RAB", path: "/approve-rab" },
    { icon: Send, label: "Approval Request", path: "/approval-request" },
    { icon: Pencil, label: "Koreksi Budget", path: "/budget-correction" },
    { icon: FileClock, label: "Activity Log", path: "/logs" },
  ],
  ga: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: FilePlus, label: "Input RAB", path: "/input-rab" },
    { icon: ShoppingCart, label: "Expense & Pembelian", path: "/expenses" },
    { icon: FileClock, label: "Activity Log", path: "/logs" },
  ],
};

export const getSidebarItemsByRole = (role: string) => {
  switch (role) {
    case "finance":
      return SIDEBAR_ITEMS.finance;
    case "ga":
      return SIDEBAR_ITEMS.ga;
    case "admin":
      return SIDEBAR_ITEMS.admin;
    default:
      return SIDEBAR_ITEMS.admin; // fallback
  }
};
