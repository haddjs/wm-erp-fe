"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Receipt, Plus } from "lucide-react";

import { useExpense } from "@/hooks/useExpense";
import { getCategories } from "@/lib/category";
import { getBranches } from "@/lib/branch";
import { getUserProfile } from "@/lib/auth";

const ExpenseForm = () => {
  const { createExpense, loading } = useExpense();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);

  const [selectedCategories, setSelectedCategories] =
    useState("Select category");

  const [userId, setUserId] = useState("");

  const [form, setForm] = useState({
    name: "",
    amount: "",
    nominal: "",
    unit: "",
    source: "",
    category_id: "" as string,
    branch_id: "" as string,
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, branchesData, profileData] = await Promise.all([
          getCategories(),
          getBranches(),
          getUserProfile(),
        ]);

        setCategories(categoriesData.data);
        setBranches(branchesData.data);
        setUserId(profileData.data.id);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load initial data");
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      if (!form.name || !form.amount || !form.nominal || !form.category_id) {
        toast.error("Please fill all required fields");
        return;
      }

      const payload = {
        ...form,
        user_id: userId,
        amount: Number(form.amount),
        nominal: Number(form.nominal),
        date: new Date(form.date).toISOString(),
      };

      await createExpense(payload);

      toast.success("Expense created successfully!");

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

      setSelectedCategories("Select category");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Something went wrong");
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

    setForm({
      ...form,
      nominal: raw,
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <div className="flex gap-2 items-center">
          <Receipt className="w-12 h-12 text-blue-500 bg-blue-200 p-3 rounded-lg" />
          <div>
            <h1 className="font-semibold">Expense Form</h1>
            <p className="text-sm text-gray-400">
              Record a completed expense transaction
            </p>
          </div>
        </div>

        <Select
          value={form.branch_id}
          onValueChange={(value) => {
            if (!value) return;

            setForm((prev) => ({
              ...prev,
              branch_id: value,
            }));
          }}
        >
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Select Branch">
              {branches.find((b) => b.id === form.branch_id)?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Branches</SelectLabel>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Input
          placeholder="Item name (e.g Biznet Langganan)"
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
          placeholder="Nominal (e.g 150000)"
          type="text"
          value={form.nominal ? `Rp ${formatNominal(form.nominal)}` : ""}
          onChange={(e) => handleNominal(e.target.value)}
        />

        <Input
          placeholder="Unit (e.g package)"
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
        />

        <Input
          placeholder="Source (e.g Shopee)"
          value={form.source}
          onChange={(e) => setForm({ ...form, source: e.target.value })}
        />

        <Select
          value={selectedCategories}
          onValueChange={(value) => {
            if (!value) return;
            const selectedCat = categories.find((cat) => cat.name === value);
            if (selectedCat) {
              setSelectedCategories(value);
              setForm((prev) => ({
                ...prev,
                category_id: selectedCat.id,
              }));
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Categories</SelectLabel>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Input
          placeholder="Date"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />

        <div className="flex justify-between">
          <Button onClick={handleSubmit} disabled={loading}>
            <Plus />
            Add Expense
          </Button>
          <Button>
            Add Invoice <span className="">BETA</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
