import { apiFetch } from "@/lib/api";
import {
  ExpenseListResponse,
  ExpenseDetailResponse,
  CreateExpensePayload,
  UpdateExpensePayload,
} from "@/types/expense";

export async function getExpenses(
  page = 1,
  limit = 10,
): Promise<ExpenseListResponse> {
  return apiFetch(`/expenses?page=${page}&limit=${limit}`);
}

export async function getExpenseById(
  id: string,
): Promise<ExpenseDetailResponse> {
  return apiFetch(`/expenses/${id}`);
}

export async function createExpense(
  payload: CreateExpensePayload,
): Promise<ExpenseDetailResponse> {
  return apiFetch("/expenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateExpense(
  id: string,
  payload: UpdateExpensePayload,
): Promise<ExpenseDetailResponse> {
  return apiFetch(`/expenses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function attachInvoice(
  id: string,
  file_id: string,
): Promise<ExpenseDetailResponse> {
  return apiFetch(`/expenses/${id}/invoice`, {
    method: "PATCH",
    body: JSON.stringify({ file_id }),
  });
}

export async function deleteExpense(id: string): Promise<void> {
  return apiFetch(`/expenses/${id}`, { method: "DELETE" });
}
