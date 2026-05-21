export type ShopeeOrderReconciliation = {
  order_id: string;
  total_amount: number;
  total_nominal: number;
  reconciled: boolean;
  difference: number;
};

export type ShopeeImportPurchaseRecords = {
  count: number;
  flagged: number;
  data: import("./purchase-record").PurchaseRecord[];
};

export type ShopeeImportExpenses = {
  count: number;
  flagged: number;
  data: import("./expense").ExpenseResponse[];
};

export type ShopeeImportResult = {
  purchase_records: ShopeeImportPurchaseRecords;
  expenses: ShopeeImportExpenses;
  reconciliation: ShopeeOrderReconciliation[];
  errors?: string[];
};
