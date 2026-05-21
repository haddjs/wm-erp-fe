import { apiFetch } from "./api";
import type {
  EventProcurementListResponse,
  EventProcurement,
} from "@/types/event-procurement";

export async function getEventProcurements(params: {
  branch_id?: string;
  page?: number;
  limit?: number;
}): Promise<EventProcurement[]> {
  const searchParams = new URLSearchParams();
  if (params.branch_id) searchParams.append("branchId", params.branch_id);
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  const url = `/event-procurements?${searchParams.toString()}`;
  const res = await apiFetch(url);
  return res.data;
}

export async function getEventProcurementById(
  id: string,
): Promise<{ data: EventProcurement }> {
  const res = await apiFetch(`/event-procurements/${id}`);
  return res;
}

export async function createEventProcurement(data: {
  branch_id: string;
  name: string;
  date: string;
  items: {
    category_id: string;
    item_id: string | null;
    code: string;
    quantity: number;
    unit: string;
    unit_price: number;
    notes?: string | null;
  }[];
}): Promise<EventProcurement> {
  const res = await apiFetch("/event-procurements", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateEventProcurementStatus(
  id: string,
  status: "pending" | "approved" | "rejected" | "disburse",
): Promise<EventProcurement> {
  const res = await apiFetch(`/event-procurements/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  return res.data;
}

export async function updateProcurementItemStatus(
  id: string,
  status: "pending" | "purchased" | "completed",
): Promise<EventProcurement> {
  const res = await apiFetch(`/procurement-items/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  return res.data;
}

export async function reviseEventProcurement(
  id: string,
  body?: {
    name?: string;
    date?: string;
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
  const res = await apiFetch(`/event-procurements/${id}/revise`, {
    method: "PATCH",
    body: JSON.stringify(body ?? {}),
  });
  return res.data;
}
