// components/procurement/ProcurementForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Info, Plus, Trash2 } from "lucide-react";
import { getBranches } from "@/lib/branch";
import { getCategories } from "@/lib/category";
import { getItems } from "@/lib/item";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

import type { Branch } from "@/types/branch";
import type { Category } from "@/types/category";
import type { ItemResponse } from "@/types/item";

interface ProcurementItem {
  id: string;
  category_id: string;
  category_name?: string;
  item_id: string;
  item_name?: string;
  code: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  notes?: string;
}

interface ProcurementFormProps {
  type: "monthly" | "event";
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  items: ProcurementItem[];
  onAddItem: (item: ProcurementItem) => void;
  onRemoveItem: (id: string) => void;
}

export const ProcurementForm = ({
  type,
  onSubmit,
  isSubmitting,
  items,
  onAddItem,
  onRemoveItem,
}: ProcurementFormProps) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [itemsList, setItemsList] = useState<ItemResponse[]>([]);
  const [branchId, setBranchId] = useState("");
  const [optionsLoading, setOptionsLoading] = useState(false);

  // Monthly specific
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // Event specific
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });

  const [filteredItems, setFilteredItems] = useState<ItemResponse[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      const filtered = itemsList.filter(
        (item) => item.category_id === selectedCategoryId,
      );
      setFilteredItems(filtered);
      setSelectedItemId("");
    } else {
      setFilteredItems([]);
    }
  }, [selectedCategoryId, itemsList]);

  const fetchData = async () => {
    setOptionsLoading(true);
    try {
      const [branchesData, categoriesData, itemsData] = await Promise.all([
        getBranches(),
        getCategories({ limit: 100 }),
        getItems({ limit: 100 }),
      ]);
      setBranches(branchesData.data ?? []);
      setCategories(categoriesData.data ?? []);
      setItemsList(itemsData.data ?? []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load form data");
    } finally {
      setOptionsLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!selectedCategoryId) {
      toast.error("Please select a category");
      return;
    }
    if (!selectedItemId) {
      toast.error("Please select an item");
      return;
    }
    if (quantity <= 0) {
      toast.error("Please enter valid quantity");
      return;
    }
    if (unitPrice <= 0) {
      toast.error("Please enter valid unit price");
      return;
    }

    const category = categories.find((c) => c.id === selectedCategoryId);
    const selectedItem = itemsList.find((i) => i.id === selectedItemId);

    if (!selectedItem) {
      toast.error("Selected item not found");
      return;
    }

    const newItem: ProcurementItem = {
      id: uuidv4(),
      category_id: selectedCategoryId,
      category_name: category?.name,
      item_id: selectedItem.id,
      item_name: selectedItem.name,
      code: selectedItem.code,
      quantity: quantity,
      unit: selectedItem.unit || "",
      unit_price: unitPrice,
      total_price: quantity * unitPrice,
      notes: notes,
    };

    onAddItem(newItem);

    setSelectedCategoryId("");
    setSelectedItemId("");
    setQuantity(1);
    setUnitPrice(0);
    setNotes("");
    toast.success("Item added");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId) {
      toast.error("Please select a branch");
      return;
    }

    if (type === "monthly") {
      if (!period) {
        toast.error("Please select a period");
        return;
      }
    } else {
      if (!eventName.trim()) {
        toast.error("Please enter event name");
        return;
      }
      if (!eventDate) {
        toast.error("Please select event date");
        return;
      }
    }

    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    const payload =
      type === "monthly"
        ? { branch_id: branchId, period }
        : { branch_id: branchId, name: eventName, date: eventDate };

    onSubmit(payload);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total_price, 0);
  };

  const selectedItemDetails = itemsList.find((i) => i.id === selectedItemId);

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {type === "monthly" ? "Basic Information" : "Event Information"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="branch"
              className="text-sm font-medium text-gray-700"
            >
              Branch <span className="text-red-500">*</span>
            </Label>
            <Select
              value={branchId}
              onValueChange={(value: string | null) => setBranchId(value || "")}
              disabled={optionsLoading}
            >
              <SelectTrigger id="branch" className="w-full">
                <SelectValue placeholder="Select branch">
                  {optionsLoading
                    ? "Loading..."
                    : branchId
                      ? branches.find((b) => b.id === branchId)?.name
                      : "Select branch"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === "monthly" ? (
            <div className="space-y-1.5">
              <Label
                htmlFor="period"
                className="text-sm font-medium text-gray-700"
              >
                Period <span className="text-red-500">*</span>
              </Label>
              <Input
                id="period"
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-400">
                Select the month and year for this procurement
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label
                  htmlFor="eventName"
                  className="text-sm font-medium text-gray-700"
                >
                  Event Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="eventName"
                  type="text"
                  placeholder="e.g., Company Anniversary, Team Building"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="eventDate"
                  className="text-sm font-medium text-gray-700"
                >
                  Event Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-400">
                  Select the date of the event
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Items Section - Same as before */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Items</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Category Select */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedCategoryId}
              onValueChange={(value: string | null) =>
                setSelectedCategoryId(value || "")
              }
              disabled={optionsLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {optionsLoading
                    ? "Loading..."
                    : selectedCategoryId
                      ? categories.find((c) => c.id === selectedCategoryId)
                          ?.name
                      : "Select category"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Item Select */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Item <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedItemId}
              onValueChange={(value: string | null) =>
                setSelectedItemId(value || "")
              }
              disabled={!selectedCategoryId || optionsLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {optionsLoading
                    ? "Loading..."
                    : selectedItemId
                      ? filteredItems.find((i) => i.id === selectedItemId)?.name
                      : "Select Item"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {filteredItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} ({item.code}) - {item.unit || "N/A"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">Code</Label>
            <Input
              value={selectedItemDetails?.code || ""}
              disabled
              className="bg-gray-50 font-mono text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">Unit</Label>
            <Input
              value={selectedItemDetails?.unit || ""}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Quantity <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              min="1"
              value={quantity === 0 ? "" : quantity}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  setQuantity(0);
                } else {
                  const num = Number(val);
                  if (!isNaN(num) && num >= 0) {
                    setQuantity(num);
                  }
                }
              }}
              onBlur={() => {
                if (quantity <= 0) {
                  setQuantity(1);
                }
              }}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Unit Price <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              min="0"
              step="1000"
              value={unitPrice === 0 ? "" : unitPrice}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  setUnitPrice(0);
                } else {
                  const num = Number(val);
                  if (!isNaN(num) && num >= 0) {
                    setUnitPrice(num);
                  }
                }
              }}
              className="w-full"
              placeholder="0"
            />
          </div>

          {/* Notes and Add Button */}
          <div className="lg:col-span-2 space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Notes (Optional)
            </Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Additional notes about this item"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddItem}
                className="gap-1"
                disabled={optionsLoading}
              >
                <Plus size={16} />
                Add Item
              </Button>
            </div>
          </div>
        </div>

        {/* Items Table */}
        {items.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-left font-medium text-gray-600">
                    Code
                  </th>
                  <th className="p-3 text-left font-medium text-gray-600">
                    Category
                  </th>
                  <th className="p-3 text-left font-medium text-gray-600">
                    Item Name
                  </th>
                  <th className="p-3 text-right font-medium text-gray-600">
                    Qty
                  </th>
                  <th className="p-3 text-left font-medium text-gray-600">
                    Unit
                  </th>
                  <th className="p-3 text-right font-medium text-gray-600">
                    Unit Price
                  </th>
                  <th className="p-3 text-right font-medium text-gray-600">
                    Total
                  </th>
                  <th className="p-3 text-center font-medium text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs">{item.code}</td>
                    <td className="p-3">{item.category_name || "-"}</td>
                    <td className="p-3 font-medium">{item.item_name || "-"}</td>
                    <td className="p-3 text-right">{item.quantity}</td>
                    <td className="p-3">{item.unit}</td>
                    <td className="p-3 text-right">
                      Rp {item.unit_price.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-medium">
                      Rp {item.total_price.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t">
                <tr>
                  <td
                    colSpan={6}
                    className="p-3 text-right font-semibold text-gray-700"
                  >
                    Total:
                  </td>
                  <td className="p-3 text-right font-bold text-blue-600">
                    Rp {calculateTotal().toLocaleString()}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Submit Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              Ready to submit?
            </p>
            <p className="text-xs text-blue-600">
              After submission, this procurement will wait for Finance approval
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            onClick={handleFormSubmit}
            disabled={isSubmitting || items.length === 0}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Send size={16} />
            {isSubmitting ? "Submitting..." : "Submit for Approval"}
          </Button>
        </div>
      </div>
    </div>
  );
};
