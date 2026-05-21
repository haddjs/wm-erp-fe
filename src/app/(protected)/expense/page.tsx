"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useExpenses } from "@/features/expenses/utils/useExpenses";
import ExpenseTable from "@/features/expenses/components/expense-table";
import ExpenseForm from "@/features/expenses/components/expense-form";
import { createExpense } from "@/lib/expense";
import { CreateExpensePayload } from "@/types/expense";

const ExpensePage = () => {
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { expenses, paging, loading, error, refetch } = useExpenses(page, 10);

  const handleCreate = async (payload: CreateExpensePayload) => {
    setIsSubmitting(true);
    try {
      await createExpense(payload);
      setShowCreate(false);
      refetch();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6 px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Expenses</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Manage and track all recorded expenses
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <ExpenseTable expenses={expenses} onRefetch={refetch} />
        )}

        {/* Pagination */}
        {paging && paging.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>
              Page {paging.currentPage} of {paging.totalPages} (
              {paging.totalData} total)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!paging.hasNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            onSubmit={(p) => handleCreate(p as CreateExpensePayload)}
            onCancel={() => setShowCreate(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpensePage;
