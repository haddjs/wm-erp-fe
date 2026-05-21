export interface ExpenseResponse {
  id: string;
  recorded_by: string;
  branch_id: string | null;
  item_id: string | null;
  file_id: string | null;
  order_id: string | null;
  name: string;
  date: string;
  amount: number;
  nominal: number;
  merchant: string | null;
}

export interface ExpenseListResponse {
  success: boolean;
  message: string;
  data: ExpenseResponse[];
  paging: {
    hasNext: boolean;
    currentPage: number;
    totalPages: number;
    totalData: number;
    limit: number;
  };
  code: number;
}

export interface ExpenseDetailResponse {
  success: boolean;
  data: ExpenseResponse;
}

export interface CreateExpensePayload {
  branch_id?: string;
  item_id?: string;
  file_id?: string;
  order_id?: string;
  merchant?: string;
  name: string;
  date: string;
  amount: number;
  nominal: number;
}

export interface UpdateExpensePayload {
  branch_id?: string | null;
  item_id?: string | null;
  file_id?: string | null;
  order_id?: string | null;
  merchant?: string | null;
  name?: string;
  date?: string;
  amount?: number;
  nominal?: number;
}
