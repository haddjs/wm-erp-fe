// components/procurement/ProcurementForm.tsx
"use client";

import { useState, useEffect } from "react";
import { getBranches } from "@/lib/branch";
import { getItems } from "@/lib/item";
import { getCategories } from "@/lib/category";
import { Plus, Trash2, Package, PenBox } from "lucide-react";

import type { Branch } from "@/types/branch";
import type { Category } from "@/types/category";
import type { ItemResponse } from "@/types/item";

interface ProcurementItem {
  category_id: string;
  item_id: string | null;
  code: string;
  quantity: number;
  unit: string | null;
  unit_price: number;
  notes?: string;
}

interface ProcurementFormProps {
  type: "monthly" | "event";
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
}

type ItemInputMode = "master" | "custom";

export default function ProcurementForm({
  type,
  onSubmit,
  isSubmitting = false,
}: ProcurementFormProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    branch_id: "",
    name: "",
    date: new Date().toISOString().split("T")[0],
    period: new Date().toISOString().slice(0, 7),
    items: [] as ProcurementItem[],
  });

  const [currentItem, setCurrentItem] = useState<ProcurementItem>({
    category_id: "",
    item_id: null,
    code: "",
    quantity: 1,
    unit: "",
    unit_price: 0,
    notes: "",
  });

  const [itemInputMode, setItemInputMode] = useState<ItemInputMode>("master");
  const [filteredItems, setFilteredItems] = useState<ItemResponse[]>([]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (currentItem.category_id) {
      const filtered = (items ?? []).filter(
        (item) => item.category_id === currentItem.category_id,
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
  }, [currentItem.category_id, items]);

  const fetchMasterData = async () => {
    setLoading(true);
    try {
      const [branchesData, categoriesData, itemsData] = await Promise.all([
        getBranches(),
        getCategories({ limit: 100 }),
        getItems({ limit: 100 }),
      ]);
      setBranches(branchesData.data ?? []);
      setCategories(categoriesData.data ?? []);
      setItems(itemsData.data ?? []);
    } catch (error) {
      console.error("Failed to fetch master data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMasterItemSelect = (itemId: string) => {
    const selectedItem = items.find((i) => i.id === itemId);
    if (selectedItem) {
      setCurrentItem({
        ...currentItem,
        item_id: selectedItem.id,
        code: selectedItem.code,
        unit: selectedItem.unit,
        unit_price: currentItem.unit_price,
      });
    }
  };

  const addItem = () => {
    // Validation
    if (!currentItem.category_id) {
      alert("Please select a category");
      return;
    }
    if (!currentItem.code) {
      alert("Please enter an item code");
      return;
    }
    if (!currentItem.unit) {
      alert("Please enter a unit");
      return;
    }
    if (currentItem.quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }
    if (currentItem.unit_price <= 0) {
      alert("Please enter a valid unit price");
      return;
    }

    setFormData({
      ...formData,
      items: [...formData.items, { ...currentItem }],
    });

    // Reset current item
    setCurrentItem({
      category_id: "",
      item_id: null,
      code: "",
      quantity: 1,
      unit: "",
      unit_price: 0,
      notes: "",
    });
    setItemInputMode("master");
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: (formData.items ?? []).filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      alert("Please add at least one item");
      return;
    }

    if (!formData.branch_id) {
      alert("Please select a branch");
      return;
    }

    if (type === "event" && !formData.name) {
      alert("Please enter event name");
      return;
    }

    if (type === "monthly" && !formData.period) {
      alert("Please select period");
      return;
    }

    const payload =
      type === "monthly"
        ? {
            branch_id: formData.branch_id,
            period: formData.period,
            items: formData.items.map((item) => ({
              ...item,
              item_id: item.item_id || null, // Ensure null if empty
            })),
          }
        : {
            branch_id: formData.branch_id,
            name: formData.name,
            date: new Date(formData.date).toISOString(),
            items: formData.items.map((item) => ({
              ...item,
              item_id: item.item_id || null,
            })),
          };

    await onSubmit(payload);
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0,
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch *
            </label>
            <select
              value={formData.branch_id}
              onChange={(e) =>
                setFormData({ ...formData, branch_id: e.target.value })
              }
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          {type === "monthly" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period *
              </label>
              <input
                type="month"
                value={formData.period}
                onChange={(e) =>
                  setFormData({ ...formData, period: e.target.value })
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Company Anniversary, Team Building"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Item Section */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Add Items</h2>

        {/* Item Input Mode Toggle */}
        <div className="mb-4 flex gap-4 border-b pb-3">
          <button
            type="button"
            onClick={() => setItemInputMode("master")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              itemInputMode === "master"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Package size={16} />
            Select from Master Items
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={currentItem.category_id}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, category_id: e.target.value })
              }
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {itemInputMode === "master" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Master Item (Optional)
              </label>
              <select
                value={currentItem.item_id || ""}
                onChange={(e) => handleMasterItemSelect(e.target.value)}
                className="w-full p-2 border rounded-lg"
                disabled={!currentItem.category_id}
              >
                <option value="">Select from master items</option>
                {filteredItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.code}) - {item.unit}
                  </option>
                ))}
              </select>
              {!currentItem.category_id && (
                <p className="text-xs text-gray-400 mt-1">
                  Select category first
                </p>
              )}
            </div>
          )}

          {itemInputMode === "master" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Code
                </label>
                <input
                  type="text"
                  value={currentItem.code}
                  disabled
                  className="w-full p-2 border rounded-lg bg-gray-50 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  value={currentItem.unit ?? ""}
                  disabled
                  className="w-full p-2 border rounded-lg bg-gray-50"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              value={currentItem.quantity}
              onChange={(e) =>
                setCurrentItem({
                  ...currentItem,
                  quantity: Number(e.target.value),
                })
              }
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Price *
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={currentItem.unit_price}
              onChange={(e) =>
                setCurrentItem({
                  ...currentItem,
                  unit_price: Number(e.target.value),
                })
              }
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div
            className={
              itemInputMode === "master" ? "lg:col-span-2" : "lg:col-span-1"
            }
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Additional notes"
                value={currentItem.notes}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, notes: e.target.value })
                }
                className="flex-1 p-2 border rounded-lg"
              />
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Items Table */}
        {formData.items.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Code</th>
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2 text-left">Item Name</th>
                  <th className="p-2 text-right">Qty</th>
                  <th className="p-2 text-left">Unit</th>
                  <th className="p-2 text-right">Unit Price</th>
                  <th className="p-2 text-right">Total</th>
                  <th className="p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, idx) => {
                  const category = categories.find(
                    (c) => c.id === item.category_id,
                  );
                  const masterItem = items.find((i) => i.id === item.item_id);
                  const isMasterItem = !!item.item_id;
                  const totalPrice = item.quantity * item.unit_price;

                  return (
                    <tr key={idx} className="border-t">
                      <td className="p-2">
                        {isMasterItem ? (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            Master
                          </span>
                        ) : (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                            Ad-hoc
                          </span>
                        )}
                      </td>
                      <td className="p-2 font-mono text-xs">{item.code}</td>
                      <td className="p-2">{category?.name || "-"}</td>
                      <td className="p-2">{masterItem?.name || "-"}</td>
                      <td className="p-2 text-right">{item.quantity}</td>
                      <td className="p-2">{item.unit}</td>
                      <td className="p-2 text-right">
                        Rp {item.unit_price.toLocaleString()}
                      </td>
                      <td className="p-2 text-right font-medium">
                        Rp {totalPrice.toLocaleString()}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={7} className="p-2 text-right font-semibold">
                    Total:
                  </td>
                  <td className="p-2 text-right font-bold text-blue-600">
                    Rp {calculateTotal().toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || formData.items.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting
            ? "Creating..."
            : `Create ${type === "monthly" ? "Monthly" : "Event"} Procurement`}
        </button>
      </div>
    </form>
  );
}
