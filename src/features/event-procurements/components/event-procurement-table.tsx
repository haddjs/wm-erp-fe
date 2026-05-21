"use client";

import { useState, useEffect } from "react";
import { updateProcurementItemStatus } from "@/lib/monthly-procurement";
import {
  updateProcurementItemQty,
  rejectProcurementItem,
  deleteProcurementItem,
} from "@/lib/procurement-items";
import type { ProcurementItem } from "@/types/monthly-procurement";
import {
  CheckIcon,
  FileTextIcon,
  AlertCircle,
  XCircle,
  Pencil,
  Save,
  X,
} from "lucide-react";
import PurchaseRecordModal from "@/features/purchase-record/components/purchase-record-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ProcurementTable({
  items = [],
  onRefresh,
  canApprove = true,
  canEdit = false,
  type = "monthly",
  procurementStatus,
}: {
  items?: ProcurementItem[];
  onRefresh?: () => void;
  canApprove?: boolean;
  canEdit?: boolean;
  type?: "monthly" | "event";
  procurementStatus?: string;
}) {
  const [localItems, setLocalItems] = useState<ProcurementItem[]>(items);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] =
    useState<ProcurementItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ProcurementItem | null>(
    null,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleApprove = async (item: ProcurementItem) => {
    if (!canApprove) return;
    setUpdating(item.id);
    try {
      await updateProcurementItemStatus(item.id, "purchased");
      onRefresh?.();
    } catch {
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
      setLocalItems((prev) =>
        prev.map((i) =>
          i.id === rejectTarget.id ? { ...i, status: "rejected" as const } : i,
        ),
      );
      onRefresh?.();
    } catch {
      alert("Failed to reject item.");
    } finally {
      setUpdating(null);
      setRejectTarget(null);
    }
  };

  const handleConfirmDelete = async (item: ProcurementItem) => {
    setUpdating(item.id);
    try {
      await deleteProcurementItem(item.id);
      setLocalItems((prev) => prev.filter((i) => i.id !== item.id));
      onRefresh?.();
    } catch {
      alert("Failed to delete item.");
    } finally {
      setUpdating(null);
    }
  };

  const startEdit = (item: ProcurementItem) => {
    setEditingId(item.id);
    setEditQty(item.quantity);
  };

  const cancelEdit = () => setEditingId(null);

  const handleSaveEdit = async (item: ProcurementItem) => {
    if (editQty <= 0) {
      alert("Quantity must be at least 1.");
      return;
    }
    setUpdating(item.id);
    try {
      await updateProcurementItemQty(item.id, editQty);
      setLocalItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                quantity: editQty,
                total_price: editQty * item.unit_price,
              }
            : i,
        ),
      );
      setEditingId(null);
      onRefresh?.();
    } catch {
      alert("Failed to update quantity.");
    } finally {
      setUpdating(null);
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
            PURCHASED
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center text-[10px] tracking-wide font-bold px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/50 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20">
            COMPLETED
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center text-[10px] tracking-wide font-bold px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200/50">
            REJECTED
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
          No items found in this {type} procurement request
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
                <th className="px-4 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider w-32 text-right">
                  Qty
                </th>
                <th className="px-4 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider w-32 text-right">
                  Unit Price
                </th>
                <th className="px-4 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider w-36 text-right">
                  Budget
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
              {localItems.map((item, i) => {
                const isEditing = editingId === item.id;
                const liveTotal = isEditing
                  ? editQty * item.unit_price
                  : item.total_price;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/40 dark:hover:bg-zinc-900/20 transition-colors ${isEditing ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}
                  >
                    <td className="px-4 py-4 text-xs font-medium text-slate-400 dark:text-zinc-500 text-center">
                      {i + 1}
                    </td>

                    {/* Item Details */}
                    <td className="px-4 py-4">
                      <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">
                        {item.item_name || "-"}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                        {item.category_name || item.category_id} &bull;{" "}
                        <span className="font-mono text-[11px]">
                          {item.code}
                        </span>
                      </div>
                      {item.notes && (
                        <div className="text-[11px] font-medium text-amber-600 dark:text-amber-500 mt-1.5 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded w-fit">
                          Note: {item.notes}
                        </div>
                      )}
                    </td>

                    {/* Qty — editable when Finance + pending */}
                    <td className="px-4 py-4 text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          min={1}
                          className="h-7 text-xs text-right w-20 ml-auto"
                          value={editQty}
                          onChange={(e) => setEditQty(Number(e.target.value))}
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm text-slate-700 dark:text-zinc-300 font-medium">
                          {item.quantity}{" "}
                          <span className="text-xs text-slate-400 font-normal ml-0.5">
                            {item.unit}
                          </span>
                        </span>
                      )}
                    </td>

                    {/* Unit Price */}
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-zinc-400 text-right font-mono">
                      Rp {item.unit_price?.toLocaleString() || 0}
                    </td>

                    {/* Budget (qty x unit_price) — updates live when editing */}
                    <td className="px-4 py-4 text-sm text-slate-900 dark:text-zinc-100 text-right font-semibold font-mono">
                      Rp {liveTotal?.toLocaleString() || 0}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      {getStatusDisplay(item.status)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={cancelEdit}
                            disabled={updating === item.id}
                          >
                            <X size={12} className="mr-1" /> Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleSaveEdit(item)}
                            disabled={updating === item.id}
                          >
                            <Save size={12} className="mr-1" />
                            {updating === item.id ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      ) : item.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          {/* Finance edit button */}
                          {canEdit && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-slate-500 hover:text-slate-700"
                              onClick={() => startEdit(item)}
                              disabled={!!updating}
                            >
                              <Pencil size={12} className="mr-1" /> Edit Qty
                            </Button>
                          )}
                          {canApprove && (
                            <>
                              <Button
                                onClick={() => setRejectTarget(item)}
                                disabled={updating === item.id}
                                variant="outline"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg text-xs font-semibold disabled:opacity-50"
                              >
                                <XCircle size={13} /> Reject
                              </Button>
                              {/* <Button
                                onClick={() => handleApprove(item)}
                                disabled={updating === item.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                              >
                                <CheckIcon size={13} className="stroke-[2.5]" />
                                {updating === item.id ? "..." : "Approve"}
                              </Button> */}
                            </>
                          )}
                        </div>
                      ) : item.status === "purchased" ? (
                        procurementStatus === "approved" ? (
                          <Button
                            onClick={() => setShowPurchaseModal(item)}
                            variant="outline"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          >
                            <FileTextIcon
                              size={13}
                              className="text-slate-400"
                            />
                            Record Purchase
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium pr-2">
                            Awaiting approval
                          </span>
                        )
                      ) : item.status === "completed" ? (
                        <div className="flex flex-col items-end gap-0.5 pr-2">
                          <span className="text-xs text-slate-400 font-medium">
                            Fulfilled
                          </span>
                          {item.completed_by && (
                            <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                              by {item.completed_by}
                            </span>
                          )}
                          {item.completed_at && (
                            <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                              {new Date(item.completed_at).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          )}
                        </div>
                      ) : item.status === "rejected" ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-red-500 font-medium">
                            Rejected
                          </span>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50/50 dark:bg-zinc-900/30 border-t border-slate-200 dark:border-zinc-800">
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
                >
                  Aggregate Budget:
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

      <PurchaseRecordModal
        isOpen={!!showPurchaseModal}
        onClose={() => setShowPurchaseModal(null)}
        item={showPurchaseModal}
        onSuccess={() => {
          setShowPurchaseModal(null);
          onRefresh?.();
        }}
      />

      {/* Reject Dialog */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" /> Reject Item
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            Are you sure you want to reject{" "}
            <span className="font-semibold text-gray-900">
              {rejectTarget?.item_name || rejectTarget?.code || "this item"}
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!!updating}
              onClick={handleRejectConfirm}
            >
              {updating ? "Rejecting..." : "Confirm Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
