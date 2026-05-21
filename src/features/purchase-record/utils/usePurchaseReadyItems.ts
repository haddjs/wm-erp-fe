// features/purchase-records/utils/usePurchaseReadyItems.ts
"use client";
import { useEffect, useState } from "react";
import { getMonthlyProcurements } from "@/lib/monthly-procurement";
import { getEventProcurements } from "@/lib/event-procurement";
import type { MonthlyProcurement } from "@/types/monthly-procurement";
import type { EventProcurement } from "@/types/event-procurement";
import type { PurchaseReadyItem } from "@/types/purchase-ready-item";

export function usePurchaseReadyItems(type: "monthly" | "event") {
  const [items, setItems] = useState<PurchaseReadyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, [type]);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const readyItems: PurchaseReadyItem[] = [];

      if (type === "monthly") {
        const procurements: MonthlyProcurement[] = await getMonthlyProcurements(
          { page: 1, limit: 100 },
        );
        const approved = (procurements ?? []).filter(
          (p) => p.status === "approved" || p.status === "partial",
        );
        for (const p of approved) {
          (p.procurement_items ?? [])
            .filter((item) => item.status === "purchased")
            .forEach((item) => {
              readyItems.push({
                ...item,
                procurement_id: p.id,
                procurement_type: "monthly",
                procurement_label: p.period,
                branch_name: p.branch_name,
              });
            });
        }
      } else {
        // getEventProcurements returns EventProcurement[] directly, no .data wrapper
        const procurements: EventProcurement[] = await getEventProcurements({
          page: 1,
          limit: 100,
        });
        const approved = (procurements ?? []).filter(
          (p) => p.status === "approved" || p.status === "disburse",
        );
        for (const p of approved) {
          (p.procurement_items ?? [])
            .filter((item) => item.status === "purchased")
            .forEach((item) => {
              readyItems.push({
                ...item,
                procurement_id: p.id,
                procurement_type: "event",
                procurement_label: p.name,
                branch_name: p.branch_name,
              });
            });
        }
      }

      setItems(readyItems);
    } catch (err: any) {
      setError(err?.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  return { items, loading, error, refetch: fetchItems };
}
