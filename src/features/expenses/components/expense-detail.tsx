"use client";

import { useState } from "react";
import { ExpenseResponse } from "@/types/expense";
import { migrateExpenseToPurchaseRecord } from "@/lib/migration";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowRightLeft, Loader2 } from "lucide-react";

type Props = {
  expense: ExpenseResponse;
  onMigrated?: () => void;
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between py-2 border-b border-gray-100 last:border-0 text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-900 text-right">{value}</span>
  </div>
);

const ExpenseDetail = ({ expense, onMigrated }: Props) => {
  const [showMigrateDialog, setShowMigrateDialog] = useState(false);
  const [procurementItemId, setProcurementItemId] = useState("");
  const [migrating, setMigrating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMigrate = async () => {
    if (!procurementItemId.trim()) {
      setError("Please enter a Procurement Item ID.");
      return;
    }
    setMigrating(true);
    setError(null);
    try {
      await migrateExpenseToPurchaseRecord(
        expense.id,
        procurementItemId.trim(),
      );
      setShowMigrateDialog(false);
      setProcurementItemId("");
      onMigrated?.();
    } catch (err: any) {
      setError(err?.message || "Migration failed. Please try again.");
    } finally {
      setMigrating(false);
    }
  };

  return (
    <>
      <div className="space-y-1">
        <Row label="Name" value={expense.name} />
        <Row
          label="Date"
          value={new Date(expense.date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        />
        <Row
          label="Amount"
          value={`${expense.amount} item${expense.amount !== 1 ? "s" : ""}`}
        />
        <Row
          label="Nominal"
          value={
            <span className="text-red-600 font-semibold">
              Rp {expense.nominal.toLocaleString("id-ID")}
            </span>
          }
        />
        <Row label="Merchant" value={expense.merchant ?? "—"} />
        <Row label="Recorded By" value={expense.recorded_by} />
        <Row label="Branch ID" value={expense.branch_id ?? "—"} />
        <Row label="Order ID" value={expense.order_id ?? "—"} />
        <Row label="File ID" value={expense.file_id ?? "—"} />

        {/* Migrate Button */}
        <div className="pt-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            onClick={() => setShowMigrateDialog(true)}
          >
            <ArrowRightLeft size={14} />
            Migrate to Purchase Record
          </Button>
        </div>
      </div>

      {/* Migrate Dialog */}
      <Dialog
        open={showMigrateDialog}
        onOpenChange={(open) => {
          setShowMigrateDialog(open);
          if (!open) {
            setProcurementItemId("");
            setError(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-blue-600" />
              Migrate to Purchase Record
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 space-y-4">
            {/* Expense summary */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm space-y-1">
              <p className="font-medium text-gray-900">{expense.name}</p>
              <p className="text-gray-500">
                Rp {expense.nominal.toLocaleString("id-ID")} &bull;{" "}
                {new Date(expense.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            <p className="text-sm text-gray-600">
              This expense will be converted into a Purchase Record and linked
              to the specified Procurement Item. The expense will be
              soft-deleted and the branch balance will be restored.
            </p>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Procurement Item ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={procurementItemId}
                onChange={(e) => {
                  setProcurementItemId(e.target.value);
                  setError(null);
                }}
                placeholder="e.g., 3DrnWTE0fZktyn7pgELPxSoyAvZ"
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <p className="text-xs text-gray-400">
                Enter the ID of the Procurement Item this expense should be
                linked to.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowMigrateDialog(false);
                setProcurementItemId("");
                setError(null);
              }}
              disabled={migrating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMigrate}
              disabled={migrating || !procurementItemId.trim()}
              className="gap-2"
            >
              {migrating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Migrating...
                </>
              ) : (
                <>
                  <ArrowRightLeft size={14} />
                  Confirm Migration
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpenseDetail;
