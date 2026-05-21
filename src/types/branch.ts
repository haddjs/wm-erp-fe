export interface Branch {
  id: string;
  name: string;
  address: string;
  balance: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface BranchListResponse {
  success: boolean;
  data: Branch[];
  paging: {
    hasNext: boolean;
    currentPage: number;
    totalPages: number;
    totalData: number;
    limit: number;
  };
}
