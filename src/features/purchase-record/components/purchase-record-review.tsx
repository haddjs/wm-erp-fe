"use client";

import { useState, useEffect } from "react";
import {
  getPurchaseRecordsByItemId,
  updatePurchaseRecordStatus,
} from "@/lib/purchase-record";
import type { PurchaseRecord } from "@/types/purchase-record";
import { useAuth } from "@/context/AuthContext";
import {
  CheckCircle,
  XCircle,
  Clock,
  Receipt,
  Store,
  CalendarDays,
  User,
  FileText,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { migratePurchaseRecordToExpense } from "@/lib/migration";

type Props = {
  procurementItemId: string;
  onRefresh?: () => void;
  branchId?: string;
};

export default function PurchaseRecordReview({
  procurementItemId,
  onRefresh,
  branchId,
}: Props) {
  const { user } = useAuth();
  const [records, setRecords] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PurchaseRecord | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [migrateTarget, setMigrateTarget] = useState<PurchaseRecord | null>(
    null,
  );
  const [migrating, setMigrating] = useState(false);
  const [migrateName, setMigrateName] = useState("");

  const canReview = user?.role === "Admin" || user?.role === "Finance";

  useEffect(() => {
    fetchRecords();
  }, [procurementItemId]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await getPurchaseRecordsByItemId(procurementItemId);
      setRecords(res.data);
    } catch (error) {
      console.error("Failed to fetch purchase records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (record: PurchaseRecord) => {
    setUpdating(record.id);
    try {
      await updatePurchaseRecordStatus(record.id, "confirmed");
      await fetchRecords();
      onRefresh?.();
    } catch (error) {
      console.error("Failed to confirm record:", error);
      alert("Failed to confirm purchase record.");
    } finally {
      setUpdating(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    // TODO: pass rejectNotes to API when BE supports it
    setUpdating(rejectTarget.id);
    try {
      await updatePurchaseRecordStatus(rejectTarget.id, "rejected");
      await fetchRecords();
      onRefresh?.();
    } catch (error) {
      console.error("Failed to reject record:", error);
      alert("Failed to reject purchase record.");
    } finally {
      setUpdating(null);
      setRejectTarget(null);
      setRejectNotes("");
    }
  };

  const handleMigrateToExpense = async () => {
    if (!migrateTarget || !branchId) return;
    setMigrating(true);
    try {
      await migratePurchaseRecordToExpense(
        migrateTarget.id,
        branchId,
        migrateName,
      );
      setMigrateTarget(null);
      await fetchRecords();
      onRefresh?.();
    } catch (e) {
      console.error("Failed to migrate", e);
      alert("Failed to migrate to expense. Please try again.");
    } finally {
      setMigrating(false);
    }
  };

  const getStatusBadge = (status: PurchaseRecord["status"]) => {
    const config = {
      submitted: {
        icon: Clock,
        label: "Submitted",
        className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      },
      confirmed: {
        icon: CheckCircle,
        label: "Confirmed",
        className: "bg-green-50 text-green-700 border-green-200",
      },
      rejected: {
        icon: XCircle,
        label: "Rejected",
        className: "bg-red-50 text-red-700 border-red-200",
      },
    }[status];

    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
      >
        <Icon size={11} />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Receipt className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No purchase records yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {records.map((record) => (
          <div
            key={record.id}
            className="bg-white border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3"
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getStatusBadge(record.status)}
                  <span className="text-xs text-gray-400">
                    #{record.id.slice(-6)}
                  </span>
                </div>
                <p className="text-lg font-bold font-mono text-slate-900 dark:text-zinc-100">
                  Rp {record.actual_total_price.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Action buttons — only for submitted records */}
              {canReview && record.status === "submitted" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                    disabled={updating === record.id}
                    onClick={() => setRejectTarget(record)}
                  >
                    <XCircle size={13} className="mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    disabled={updating === record.id}
                    onClick={() => handleConfirm(record)}
                    className="text-xs"
                  >
                    <CheckCircle size={13} className="mr-1" />
                    {updating === record.id ? "Processing..." : "Confirm"}
                  </Button>
                </div>
              )}

              {record.status === "confirmed" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-amber-600 border-amber-200 hover:bg-amber-50 text-xs"
                  onClick={() => {
                    setMigrateTarget(record);
                    setMigrateName(record.notes || "");
                  }}
                >
                  <CreditCard size={13} className="mr-1" />
                  Move to Expense
                </Button>
              )}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Receipt size={12} className="text-slate-400" />
                <span>
                  {record.quantity_bought} units @ Rp{" "}
                  {record.actual_unit_price.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays size={12} className="text-slate-400" />
                <span>
                  {new Date(record.purchased_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              {record.merchant && (
                <div className="flex items-center gap-1.5">
                  <Store size={12} className="text-slate-400" />
                  <span>{record.merchant}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <User size={12} className="text-slate-400" />
                <span>{record.recorded_by}</span>
              </div>
            </div>

            {/* Notes */}
            {record.notes && (
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 rounded-lg px-3 py-2 flex items-start gap-2">
                <FileText
                  size={12}
                  className="text-amber-500 mt-0.5 shrink-0"
                />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  {record.notes}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reject Dialog */}
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
              Reject Purchase Record
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-gray-600">
              You are about to reject this purchase record of{" "}
              <span className="font-semibold text-gray-900">
                Rp {rejectTarget?.actual_total_price.toLocaleString("id-ID")}
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
                placeholder="e.g., Price discrepancy, missing invoice..."
                rows={3}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
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
              disabled={!rejectNotes.trim() || !!updating}
              onClick={handleRejectConfirm}
            >
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!migrateTarget}
        onOpenChange={(open) => {
          if (!open) setMigrateTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Move to Expense</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-gray-600">
              This will convert the purchase record of{" "}
              <span className="font-semibold text-gray-900">
                Rp {migrateTarget?.actual_total_price.toLocaleString("id-ID")}
              </span>{" "}
              into an expense. The purchase record will be permanently removed.
            </p>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Expense Name <span className="text-red-500">*</span>
              </label>
              <input
                value={migrateName}
                onChange={(e) => setMigrateName(e.target.value)}
                placeholder="e.g., Office supplies - May"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setMigrateTarget(null)}>
              Cancel
            </Button>
            <Button
              disabled={!migrateName.trim() || migrating}
              onClick={handleMigrateToExpense}
              className="bg-black hover:bg-amber-700 text-white"
            >
              {migrating ? "Moving..." : "Confirm Move"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
