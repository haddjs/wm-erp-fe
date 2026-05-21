import { apiFetch } from "./api";
import type { Category } from "@/types/category";

export async function getCategories(params?: {
  page?: number;
  limit?: number;
}): Promise<{ data: Category[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const url = `/categories${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const res = await apiFetch(url);
  return res;
}

export async function getCategoryById(id: string): Promise<Category> {
  const res = await apiFetch(`/categories/${id}`);
  return res.data || res;
}

export async function createCategory(data: {
  name: string;
  code?: string;
  description?: string;
}): Promise<Category> {
  const payload = {
    name: data.name,
    ...(data.code?.trim() ? { code: data.code.trim() } : {}),
    ...(data.description?.trim()
      ? { description: data.description.trim() }
      : {}),
  };

  const res = await apiFetch("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data || res;
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    code?: string;
    description?: string;
  },
): Promise<Category> {
  const payload = {
    ...(data.name?.trim() ? { name: data.name.trim() } : {}),
    ...(data.code?.trim() ? { code: data.code.trim() } : {}),
    ...(data.description !== undefined
      ? { description: data.description }
      : {}),
  };

  const res = await apiFetch(`/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data || res;
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await apiFetch(`/categories/${id}`, {
    method: "DELETE",
  });

  return res;
}
