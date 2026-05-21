import { apiFetch } from "./api";

import type {
  CreatePurchaseRecordPayload,
  PurchaseRecord,
  PurchaseRecordStatus,
  UpdatePurchaseRecordPayload,
} from "@/types/purchase-record";

export async function getPurchaseRecordsByItemId(
  procurementItemId: string,
  page?: number,
  limit?: number,
): Promise<{ data: PurchaseRecord[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (page) searchParams.append("page", page.toString());
  if (limit) searchParams.append("limit", limit.toString());

  const queryString = searchParams.toString();
  const url = `/purchase-records/by-item/${procurementItemId}${queryString ? `?${queryString}` : ""}`;

  const res = await apiFetch(url);
  return {
    data: res.data,
    total: res.paging?.totalData || 0,
  };
}

export async function getPurchaseRecordById(
  id: string,
): Promise<PurchaseRecord> {
  const res = await apiFetch(`/purchase-records/${id}`);
  return res.data;
}

export async function createPurchaseRecord(
  data: CreatePurchaseRecordPayload,
): Promise<PurchaseRecord> {
  const res = await apiFetch("/purchase-records", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updatePurchaseRecord(
  id: string,
  data: UpdatePurchaseRecordPayload,
): Promise<PurchaseRecord> {
  const res = await apiFetch(`/purchase-records/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  return res.data;
}

export async function updatePurchaseRecordStatus(
  id: string,
  status: PurchaseRecordStatus,
  notes?: string,
): Promise<PurchaseRecord> {
  const res = await apiFetch(`/purchase-records/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, ...(notes ? { notes } : {}) }),
  });

  return res.data;
}

export async function attachInvoiceToPurchaseRecord(
  id: string,
  fileId: string,
): Promise<PurchaseRecord> {
  const res = await apiFetch(`/purchase-records/${id}/invoice`, {
    method: "PATCH",
    body: JSON.stringify({ file_id: fileId }),
  });

  return res.data;
}

export async function deletePurchaseRecord(id: string): Promise<void> {
  await apiFetch(`/purchase-records/${id}`, {
    method: "DELETE",
  });
}
