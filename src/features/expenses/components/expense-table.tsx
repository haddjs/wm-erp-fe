"use client";

import { useEffect, useState } from "react";
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
import { Pencil, Trash2, Eye } from "lucide-react";
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
};

const ExpenseTable = ({ expenses, onRefetch }: Props) => {
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
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Name</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Recorded By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-gray-400"
                >
                  No expenses found
                </TableCell>
              </TableRow>
            )}
            {expenses.map((exp) => (
              <TableRow key={exp.id}>
                <TableCell className="font-medium">{exp.name}</TableCell>
                <TableCell className="font-medium">
                  {exp.branch_id ? (
                    (branchMap[exp.branch_id] ?? (
                      <span className="text-gray-400 text-xs">
                        {exp.branch_id}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(exp.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  {exp.amount} item{exp.amount !== 1 ? "s" : ""}
                </TableCell>
                <TableCell className="font-semibold text-red-600">
                  Rp {exp.nominal.toLocaleString("id-ID")}
                </TableCell>
                <TableCell>
                  {exp.merchant ?? <span className="text-gray-400">—</span>}
                </TableCell>
                <TableCell>{exp.recorded_by}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDetailTarget(exp)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditTarget(exp)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setDeleteTarget(exp)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
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
    </>
  );
};

export default ExpenseTable;
