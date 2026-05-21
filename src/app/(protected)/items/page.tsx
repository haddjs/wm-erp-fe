"use client";

import { useState, useEffect } from "react";
import { getItems, createItem, updateItem, deleteItem } from "@/lib/item";
import { useAuth, ROLES } from "@/context/AuthContext";
import { getCategories } from "@/lib/category";
import { Plus, Pencil, Search, Package, X } from "lucide-react";
import { toast } from "sonner";
import type { ItemResponse } from "@/types/item";
import type { Category } from "@/types/category";

// Shadcn UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ItemsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    variant: "",
    description: "",
    unit: "",
  });

  const canEdit = user?.role === ROLES.ADMIN;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, categoriesRes] = await Promise.all([
        getItems({ limit: 100 }),
        getCategories({ limit: 100 }),
      ]);
      setItems(itemsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id) {
      toast.error("Please select a category");
      return;
    }
    if (!formData.name) {
      toast.error("Please enter item name");
      return;
    }
    try {
      if (editingItem) {
        await updateItem(editingItem.id, {
          category_id: formData.category_id,
          name: formData.name,
          variant: formData.variant || null,
          description: formData.description || null,
          unit: formData.unit === "" ? null : formData.unit,
        });
        toast.success("Item updated");
      } else {
        await createItem({
          category_id: formData.category_id,
          name: formData.name,
          variant: formData.variant || undefined,
          description: formData.description || undefined,
          unit: formData.unit || undefined,
        });
        toast.success("Item created");
      }
      await fetchData();
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to save item");
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      category_id: "",
      name: "",
      variant: "",
      description: "",
      unit: "",
    });
  };

  const openEditModal = (item: ItemResponse) => {
    setEditingItem(item);
    setFormData({
      category_id: item.category_id,
      name: item.name,
      variant: item.variant ?? "",
      description: item.description ?? "",
      unit: item.unit ?? "",
    });
    setIsModalOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === "ALL" || item.category_id === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const itemsByCategory = categories
    .map((category) => ({
      ...category,
      items: filteredItems.filter((item) => item.category_id === category.id),
    }))
    .filter((group) => group.items.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Items</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage procurement items and inventory
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-50">
            <Label className="mb-1.5 block">Category Filter</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value: string | null) =>
                setSelectedCategory(value || "")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-50">
            <Label className="mb-1.5 block">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      {itemsByCategory.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/60" />
          <p className="text-lg font-medium text-foreground">No items found</p>
          <p className="text-sm mt-1">
            Click "Add Item" to create your first item
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {itemsByCategory.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-lg border overflow-hidden shadow-sm"
            >
              <div className="bg-muted/40 px-6 py-3 border-b">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  {group.name}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({group.items.length} items)
                  </span>
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/20 border-b">
                    <tr>
                      <th className="p-3 text-left font-medium text-muted-foreground">
                        Code
                      </th>
                      <th className="p-3 text-left font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="p-3 text-left font-medium text-muted-foreground">
                        Variant
                      </th>
                      <th className="p-3 text-left font-medium text-muted-foreground">
                        Description
                      </th>
                      <th className="p-3 text-left font-medium text-muted-foreground">
                        Unit
                      </th>
                      {canEdit && (
                        <th className="p-3 text-center font-medium text-muted-foreground w-24">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="p-3 font-mono text-xs text-muted-foreground">
                          {item.code}
                        </td>
                        <td className="p-3 font-medium text-foreground">
                          {item.name}
                        </td>
                        <td className="p-3 font-medium text-foreground">
                          {item.variant}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {item.description || "-"}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {item.unit || "-"}
                        </td>
                        {canEdit && (
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditModal(item)}
                                className="text-blue-600 hover:text-blue-800 h-8 w-8"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal via Shadcn Dialog */}
      <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Item" : "Create New Item"}
            </DialogTitle>
            <DialogDescription>
              Provide inventory specific metadata tags and indexing parameters.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Category" required>
              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Item Name" required>
              <input
                type="text"
                placeholder="e.g., A4 Paper, Projector"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                required
              />
            </Field>

            <Field
              label="Variant"
              hint="e.g., F4, Red, 500ml — leave empty if no variant"
            >
              <input
                type="text"
                placeholder="e.g., F4 size, Red color"
                value={formData.variant}
                onChange={(e) =>
                  setFormData({ ...formData, variant: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
              />
            </Field>

            <Field label="Unit" hint="e.g., pcs, box, kg">
              <input
                type="text"
                placeholder="e.g., pcs, box, kg"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unit: e.target.value.toLowerCase(),
                  })
                }
                className="w-full p-2 border rounded-lg"
              />
            </Field>

            <Field label="Description">
              <textarea
                placeholder="Item description, specifications, etc."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                rows={3}
              />
            </Field>

            {/* Show auto-generated code on edit as read-only */}
            {editingItem && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 font-medium uppercase mb-1">
                  Auto-generated Code
                </p>
                <span className="font-mono text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {editingItem.code}
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  Code is generated automatically based on category and variant
                </p>
              </div>
            )}

            <ModalActions
              onCancel={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              submitLabel={editingItem ? "Update" : "Create"}
            />
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function ModalActions({
  onCancel,
  submitLabel,
}: {
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {submitLabel}
      </button>
    </div>
  );
}
