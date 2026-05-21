import { apiFetch } from "./api";

export async function updateProcurementItem(
  id: string,
  data: {
    quantity?: number;
    unit_price?: number;
    notes?: string | null;
  },
) {
  const res = await apiFetch(`/procurement-items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateProcurementItemQty(id: string, quantity: number) {
  const res = await apiFetch(`/procurement-items/${id}/qty`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
  return res.data;
}

export async function rejectProcurementItem(id: string) {
  const res = await apiFetch(`/procurement-items/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "rejected" }),
  });
  return res.data;
}

export async function deleteProcurementItem(id: string): Promise<void> {
  await apiFetch(`/procurement-items/${id}`, { method: "DELETE" });
}
