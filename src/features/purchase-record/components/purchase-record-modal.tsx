"use client";

import FileUploadButton from "@/components/FileUploadButton";
import { useState, useEffect } from "react";
import {
  createPurchaseRecord,
  getPurchaseRecordsByItemId,
  updatePurchaseRecordStatus,
} from "@/lib/purchase-record";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Receipt,
  CalendarDays,
  Store,
  Clipboard,
  History,
  Clock,
  CheckCircle,
  XCircle,
  Paperclip,
  ArrowRightLeft,
} from "lucide-react";
import type { ProcurementItem } from "@/types/monthly-procurement";
import type { PurchaseRecord } from "@/types/purchase-record";
import { useAuth } from "@/context/AuthContext";
import { migratePurchaseRecordToExpense } from "@/lib/migration";
import { getBranches } from "@/lib/branch";
import type { Branch } from "@/types/branch";

interface PurchaseRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ProcurementItem | null;
  onSuccess: () => void;
}

export default function PurchaseRecordModal({
  isOpen,
  onClose,
  item,
  onSuccess,
}: PurchaseRecordModalProps) {
  const { user } = useAuth();
  const [existingRecords, setExistingRecords] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PurchaseRecord | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [formData, setFormData] = useState({
    quantity_bought: item?.quantity || 1,
    actual_unit_price: item?.unit_price || 0,
    merchant: "",
    purchased_at: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [fileId, setFileId] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [migrateTarget, setMigrateTarget] = useState<PurchaseRecord | null>(
    null,
  );
  const [migrating, setMigrating] = useState(false);
  const [migrateForm, setMigrateForm] = useState({ branch_id: "", name: "" });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [migrateError, setMigrateError] = useState<string | null>(null);

  const canReview = user?.role === 1 || user?.role === 2;

  useEffect(() => {
    if (isOpen && item) {
      fetchExistingRecords();
      setFormData({
        quantity_bought: item.quantity,
        actual_unit_price: item.unit_price,
        merchant: "",
        purchased_at: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setFileId(null);
      setFileUrl(null);
      setFilePath(null);
    }
  }, [isOpen, item]);

  useEffect(() => {
    if (migrateTarget) {
      getBranches(1, 100)
        .then((res) => setBranches(res.data ?? []))
        .catch(console.error);
      setMigrateForm({ branch_id: "", name: "" });
      setMigrateError(null);
    }
  }, [migrateTarget]);

  const fetchExistingRecords = async () => {
    if (!item) return;
    try {
      const response = await getPurchaseRecordsByItemId(item.id);
      setExistingRecords(response.data ?? []);
    } catch (error) {
      console.error("Failed to fetch purchase records:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setLoading(true);
    try {
      await createPurchaseRecord({
        procurement_item_id: item.id,
        quantity_bought: formData.quantity_bought,
        actual_unit_price: formData.actual_unit_price,
        merchant: formData.merchant || null,
        purchased_at: new Date(formData.purchased_at).toISOString(),
        notes: formData.notes || null,
        file_id: fileId ?? undefined,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to create purchase record:", error);
      alert("Failed to create purchase record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (record: PurchaseRecord) => {
    setUpdating(record.id);
    try {
      await updatePurchaseRecordStatus(record.id, "confirmed");
      await fetchExistingRecords();
      onSuccess();
    } catch {
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
      await fetchExistingRecords();
      onSuccess();
    } catch {
      alert("Failed to reject purchase record.");
    } finally {
      setUpdating(null);
      setRejectTarget(null);
      setRejectNotes("");
    }
  };

  const handleMigrateConfirm = async () => {
    if (!migrateTarget) return;
    if (!migrateForm.branch_id) {
      setMigrateError("Please select a branch.");
      return;
    }
    if (!migrateForm.name.trim()) {
      setMigrateError("Please enter a name.");
      return;
    }
    setMigrating(true);
    setMigrateError(null);
    try {
      await migratePurchaseRecordToExpense(
        migrateTarget.id,
        migrateForm.branch_id,
        migrateForm.name.trim(),
      );
      setMigrateTarget(null);
      await fetchExistingRecords();
      onSuccess(); // triggers parent refetch → PI status updates
    } catch (err: any) {
      setMigrateError(err?.message || "Migration failed. Please try again.");
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
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${config.className}`}
      >
        <Icon size={10} />
        {config.label}
      </span>
    );
  };

  const totalPrice = formData.quantity_bought * formData.actual_unit_price;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md p-2 overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl gap-0 max-h-[90vh] flex flex-col">
          <DialogHeader className="px-5 py-2 border-b border-slate-100 dark:border-zinc-900 shrink-0">
            <DialogTitle className="text-sm font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              Record Purchase Details
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1">
            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
              {/* Item Reference */}
              {item && (
                <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-lg px-3 py-2.5 border border-slate-200/60 dark:border-zinc-800/60">
                  <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    {item.item_name || "Ad-hoc Item"}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                      {item.category_name} &bull;{" "}
                      <span className="font-mono">{item.code}</span>
                    </p>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                      {item.quantity} {item.unit} @ Rp{" "}
                      {item.unit_price?.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                    Quantity Purchased *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    className="h-8 text-sm transition-none"
                    value={formData.quantity_bought}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity_bought: Number(e.target.value),
                      })
                    }
                    required
                  />
                  {item && formData.quantity_bought > item.quantity && (
                    <p className="text-[11px] text-rose-500 font-medium">
                      Max {item.quantity}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                    Actual Unit Price (Rp) *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    className="h-8 text-sm font-mono transition-none"
                    value={formData.actual_unit_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        actual_unit_price: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                    <Store size={11} className="text-slate-400" /> Merchant
                  </label>
                  <Input
                    type="text"
                    className="h-8 text-sm transition-none"
                    placeholder="e.g., PT Sumber Makmur"
                    value={formData.merchant}
                    onChange={(e) =>
                      setFormData({ ...formData, merchant: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                    <CalendarDays size={11} className="text-slate-400" />{" "}
                    Purchase Date *
                  </label>
                  <Input
                    type="date"
                    className="h-8 text-sm transition-none"
                    value={formData.purchased_at}
                    onChange={(e) =>
                      setFormData({ ...formData, purchased_at: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                  <Clipboard size={11} className="text-slate-400" /> Notes
                </label>
                <textarea
                  className="w-full text-sm p-2 bg-transparent border rounded-lg border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-slate-400 resize-none"
                  rows={2}
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>

              {/* Total */}
              <div className="bg-slate-900 dark:bg-zinc-50 text-white dark:text-zinc-950 px-4 py-2.5 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Receipt size={13} className="opacity-60" />
                  <span className="text-[11px] font-medium uppercase tracking-wide opacity-80">
                    Total Outlay
                  </span>
                </div>
                <span className="text-sm font-bold font-mono">
                  Rp {totalPrice.toLocaleString()}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Paperclip size={11} className="text-slate-400" /> Invoice /
                  Receipt
                </label>
                <FileUploadButton
                  onUploaded={(id, url, path) => {
                    setFileId(id);
                    setFileUrl(url);
                    setFilePath(path);
                  }}
                  onClear={() => {
                    setFileId(null);
                    setFileUrl(null);
                    setFilePath(null);
                  }}
                  currentFileUrl={fileUrl}
                  label="Attach Invoice"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-slate-100 dark:border-zinc-900">
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 text-xs font-semibold"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-8 text-xs font-semibold px-4"
                >
                  {loading ? "Recording..." : "Commit Record"}
                </Button>
              </div>
            </form>

            {existingRecords.length > 0 && (
              <div className="border-t border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/10 px-5 py-4">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5 mb-2">
                  <History size={11} /> Audit History
                </h4>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {existingRecords.map((record) => (
                    <div
                      key={record.id}
                      className="text-xs bg-white dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-900 p-2.5 rounded-lg space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          {getStatusBadge(record.status)}
                          <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-1">
                            {record.quantity_bought} units
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {record.merchant || "Unknown Vendor"} &bull;{" "}
                            {new Date(record.purchased_at).toLocaleDateString(
                              "id-ID",
                            )}
                          </p>
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-zinc-100 shrink-0">
                          Rp {record.actual_total_price?.toLocaleString()}
                        </span>
                      </div>
                      {canReview && record.status === "submitted" && (
                        <div className="flex justify-end gap-2 pt-1 border-t border-slate-100 dark:border-zinc-900">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-6 text-[11px] text-red-600 border-red-200 hover:bg-red-50"
                            disabled={updating === record.id}
                            onClick={() => setRejectTarget(record)}
                          >
                            <XCircle size={10} className="mr-1" /> Reject
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className="h-6 text-[11px]"
                            disabled={updating === record.id}
                            onClick={() => handleConfirm(record)}
                          >
                            <CheckCircle size={10} className="mr-1" />
                            {updating === record.id ? "..." : "Confirm"}
                          </Button>
                        </div>
                      )}

                      {(user?.role === 1 || user?.role === 2) && (
                        <div className="flex justify-end pt-1 border-t border-slate-100 dark:border-zinc-900">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-6 text-[11px] text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => setMigrateTarget(record)}
                          >
                            <ArrowRightLeft size={10} className="mr-1" />{" "}
                            Migrate to Expense
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-blue-600" />
              Migrate to Expense
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm space-y-1">
              <p className="font-medium text-gray-900">
                Rp {migrateTarget?.actual_total_price.toLocaleString("id-ID")}
              </p>
              <p className="text-gray-500 text-xs">
                {migrateTarget?.quantity_bought} units &bull;{" "}
                {migrateTarget?.merchant || "No merchant"} &bull;{" "}
                {migrateTarget?.purchased_at
                  ? new Date(migrateTarget.purchased_at).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )
                  : ""}
              </p>
            </div>
            <p className="text-sm text-gray-600">
              This purchase record will be converted into an Expense and
              permanently removed. The branch balance will be deducted.
            </p>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Expense Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={migrateForm.name}
                onChange={(e) => {
                  setMigrateForm({ ...migrateForm, name: e.target.value });
                  setMigrateError(null);
                }}
                placeholder="e.g., Office Supplies Purchase"
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Branch <span className="text-red-500">*</span>
              </label>
              <select
                value={migrateForm.branch_id}
                onChange={(e) => {
                  setMigrateForm({ ...migrateForm, branch_id: e.target.value });
                  setMigrateError(null);
                }}
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Select branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            {migrateError && (
              <p className="text-xs text-red-500">{migrateError}</p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setMigrateTarget(null)}
              disabled={migrating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMigrateConfirm}
              disabled={
                migrating || !migrateForm.branch_id || !migrateForm.name.trim()
              }
              className="gap-2"
            >
              {migrating ? "Migrating..." : "Confirm Migration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
