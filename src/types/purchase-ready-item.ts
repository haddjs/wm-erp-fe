import type { ProcurementItem } from "./monthly-procurement";

export interface PurchaseReadyItem extends ProcurementItem {
  procurement_id: string;
  procurement_type: "monthly" | "event";
  procurement_label: string; // period string or event name
  branch_name: string;
}
