import { apiFetch } from "./api";
import type { Branch, BranchListResponse } from "@/types/branch";

export async function getBranches(
  page = 1,
  limit = 10,
): Promise<BranchListResponse> {
  return await apiFetch(`/branches?page=${page}&limit=${limit}`);
}

export async function getBranchById(id: string): Promise<Branch> {
  const res = await apiFetch(`/branches/${id}`);
  return res.data || res;
}

export async function createBranch(data: {
  name: string;
  address: string;
  balance?: number;
}): Promise<Branch> {
  const res = await apiFetch("/branches", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res.data || res;
}

export async function updateBranch(
  id: string,
  data: {
    name?: string;
    address?: string;
    balance?: number;
  },
): Promise<Branch> {
  const res = await apiFetch(`/branches/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  return res.data || res;
}

export async function deleteBranch(id: string): Promise<void> {
  const res = await apiFetch(`/branches/${id}`, {
    method: "DELETE",
  });
}
