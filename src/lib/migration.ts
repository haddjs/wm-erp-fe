import { apiFetch } from "@/lib/api";

export async function migrateExpenseToPurchaseRecord(
  expenseId: string,
  procurementItemId: string,
) {
  const res = await apiFetch(
    `/expenses/${expenseId}/migrate-to-purchase-record`,
    {
      method: "POST",
      body: JSON.stringify({ procurement_item_id: procurementItemId }),
    },
  );
  return res.data;
}

export async function migratePurchaseRecordToExpense(
  purchaseRecordId: string,
  branchId: string,
  name: string,
) {
  const res = await apiFetch(
    `/purchase-records/${purchaseRecordId}/migrate-to-expense`,
    {
      method: "POST",
      body: JSON.stringify({ branch_id: branchId, name }),
    },
  );
  return res.data;
}
