"use client";

import { useEffect, useState } from "react";
import { openFileWithAuth } from "@/lib/file";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Eye, FileText, AlertTriangle } from "lucide-react";
import { ExpenseResponse } from "@/types/expense";
import ExpenseForm from "./expense-form";
import ExpenseDetail from "./expense-detail";
import { updateExpense, deleteExpense } from "@/lib/expense";
import { UpdateExpensePayload } from "@/types/expense";
import { getBranches } from "@/lib/branch";
import type { Branch } from "@/types/branch";

type Props = {
  expenses: ExpenseResponse[];
  onRefetch: () => void;
  canEdit?: boolean;
};

const ExpenseTable = ({ expenses, onRefetch, canEdit = true }: Props) => {
  const [openingFile, setOpeningFile] = useState<string | null>(null);
  const [filePaths, setFilePaths] = useState<Record<string, string>>({});
  const [editTarget, setEditTarget] = useState<ExpenseResponse | null>(null);
  const [detailTarget, setDetailTarget] = useState<ExpenseResponse | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<ExpenseResponse | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branchMap, setBranchMap] = useState<Record<string, string>>({});

  useEffect(() => {
    getBranches(1, 100)
      .then((res) => {
        const map: Record<string, string> = {};
        (res.data ?? []).forEach((b: Branch) => {
          map[b.id] = b.name;
        });
        setBranchMap(map);
      })
      .catch(console.error);
  }, []);

  const handleUpdate = async (payload: UpdateExpensePayload) => {
    if (!editTarget) return;
    setIsSubmitting(true);
    try {
      await updateExpense(editTarget.id, payload);
      setEditTarget(null);
      onRefetch();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await deleteExpense(deleteTarget.id);
      setDeleteTarget(null);
      onRefetch();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table className="w-full border-collapse">
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="w-[30%] min-w-60 font-semibold text-gray-700">
                Name
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Branch
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Date
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Nominal
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Merchant
              </TableHead>
              <TableHead className="w-[30%] min-w-60 font-semibold text-gray-700">
                Recorded By
              </TableHead>
              <TableHead className="text-right font-semibold text-gray-700 w-40">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-gray-400 text-sm"
                >
                  No expenses found
                </TableCell>
              </TableRow>
            )}
            {expenses.map((exp) => (
              <TableRow
                key={exp.id}
                className="hover:bg-gray-50/50 transition-colors border-b border-gray-100"
              >
                {/* Name Column */}
                <TableCell className="py-3.5">
                  <div className="flex flex-col gap-1 layout-stable">
                    {/* Inline Name and Flag Layout */}
                    <div className="flex items-center gap-2 w-72">
                      <span
                        className="font-medium text-sm text-gray-900 truncate block"
                        title={exp.name}
                      >
                        {exp.name}
                      </span>
                      {exp.is_flagged && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 shrink-0 dynamic-badge">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          FLAGGED
                        </span>
                      )}
                    </div>
                    {/* Subtext: Item details */}
                    {exp.item_name && (
                      <div
                        className="text-xs text-gray-500 truncate max-w-xs"
                        title={`${exp.item_code ?? ""} ${exp.item_name}`}
                      >
                        {exp.item_code && (
                          <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-600 mr-1.5 text-[11px]">
                            {exp.item_code}
                          </span>
                        )}
                        <span>{exp.item_name}</span>
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Branch */}
                <TableCell className="text-sm text-gray-600">
                  {exp.branch_id ? (
                    (branchMap[exp.branch_id] ?? (
                      <span className="text-gray-400 font-mono text-xs bg-gray-50 px-1 py-0.5 rounded">
                        {exp.branch_id}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </TableCell>

                {/* Date */}
                <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                  {new Date(exp.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>

                {/* Nominal */}
                <TableCell className="font-semibold text-red-600 text-sm font-mono whitespace-nowrap">
                  Rp {exp.nominal.toLocaleString("id-ID")}
                </TableCell>

                {/* Merchant */}
                <TableCell
                  className="text-sm text-gray-600 truncate max-w-37.5"
                  title={exp.merchant ?? ""}
                >
                  {exp.merchant ?? <span className="text-gray-300">—</span>}
                </TableCell>

                {/* Recorded By */}
                <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                  <div className="flex items-center gap-2 w-32">
                    <span className="text-sm text-gray-600 truncate block">
                      {exp.recorded_by}
                    </span>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right py-3.5">
                  <div className="flex justify-end gap-0.5">
                    {/* View Detail */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      onClick={() => setDetailTarget(exp)}
                      title="View Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    {canEdit && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                          onClick={() => setEditTarget(exp)}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteTarget(exp)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {canEdit && (
        <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
            </DialogHeader>
            {editTarget && (
              <ExpenseForm
                initialData={editTarget}
                onSubmit={(p) => handleUpdate(p as UpdateExpensePayload)}
                onCancel={() => setEditTarget(null)}
                isLoading={isSubmitting}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailTarget} onOpenChange={() => setDetailTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Expense Detail</DialogTitle>
          </DialogHeader>
          {detailTarget && (
            <ExpenseDetail
              expense={detailTarget}
              onMigrated={() => {
                setDetailTarget(null);
                onRefetch();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      {canEdit && (
        <AlertDialog
          open={!!deleteTarget}
          onOpenChange={() => setDeleteTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Expense</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <strong>{deleteTarget?.name}</strong>? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default ExpenseTable;
