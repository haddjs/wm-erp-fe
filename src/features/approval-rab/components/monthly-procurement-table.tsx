"use client";

import { useEffect, useState } from "react";
import { updateProcurementItemStatus } from "@/lib/monthly-procurement";
import {
  updateProcurementItem,
  deleteProcurementItem,
} from "@/lib/procurement-items";
import type { ProcurementItem } from "@/types/monthly-procurement";
import { CheckIcon, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function MonthlyProcurementTable({
  items = [],
  onRefresh,
  canApprove = true,
  canEdit = false,
}: {
  items?: ProcurementItem[];
  onRefresh?: () => void;
  canApprove?: boolean;
  canEdit?: boolean;
}) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ProcurementItem | null>(
    null,
  );
  const [localItems, setLocalItems] = useState<ProcurementItem[]>(items);
  const [rejectNotes, setRejectNotes] = useState("");

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

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

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    setUpdating(rejectTarget.id);
    try {
      await deleteProcurementItem(rejectTarget.id);
      setLocalItems((prev) => prev.filter((i) => i.id !== rejectTarget.id));
      onRefresh?.();
    } catch {
      alert("Failed to reject item.");
    } finally {
      setUpdating(null);
      setRejectTarget(null);
      setRejectNotes("");
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center text-[10px] tracking-wide font-bold px-2.5 py-0.5 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200/50 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20">
            PENDING
          </span>
        );
      case "purchased":
        return (
          <span className="inline-flex items-center text-[10px] tracking-wide font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
            APPROVED
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center text-[10px] tracking-wide font-bold px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/50 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20">
            COMPLETED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] tracking-wide font-bold px-2.5 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-300">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  if (!localItems || localItems.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed rounded-xl bg-white dark:bg-zinc-950 p-8">
        <AlertCircle className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2.5" />
        <p className="text-sm font-medium text-slate-900 dark:text-zinc-200">
          No Items Logged
        </p>
        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
          No items found in this monthly procurement request
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-zinc-900/50 border-b border-slate-200 dark:border-zinc-800">
                <th className="p-4 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider w-12 text-center">
                  No
                </th>
                <th className="px-4 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Item Details
                </th>
                <th className="px-4 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider w-24 text-right">
                  Qty
                </th>
                <th className="px-4 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider w-32 text-right">
                  Unit Price
                </th>
                <th className="px-4 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider w-36 text-right">
                  Total Estimate
                </th>
                <th className="px-4 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider w-28 text-center">
                  Status
                </th>
                <th className="px-4 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider w-48 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
              {localItems.map((item, i) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/40 dark:hover:bg-zinc-900/20 transition-colors"
                >
                  <td className="px-4 py-4 text-xs font-medium text-slate-400 dark:text-zinc-500 text-center">
                    {i + 1}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">
                      {item.item_name || "-"}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                      {item.category_name || item.category_id} &bull;{" "}
                      <span className="font-mono text-[11px]">{item.code}</span>
                    </div>
                    {item.notes && (
                      <div className="text-[11px] font-medium text-amber-600 dark:text-amber-500 mt-1.5 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded w-fit">
                        Note: {item.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-zinc-300 text-right font-medium">
                    {item.quantity}{" "}
                    <span className="text-xs text-slate-400 dark:text-zinc-500 font-normal ml-0.5">
                      {item.unit}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600 dark:text-zinc-400 text-right font-mono">
                    Rp {item.unit_price?.toLocaleString() || 0}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-900 dark:text-zinc-100 text-right font-semibold font-mono">
                    Rp {item.total_price?.toLocaleString() || 0}
                  </td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    {getStatusDisplay(item.status)}
                  </td>
                  <td className="px-4 py-4 text-right whitespace-nowrap">
                    {item.status === "pending" && (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => setRejectTarget(item)}
                          disabled={updating === item.id || !canApprove}
                          variant="outline"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950 rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                        >
                          <XCircle size={13} />
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleApprove(item)}
                          disabled={updating === item.id || !canApprove}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border-green-200 hover:bg-slate-800 text-green-700 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                        >
                          <CheckIcon size={13} className="stroke-[2.5]" />
                          {updating === item.id ? "..." : "Approve"}
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/50 dark:bg-zinc-900/30 border-t border-slate-200 dark:border-zinc-800">
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
                >
                  Aggregate Total:
                </td>
                <td className="px-4 py-4 text-right text-base font-bold text-slate-900 dark:text-zinc-50 font-mono">
                  Rp{" "}
                  {localItems
                    .reduce(
                      (sum, item) => sum + item.quantity * item.unit_price,
                      0,
                    )
                    .toLocaleString()}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Reject Item Dialog */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null);
            setRejectNotes("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Reject Item
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 space-y-3">
            <p className="text-sm text-gray-600">
              You are about to reject{" "}
              <span className="font-semibold text-gray-900">
                {rejectTarget?.item_name || rejectTarget?.code || "this item"}
              </span>
              . Please provide a reason.
            </p>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Rejection Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="e.g., Item not in budget, duplicate request..."
                rows={4}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRejectTarget(null);
                setRejectNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectNotes.trim()}
              onClick={handleRejectConfirm}
            >
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
