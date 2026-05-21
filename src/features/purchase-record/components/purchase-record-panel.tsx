"use client";

import { useState, useEffect } from "react";
import {
  createPurchaseRecord,
  getPurchaseRecordsByItemId,
  updatePurchaseRecordStatus,
} from "@/lib/purchase-record";
import type { PurchaseReadyItem } from "@/types/purchase-ready-item";
import type { PurchaseRecord } from "@/types/purchase-record";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  X,
  Receipt,
  Store,
  CalendarDays,
  Clipboard,
  Clock,
  CheckCircle,
  XCircle,
  History,
  Plus,
} from "lucide-react";

type Props = {
  item: PurchaseReadyItem;
  onClose: () => void;
  onSuccess: () => void;
};

export default function PurchaseRecordPanel({
  item,
  onClose,
  onSuccess,
}: Props) {
  const { user } = useAuth();
  const [records, setRecords] = useState<PurchaseRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PurchaseRecord | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  const canRecord = user?.role === 1 || user?.role === 2;
  const canReview = user?.role === 1 || user?.role === 3;

  const [formData, setFormData] = useState({
    quantity_bought: item.quantity,
    actual_unit_price: item.unit_price,
    merchant: "",
    purchased_at: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    fetchRecords();
    // reset form when item changes
    setFormData({
      quantity_bought: item.quantity,
      actual_unit_price: item.unit_price,
      merchant: "",
      purchased_at: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setShowForm(false);
  }, [item.id]);

  const fetchRecords = async () => {
    setLoadingRecords(true);
    try {
      const res = await getPurchaseRecordsByItemId(item.id);
      setRecords(res.data);
    } catch (err) {
      console.error("Failed to fetch records:", err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createPurchaseRecord({
        procurement_item_id: item.id,
        quantity_bought: formData.quantity_bought,
        actual_unit_price: formData.actual_unit_price,
        merchant: formData.merchant || null,
        purchased_at: new Date(formData.purchased_at).toISOString(),
        notes: formData.notes || null,
      });
      await fetchRecords();
      setShowForm(false);
      onSuccess();
    } catch (err) {
      console.error("Failed to create purchase record:", err);
      alert("Failed to create purchase record.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (record: PurchaseRecord) => {
    setUpdating(record.id);
    try {
      await updatePurchaseRecordStatus(record.id, "confirmed");
      await fetchRecords();
    } catch {
      alert("Failed to confirm purchase record.");
    } finally {
      setUpdating(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    setUpdating(rejectTarget.id);
    try {
      await updatePurchaseRecordStatus(rejectTarget.id, "rejected");
      await fetchRecords();
    } catch {
      alert("Failed to reject purchase record.");
    } finally {
      setUpdating(null);
      setRejectTarget(null);
      setRejectNotes("");
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
        <Icon size={10} /> {config.label}
      </span>
    );
  };

  const totalPrice = formData.quantity_bought * formData.actual_unit_price;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full">
        {/* Panel Header */}
        <div className="p-4 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-900">
              {item.item_name || "Ad-hoc Item"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {item.category_name} &bull;{" "}
              <span className="font-mono">{item.code}</span> &bull;{" "}
              {item.branch_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Requested summary */}
        <div className="px-4 py-3 bg-slate-50 border-b border-gray-100 flex justify-between text-xs text-gray-500">
          <span>Requested</span>
          <span className="font-medium text-gray-700">
            {item.quantity} {item.unit} @ Rp{" "}
            {item.unit_price.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add Record Button */}
          {canRecord && !showForm && (
            <Button
              size="sm"
              className="w-full"
              onClick={() => setShowForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Record Purchase
            </Button>
          )}

          {/* Create Form */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="border border-blue-200 rounded-lg p-4 space-y-3 bg-blue-50/30"
            >
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                New Purchase Record
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">
                    Qty Purchased *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max={item.quantity}
                    className="h-8 text-sm"
                    value={formData.quantity_bought}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity_bought: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">
                    Actual Unit Price *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    className="h-8 text-sm font-mono"
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
                  <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                    <Store size={11} /> Merchant
                  </label>
                  <Input
                    type="text"
                    className="h-8 text-sm"
                    placeholder="e.g., PT Sumber Makmur"
                    value={formData.merchant}
                    onChange={(e) =>
                      setFormData({ ...formData, merchant: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                    <CalendarDays size={11} /> Purchase Date *
                  </label>
                  <Input
                    type="date"
                    className="h-8 text-sm"
                    value={formData.purchased_at}
                    onChange={(e) =>
                      setFormData({ ...formData, purchased_at: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                  <Clipboard size={11} /> Notes
                </label>
                <textarea
                  rows={2}
                  className="w-full text-sm p-2 border rounded-lg border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>

              {/* Total */}
              <div className="flex items-center justify-between bg-slate-900 text-white rounded-lg px-3 py-2">
                <div className="flex items-center gap-1.5 text-xs opacity-80">
                  <Receipt size={12} /> Total Outlay
                </div>
                <span className="text-sm font-bold font-mono">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? "Saving..." : "Commit Record"}
                </Button>
              </div>
            </form>
          )}

          {/* Existing Records */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <History size={12} /> Purchase History
            </p>

            {loadingRecords ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <Receipt className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                <p className="text-xs">No records yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="border border-gray-200 rounded-lg p-3 space-y-2 bg-white"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {getStatusBadge(record.status)}
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          Rp {record.actual_total_price.toLocaleString("id-ID")}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {record.quantity_bought} units @ Rp{" "}
                          {record.actual_unit_price.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 shrink-0">
                        {new Date(record.purchased_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>

                    {record.merchant && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Store size={11} /> {record.merchant}
                      </p>
                    )}

                    {record.notes && (
                      <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
                        {record.notes}
                      </p>
                    )}

                    {/* Finance confirm/reject */}
                    {canReview && record.status === "submitted" && (
                      <div className="flex gap-2 justify-end pt-1 border-t border-gray-100">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] text-red-600 border-red-200 hover:bg-red-50"
                          disabled={updating === record.id}
                          onClick={() => setRejectTarget(record)}
                        >
                          <XCircle size={11} className="mr-1" /> Reject
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="h-7 text-[11px]"
                          disabled={updating === record.id}
                          onClick={() => handleConfirm(record)}
                        >
                          <CheckCircle size={11} className="mr-1" />
                          {updating === record.id ? "..." : "Confirm"}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
              <XCircle className="w-5 h-5" /> Reject Purchase Record
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-gray-600">
              Rejecting record of{" "}
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
    </>
  );
}
