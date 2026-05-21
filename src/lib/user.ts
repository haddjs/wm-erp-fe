import type {
  User,
  AdminCreateUserPayload,
  UpdateNamePayload,
  UpdatePasswordPayload,
  PaginatedUsers,
} from "@/types/user";
import { apiFetch } from "./api";

export async function getAllUsers(
  page = 1,
  limit = 10,
): Promise<PaginatedUsers> {
  return apiFetch(`/users?page=${page}&limit=${limit}`);
}

export async function createUser(
  payload: AdminCreateUserPayload,
): Promise<{ data: User }> {
  return apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateName(
  payload: UpdateNamePayload,
): Promise<{ data: null }> {
  return apiFetch("/users/name", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updatePassword(
  payload: UpdatePasswordPayload,
): Promise<{ data: null }> {
  return apiFetch("/users/password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteAccount(): Promise<{ data: null }> {
  return apiFetch("/users/account", {
    method: "DELETE",
  });
}
