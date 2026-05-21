"use client";

import { useState } from "react";
import { updateProcurementItemStatus } from "@/lib/monthly-procurement";
import type { ProcurementItem } from "@/types/monthly-procurement";
import { CheckIcon, FileTextIcon } from "lucide-react";
import PurchaseRecordModal from "@/features/purchase-record/components/purchase-record-modal";

export default function ProcurementTable({
  items = [],
  onRefresh,
  canApprove = true,
  type = "monthly",
}: {
  items?: ProcurementItem[];
  onRefresh?: () => void;
  canApprove?: boolean;
  type?: "monthly" | "event";
}) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] =
    useState<ProcurementItem | null>(null);

  const handleApprove = async (item: ProcurementItem) => {
    if (!canApprove) return;

    setUpdating(item.id);
    try {
      await updateProcurementItemStatus(item.id, "purchased");
      onRefresh?.();
    } catch (error) {
      console.error("Failed to approve item:", error);
      alert("Failed to approve item. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "pending":
        return null;
      case "purchased":
        return (
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
            APPROVED
          </span>
        );
      case "completed":
        return (
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
            COMPLETED
          </span>
        );
      default:
        return (
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No items found in this {type} procurement
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden border rounded-lg bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                  No
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Item Details
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                  Qty
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">
                  Total
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-24 text-center">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-32 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, i) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-4 text-sm text-gray-500">{i + 1}</td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {item.item_name || "-"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.category_name || item.category_id} • {item.code}
                    </div>
                    {item.notes && (
                      <div className="text-xs text-orange-600 mt-1">
                        Note: {item.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {item.quantity}{" "}
                    <span className="text-xs text-gray-400">{item.unit}</span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    Rp {item.unit_price?.toLocaleString() || 0}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium">
                    Rp {item.total_price?.toLocaleString() || 0}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {getStatusDisplay(item.status)}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {item.status === "pending" && canApprove ? (
                      <button
                        onClick={() => handleApprove(item)}
                        disabled={updating === item.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        <CheckIcon size={14} />
                        {updating === item.id ? "..." : "Approve"}
                      </button>
                    ) : item.status === "purchased" ? (
                      <button
                        onClick={() => setShowPurchaseModal(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors"
                      >
                        <FileTextIcon size={14} />
                        Record Purchase
                      </button>
                    ) : item.status === "completed" ? (
                      <span className="text-xs text-green-600 font-medium">
                        Completed
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t">
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-3 text-right font-semibold text-gray-700"
                >
                  Total:
                </td>
                <td className="px-4 py-3 text-center font-bold text-blue-600">
                  Rp{" "}
                  {items
                    .reduce(
                      (sum, item) => sum + item.quantity * item.unit_price,
                      0,
                    )
                    .toLocaleString()}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <PurchaseRecordModal
        isOpen={!!showPurchaseModal}
        onClose={() => setShowPurchaseModal(null)}
        item={showPurchaseModal}
        onSuccess={() => {
          setShowPurchaseModal(null);
          onRefresh?.();
        }}
      />
    </>
  );
}
