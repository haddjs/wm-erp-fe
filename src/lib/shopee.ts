import { apiFetch } from "./api";
import type { ShopeeImportResult } from "@/types/shopee";

function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function importShopeeOrders(
  from: Date,
  to: Date,
): Promise<ShopeeImportResult> {
  const params = new URLSearchParams({
    from: toISODate(from),
    to: toISODate(to),
  });
  const res = await apiFetch(`/shopee/import?${params}`, {
    method: "POST",
  });
  return res.data ?? res;
}
