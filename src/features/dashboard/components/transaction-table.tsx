"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";

import { Plus, Upload, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import TransactionTableBase from "@/components/TransactionTableBase";
import Link from "next/link";
import { Expense, Branch } from "@/types";
import { addMockExpense, getMockExpenses } from "@/mocks/expense";

type Props = {
  expenses: Expense[];
  branches: Branch[];
};

const ModalExpenses = ({ onExpenseAdded }: { onExpenseAdded?: () => void }) => {
  const [form, setForm] = useState({
    name: "",
    amount: "",
    nominal: "",
    unit: "",
    source: "",
    category_id: "",
    branch_id: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async () => {
    if (!form.amount || !form.name || !form.nominal) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      ...form,
      id: crypto.randomUUID(),
      file_id: "",
      user_id: "mock-user-1",
      amount: Number(form.amount),
      nominal: Number(form.nominal),
      date: new Date(form.date).toISOString(),
    };

    await new Promise((res) => setTimeout(res, 500));
    addMockExpense(payload);

    toast.success("Expense added successfully!");

    setForm({
      name: "",
      amount: "",
      nominal: "",
      unit: "",
      source: "",
      category_id: "",
      branch_id: "",
      date: new Date().toISOString().split("T")[0],
    });

    if (onExpenseAdded) {
      onExpenseAdded();
    }
  };

  const formatNominal = (value: number | string) => {
    if (!value) return "";
    const number =
      typeof value === "string" ? parseInt(value.replace(/\D/g, "")) : value;
    if (isNaN(number)) return "";
    return new Intl.NumberFormat("id-ID").format(number);
  };

  const handleNominal = (value: string) => {
    const raw = value.replace(/\D/g, "");
    setForm({ ...form, nominal: raw });
  };

  return (
    <Dialog>
      <DialogTrigger>
        <div className="bg-black hover:bg-gray-800 text-white rounded-lg flex p-1 items-center justify-between px-4">
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <Input
            placeholder="Expense Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            placeholder="Amount"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            min={0}
          />
          <Input
            placeholder="Nominal"
            type="text"
            value={form.nominal ? `Rp ${formatNominal(form.nominal)}` : ""}
            onChange={(e) => handleNominal(e.target.value)}
          />
          <Input
            placeholder="Unit"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
          />
          <Input
            placeholder="Source"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          />
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>
        <div className="flex justify-between gap-2">
          <Button onClick={handleSubmit} className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
          <Button variant="outline" className="flex-1">
            <Upload className="w-4 h-4 mr-2" />
            Add Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TransactionTable = ({ expenses, branches }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [localExpenses, setLocalExpenses] = useState<Expense[]>(expenses);

  const recentTransaction = useMemo(() => {
    const filtered = localExpenses.filter(
      (expense) =>
        expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.source?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return [...filtered]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [localExpenses, searchTerm]);

  const handleExpenseAdded = () => {
    const updatedExpenses = getMockExpenses();
    setLocalExpenses(updatedExpenses);
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Recent Transactions</h2>
            <p className="text-sm text-gray-400">
              Latest expenses entries across all branches
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <ModalExpenses onExpenseAdded={handleExpenseAdded} />
          </div>
        </div>

        <TransactionTableBase data={recentTransaction} branches={branches} />

        {recentTransaction.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>
      <Link href="/reports">
        <h2 className="text-sm text-center font-semibold mt-4 underline cursor-pointer hover:text-muted-foreground">
          View All Transactions →
        </h2>
      </Link>
    </>
  );
};

export default TransactionTable;
