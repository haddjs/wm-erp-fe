export interface MonthlyProcurement {
  id: string;
  branch_id: string;
  branch_name: string;
  submitter_id: string;
  submitter_name: string;
  approver_name?: string | null;
  period: string;
  status: "pending" | "approved" | "partial" | "rejected";
  total_nominal: number;
  created_at: string;
  updated_at: string;
  procurement_items?: ProcurementItem[];
}

export interface ProcurementItem {
  id: string;
  category_id: string;
  category_name: string;
  item_id?: string | null;
  item_name?: string | null;
  file_id?: string | null;
  code: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  total_budget: number;
  status: "pending" | "purchased" | "completed" | "rejected"; // added rejected
  notes?: string | null;
  completed_by?: string | null;
  completed_at?: string | null;
}
