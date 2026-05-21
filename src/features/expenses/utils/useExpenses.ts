"use client";

import { useEffect, useState } from "react";
import { getExpenses } from "@/lib/expense";
import { ExpenseResponse } from "@/types/expense";

export function useExpenses(page = 1, limit = 10) {
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [paging, setPaging] = useState<{
    hasNext: boolean;
    currentPage: number;
    totalPages: number;
    totalData: number;
    limit: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = () => {
    setLoading(true);
    getExpenses(page, limit)
      .then((res) => {
        setExpenses(res.data ?? []);
        setPaging(res.paging ?? []);
      })
      .catch((err) => setError(err?.message || "Failed to load expenses"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExpenses();
  }, [page, limit]);

  return { expenses, paging, loading, error, refetch: fetchExpenses };
}
