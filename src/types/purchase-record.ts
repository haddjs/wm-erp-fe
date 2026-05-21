export type PurchaseRecordStatus = "submitted" | "confirmed" | "rejected";

export interface PurchaseRecord {
  id: string;
  procurement_item_id: string;
  recorded_by: string;
  file_id?: string | null;
  quantity_bought: number;
  actual_unit_price: number;
  actual_total_price: number;
  merchant?: string | null;
  purchased_at: string;
  notes?: string | null;
  status: PurchaseRecordStatus;
  created_at: string;
  updated_at: string;
}

export interface CreatePurchaseRecordPayload {
  procurement_item_id: string;
  file_id?: string | null;
  quantity_bought: number;
  actual_unit_price: number;
  merchant?: string | null;
  purchased_at: string;
  notes?: string | null;
}

export interface UpdatePurchaseRecordPayload {
  file_id?: string | null;
  quantity_bought?: number;
  actual_unit_price?: number;
  merchant?: string | null;
  purchased_at?: string;
  notes?: string | null;
}

export interface PurchaseRecordListResponse {
  data: PurchaseRecord[];
  paging: {
    hasNext: boolean;
    currentPage: number;
    totalPages: number;
    totalData: number;
    limit: number;
  };
}

export interface PurchaseRecord {
  id: string;
  procurement_item_id: string;
  recorded_by: string;
  file_id?: string | null;
  quantity_bought: number;
  actual_unit_price: number;
  actual_total_price: number;
  merchant?: string | null;
  purchased_at: string;
  notes?: string | null;
  status: PurchaseRecordStatus;
  created_at: string;
  updated_at: string;
}

export interface CreatePurchaseRecordPayload {
  procurement_item_id: string;
  file_id?: string | null;
  quantity_bought: number;
  actual_unit_price: number;
  merchant?: string | null;
  purchased_at: string;
  notes?: string | null;
}

export interface UpdatePurchaseRecordPayload {
  file_id?: string | null;
  quantity_bought?: number;
  actual_unit_price?: number;
  merchant?: string | null;
  purchased_at?: string;
  notes?: string | null;
}
