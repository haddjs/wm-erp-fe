"use client";

import { useEffect, useState } from "react";
import { getBranches } from "@/lib/branch";
import { getItems } from "@/lib/item";
import { Branch } from "@/types/branch";
import { ItemResponse } from "@/types/item";

export function useExpenseOptions() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getBranches(), getItems()])
      .then(([branchRes, itemRes]) => {
        setBranches(branchRes.data);
        setItems(itemRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return { branches, items, loading };
}
