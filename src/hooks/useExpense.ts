import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { isMock } from "@/lib/config";
import { getMockExpenses, addMockExpense } from "@/mocks/expense";

export const useExpense = () => {
  const [loading, setLoading] = useState(false);

  const createExpense = async (payload: any) => {
    try {
      setLoading(true);
      if (isMock) {
        await new Promise((res) => setTimeout(res, 400));
        addMockExpense(payload);
        return { success: true, data: payload };
      }
      return await apiFetch("/expenses", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } finally {
      setLoading(false);
    }
  };

  const getExpense = async () => {
    if (isMock) {
      await new Promise((res) => setTimeout(res, 200));
      return { success: true, data: getMockExpenses() };
    }
    return apiFetch("/expenses", {});
  };

  return { createExpense, getExpense, loading };
};
