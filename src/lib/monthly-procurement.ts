import { apiFetch } from "./api";
import type {
  MonthlyProcurement,
  ProcurementItem,
} from "@/types/monthly-procurement";

export async function getMonthlyProcurements(params: {
  branch_id?: string;
  page?: number;
  limit?: number;
}): Promise<MonthlyProcurement[]> {
  const searchParams = new URLSearchParams();
  if (params.branch_id) searchParams.append("branchId", params.branch_id);
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  const url = `/monthly-procurements?${searchParams.toString()}`;
  const res = await apiFetch(url);
  return res.data ?? [];
}

export async function getMonthlyProcurementById(
  id: string,
): Promise<MonthlyProcurement> {
  const res = await apiFetch(`/monthly-procurements/${id}`);
  return {
    ...res.data,
    items: res.data.procurement_items ?? [],
  };
}

export async function createMonthlyProcurement(data: {
  branch_id: string;
  period: string;
  items: {
    category_id: string;
    item_id: string | null;
    code: string;
    quantity: number;
    unit: string;
    unit_price: number;
    notes?: string;
  }[];
}): Promise<MonthlyProcurement> {
  const res = await apiFetch("/monthly-procurements", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res.data;
}

export async function updateMonthlyProcurementStatus(
  id: string,
  status: "pending" | "approved" | "partial" | "rejected",
): Promise<MonthlyProcurement> {
  const res = await apiFetch(`/monthly-procurements/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return res.data;
}

export async function updateProcurementItemStatus(
  id: string,
  status: "pending" | "purchased" | "completed",
): Promise<ProcurementItem> {
  const res = await apiFetch(`/procurement-items/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return res.data;
}

export async function reviseMonthlyProcurement(
  id: string,
  body?: {
    period?: string;
    items?: {
      category_id: string;
      item_id: string;
      code: string;
      quantity: number;
      unit: string;
      unit_price: number;
      notes?: string;
    }[];
  },
) {
  const res = await apiFetch(`/monthly-procurements/${id}/revise`, {
    method: "PATCH",
    body: JSON.stringify(body ?? {}),
  });
  return res.data;
}
