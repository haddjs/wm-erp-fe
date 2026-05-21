export interface DashboardBranch {
  id: string;
  name: string;
  balance: number;
}

export interface DashboardItemSummary {
  total: number;
  pending: number;
  purchased: number;
  completed: number;
}

export interface DashboardSummary {
  total_budget: number;
  total_actual_spending: number;
}

export interface DashboardMP {
  id: string;
  period: string;
  status: "pending" | "approved" | "partial" | "rejected";
  total_nominal: number;
  actual_spending: number;
  items: DashboardItemSummary;
}

export interface DashboardEP {
  id: string;
  name: string;
  date: string;
  status: "pending" | "approved" | "disburse" | "rejected";
  total_nominal: number;
  actual_spending: number;
  items: DashboardItemSummary;
}

export interface MPDashboardResponse {
  branch?: DashboardBranch;
  monthly_procurement?: DashboardMP;
  monthly_procurements?: DashboardMP[];
  summary: DashboardSummary;
}

export interface EPDashboardResponse {
  branch?: DashboardBranch;
  event_procurement?: DashboardEP;
  summary: DashboardSummary;
}
