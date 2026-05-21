"use client";

import { useState } from "react";
import { usePurchaseReadyItems } from "../utils/usePurchaseReadyItems";
import type { PurchaseReadyItem } from "@/types/purchase-ready-item";
import PurchaseRecordPanel from "./purchase-record-panel";
import { Package, AlertCircle } from "lucide-react";

type Props = {
  type: "monthly" | "event";
};

const statusConfig = {
  purchased: {
    label: "Ready",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  completed: {
    label: "Completed",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  pending: {
    label: "Pending",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export default function PurchaseReadyTable({ type }: Props) {
  const { items, loading, error, refetch } = usePurchaseReadyItems(type);
  const [selectedItem, setSelectedItem] = useState<PurchaseReadyItem | null>(
    null,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 py-8">{error}</p>;
  }

  return (
    <div className="flex gap-6 min-h-150">
      {/* Table */}
      <div
        className={`flex-1 transition-all ${selectedItem ? "max-w-[60%]" : "w-full"}`}
      >
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {type === "monthly" ? "Period" : "Event"}
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="p-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="p-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">
                      No items ready for purchase
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Items appear here once their procurement is approved
                    </p>
                  </td>
                </tr>
              )}
              {items.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const status =
                  statusConfig[item.status] ?? statusConfig.pending;
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(isSelected ? null : item)}
                    className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${
                      isSelected
                        ? "bg-blue-50 border-l-2 border-l-blue-500"
                        : ""
                    }`}
                  >
                    <td className="p-4">
                      <p className="font-medium text-gray-900">
                        {item.item_name || "Ad-hoc Item"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.category_name} &bull;{" "}
                        <span className="font-mono">{item.code}</span>
                      </p>
                    </td>
                    <td className="p-4 text-gray-600">
                      {type === "monthly"
                        ? new Date(
                            `${item.procurement_label}-01`,
                          ).toLocaleDateString("id-ID", {
                            month: "long",
                            year: "numeric",
                          })
                        : item.procurement_label}
                    </td>
                    <td className="p-4 text-gray-600">{item.branch_name}</td>
                    <td className="p-4 text-right text-gray-700 font-medium">
                      {item.quantity}
                      <span className="text-xs text-gray-400 ml-1">
                        {item.unit}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono text-gray-700">
                      Rp {item.unit_price.toLocaleString("id-ID")}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel */}
      {selectedItem && (
        <div className="w-105 shrink-0">
          <PurchaseRecordPanel
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onSuccess={() => {
              refetch();
              setSelectedItem(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
