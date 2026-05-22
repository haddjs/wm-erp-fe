import type { ProcurementItem } from "./monthly-procurement";

export interface EventProcurement {
  id: string;
  branch_id: string;
  branch_name: string;
  submitter_id: string;
  submitter_name: string;
  approver_name?: string | null;
  name: string;
  date: string;
  status: "pending" | "approved" | "disburse" | "rejected";
  total_nominal: number;
  actual_spending?: number;
  created_at: string;
  updated_at: string;
  procurement_items?: ProcurementItem[];
}

export interface EventProcurementListResponse {
  success: boolean;
  data: EventProcurement[];
  paging: {
    hasNext: boolean;
    currentPage: number;
    totalPages: number;
    totalData: number;
    limit: number;
  };
}
