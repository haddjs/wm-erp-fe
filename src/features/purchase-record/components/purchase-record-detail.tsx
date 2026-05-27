"use client";

import { useState, useEffect } from "react";
import { getMonthlyProcurementById } from "@/lib/monthly-procurement";
import { getEventProcurementById } from "@/lib/event-procurement";
import type {
  MonthlyProcurement,
  ProcurementItem,
} from "@/types/monthly-procurement";
import type { EventProcurement } from "@/types/event-procurement";
import PurchaseRecordModal from "./purchase-record-modal";
import PurchaseRecordReview from "./purchase-record-review";
import {
  Calendar,
  User,
  Clock,
  Package,
  FileTextIcon,
  CheckCircle,
  CreditCard,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { migratePurchaseRecordToExpense } from "@/lib/migration";

type Props = {
  procurementId: string | null;
  type: "monthly" | "event";
  onRecorded?: () => void;
};

export default function PurchaseRecordDetail({
  procurementId,
  type,
  onRecorded,
}: Props) {
  const [procurement, setProcurement] = useState<
    MonthlyProcurement | EventProcurement | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [showRecordModal, setShowRecordModal] =
    useState<ProcurementItem | null>(null);
  const [reviewTarget, setReviewTarget] = useState<ProcurementItem | null>(
    null,
  );
  const [migrateTarget, setMigrateTarget] = useState<ProcurementItem | null>(
    null,
  );
  const [migrating, setMigrating] = useState(false);
  const [migrateBranchId, setMigrateBranchId] = useState("");
  const [migrateName, setMigrateName] = useState("");

  useEffect(() => {
    if (procurementId) fetchProcurement();
    else setProcurement(null);
  }, [procurementId, type]);

  const fetchProcurement = async () => {
    if (!procurementId) return;
    setLoading(true);
    try {
      if (type === "monthly") {
        const data = await getMonthlyProcurementById(procurementId);
        setProcurement(data);
      } else {
        const res = await getEventProcurementById(procurementId);
        setProcurement(res.data);
      }
    } catch (e) {
      console.error("Failed to fetch procurement", e);
    } finally {
      setLoading(false);
    }
  };

  const handleMigrateToExpense = async () => {
    if (!migrateTarget) return;
    setMigrating(true);
    try {
      await migratePurchaseRecordToExpense(
        migrateTarget.id,
        migrateBranchId,
        migrateName,
      );
      setMigrateTarget(null);
      fetchProcurement();
      onRecorded?.();
    } catch (e) {
      console.error("Failed to migrate", e);
      alert("Failed to migrate to expense. Please try again.");
    } finally {
      setMigrating(false);
    }
  };

  const getItemStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200/50">
            PENDING
          </span>
        );
      case "purchased":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/50">
            PURCHASED
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200/50">
            REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  const getProcurementLabel = () => {
    if (!procurement) return "";
    if (type === "monthly") {
      const p = procurement as MonthlyProcurement;
      return p.period
        ? new Date(`${p.period}-01`).toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
          })
        : "Monthly Procurement";
    }
    return (procurement as EventProcurement).name || "Event Procurement";
  };

  const items: ProcurementItem[] = (procurement?.procurement_items ??
    []) as ProcurementItem[];

  if (!procurementId) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 gap-3">
        <Package className="w-14 h-14 text-slate-200 dark:text-zinc-700" />
        <div className="text-center">
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            No procurement selected
          </p>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
            Select one from the list to view and record purchases
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-zinc-50" />
      </div>
    );
  }

  if (!procurement) {
    return (
      <div className="flex-1 h-full flex items-center justify-center text-rose-500 text-sm">
        Failed to load procurement details
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Detail Header */}
        <div className="p-6 border-b bg-linear-to-r from-blue-50 to-white dark:from-blue-950/20 dark:to-zinc-950 shrink-0">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-50 tracking-tight">
                {getProcurementLabel()}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5">
                <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <User size={12} />
                  {procurement.submitter_name}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Calendar size={12} />
                  {procurement.branch_name}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Clock size={12} />
                  {new Date(procurement.created_at).toLocaleDateString(
                    "id-ID",
                    { day: "numeric", month: "short", year: "numeric" },
                  )}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                Total Budget
              </p>
              <p className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
                Rp{" "}
                {(
                  ("total_nominal" in procurement
                    ? procurement.total_nominal
                    : (procurement as any).total_price) ?? 0
                ).toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="overflow-hidden border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-zinc-900/50 border-b border-slate-200 dark:border-zinc-800">
                  <th className="p-4 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider w-10 text-center">
                    No
                  </th>
                  <th className="px-4 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    Item Details
                  </th>
                  <th className="px-4 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-right w-24">
                    Qty
                  </th>
                  <th className="px-4 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-right w-32">
                    Unit Price
                  </th>
                  <th className="px-4 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-right w-32">
                    Estimated Spending
                  </th>
                  <th className="px-4 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-right w-32">
                    Actual Spending
                  </th>
                  <th className="px-4 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-center w-28">
                    Status
                  </th>
                  <th className="px-4 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-right w-44">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Package className="w-8 h-8 text-slate-200 dark:text-zinc-700 mx-auto mb-2" />
                      <p className="text-sm text-slate-400 dark:text-zinc-500">
                        No items found
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((item, i) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/40 dark:hover:bg-zinc-900/20 transition-colors"
                    >
                      <td className="px-4 py-4 text-xs font-medium text-slate-400 dark:text-zinc-500 text-center">
                        {i + 1}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                          {item.item_name || "Ad-hoc Item"}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                          {item.category_name} &bull;{" "}
                          <span className="font-mono text-[11px]">
                            {item.code}
                          </span>
                        </p>
                        {item.notes && (
                          <p className="text-[11px] font-medium text-amber-600 mt-1 bg-amber-50 px-2 py-0.5 rounded w-fit">
                            {item.notes}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-right font-medium text-slate-700 dark:text-zinc-300">
                        {item.quantity}{" "}
                        <span className="text-xs text-slate-400 font-normal">
                          {item.unit}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-right font-mono text-slate-600 dark:text-zinc-400">
                        Rp {item.unit_price?.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-4 text-sm text-right font-mono text-slate-600 dark:text-zinc-400">
                        Rp {item.total_price?.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-4 text-sm text-right font-mono text-slate-600 dark:text-zinc-400">
                        Rp {item.total_price?.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getItemStatusBadge(item.status)}
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        {item.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => setShowRecordModal(item)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold"
                          >
                            <FileTextIcon size={13} />
                            Record Purchase
                          </Button>
                        )}
                        {item.status === "purchased" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReviewTarget(item)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold"
                          >
                            <FileTextIcon size={13} />
                            View Records
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-50/50 dark:bg-zinc-900/30 border-t border-slate-200 dark:border-zinc-800">
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
                  >
                    Aggregate Total:
                  </td>
                  <td className="px-4 py-4 text-right text-base font-bold font-mono text-slate-900 dark:text-zinc-50">
                    Rp{" "}
                    {items
                      .reduce(
                        (sum, item) => sum + item.quantity * item.unit_price,
                        0,
                      )
                      .toLocaleString("id-ID")}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Record Purchase Modal */}
      <PurchaseRecordModal
        isOpen={!!showRecordModal}
        onClose={() => setShowRecordModal(null)}
        item={showRecordModal}
        onSuccess={() => {
          setShowRecordModal(null);
          fetchProcurement();
          onRecorded?.();
        }}
      />

      {/* View Records Dialog */}
      <Dialog
        open={!!reviewTarget}
        onOpenChange={(open) => {
          if (!open) setReviewTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase Records</DialogTitle>
            <p className="text-sm text-slate-500 mt-1">
              {reviewTarget?.item_name || reviewTarget?.code}
            </p>
          </DialogHeader>
          {reviewTarget && (
            <PurchaseRecordReview
              procurementItemId={reviewTarget.id}
              onRefresh={fetchProcurement}
              branchId={procurement?.branch_id}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!migrateTarget}
        onOpenChange={(open) => {
          if (!open) setMigrateTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Move to Expense</DialogTitle>
            <p className="text-sm text-slate-500 mt-1">
              This will convert the purchase record for{" "}
              <span className="font-semibold text-slate-700">
                {migrateTarget?.item_name || migrateTarget?.code}
              </span>{" "}
              into an expense and permanently remove the purchase record.
            </p>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium text-slate-700">
                Expense Name
              </label>
              <input
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                value={migrateName}
                onChange={(e) => setMigrateName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMigrateTarget(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={migrating || !migrateName}
              onClick={handleMigrateToExpense}
              className="bg-black hover:bg-amber-700 text-white"
            >
              {migrating ? "Moving..." : "Confirm Move"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
