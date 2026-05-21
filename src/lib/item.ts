import { apiFetch } from "./api";
import type { ItemResponse } from "@/types/item";

export async function getItems(params?: {
  category_id?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: ItemResponse[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.category_id)
    searchParams.append("category_id", params.category_id);
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const url = `/items${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const res = await apiFetch(url);
  return res;
}

export async function getItemById(id: string): Promise<ItemResponse> {
  const res = await apiFetch(`/items/${id}`);
  return res.data || res;
}

export async function createItem(data: {
  category_id: string;
  name: string;
  variant?: string;
  description?: string;
  unit?: string;
}): Promise<ItemResponse> {
  const res = await apiFetch("/items", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export async function updateItem(
  id: string,
  data: {
    category_id?: string;
    name?: string;
    code?: string;
    variant?: string | null;
    description?: string | null;
    unit?: string | null;
  },
): Promise<ItemResponse> {
  const payload = {
    ...(data.category_id ? { category_id: data.category_id } : {}),
    ...(data.name ? { name: data.name } : {}),
    ...(data.code ? { code: data.code } : {}),
    ...(data.variant !== undefined ? { variant: data.variant || "" } : {}),
    ...(data.description !== undefined
      ? { description: data.description || "" }
      : {}),
    ...(data.unit !== undefined ? { unit: data.unit || "" } : {}),
  };

  const res = await apiFetch(`/items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data || res;
}

export async function deleteItem(id: string): Promise<void> {
  await apiFetch(`/items/${id}`, {
    method: "DELETE",
  });
}
