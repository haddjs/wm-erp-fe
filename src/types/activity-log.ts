export interface ActivityLogResponse {
  id: string;
  type: string;
  title: string;
  description: string;
  amount: number;
  nominal: number;
  created_at: string;
  email: string;
  branch_name: string;
}

export interface ActivityLogPaging {
  hasNext: boolean;
  currentPage: number;
  totalPages: number;
  totalData: number;
  limit: number;
}

export interface ActivityLogListResponse {
  success: boolean;
  message: string;
  data: ActivityLogResponse[];
  paging: ActivityLogPaging;
  code: number;
}
