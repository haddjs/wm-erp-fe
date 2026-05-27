"use client";

import { useState, useEffect } from "react";
import { useAuth, ROLES } from "@/context/AuthContext";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/category";
import type { Category } from "@/types/category";
import { Plus, Pencil, Trash2 } from "lucide-react";

// Shadcn UI Imports
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

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  const canEdit = user?.role === ROLES.ADMIN;

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories({ limit: 100 });
      setCategories(response.data ?? []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData);
      }
      await fetchCategories();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save category:", error);
      alert("Failed to save category. Please check your inputs.");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this category? It may affect existing procurement items.",
      )
    ) {
      try {
        await deleteCategory(id);
        await fetchCategories();
      } catch (error) {
        console.error("Failed to delete category:", error);
        alert("Failed to delete category. It might have related items.");
      }
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: "", code: "", description: "" });
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      code: category.code ?? "",
      description: category.description || "",
    });
    setIsModalOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      resetForm();
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">
            Manage expense and income categories
          </p>
        </div>
        {canEdit && (
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        )}
      </div>

      {categories.length > 0 && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <CategoryTable
              categories={categories}
              onEdit={openEditModal}
              onDelete={handleDelete}
              canEdit={canEdit}
            />
          </div>
        </div>
      )}

      {/* Shadcn UI Dialog Form */}
      {canEdit && (
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Make changes to the category details here."
                  : "Fill out the fields below to create a new organization category."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4 py-2">
                <div className="space-y-1">
                  <Label htmlFor="category-name">
                    Category Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="category-name"
                    type="text"
                    placeholder="e.g., Office Supplies, Equipment"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                {!editingCategory && (
                  <div className="space-y-1">
                    <Label htmlFor="category-code">Code</Label>
                    <Input
                      id="category-code"
                      type="text"
                      placeholder="e.g., OFF, EQP"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      className="font-mono uppercase"
                    />
                    <p className="text-xs text-muted-foreground">
                      Short identifier code for this category
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="category-description">Description</Label>
                  <Textarea
                    id="category-description"
                    placeholder="Brief description of this category"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCategory ? "Update" : "Create"} Category
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CategoryTable({
  categories,
  onEdit,
  onDelete,
  canEdit,
}: {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}) {
  return (
    <table className="w-full">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="p-4 text-left text-sm font-semibold text-gray-600">
            Name
          </th>
          <th className="p-4 text-left text-sm font-semibold text-gray-600">
            Code
          </th>
          <th className="p-4 text-left text-sm font-semibold text-gray-600">
            Description
          </th>
          {canEdit && (
            <th className="p-4 w-24 text-center text-sm font-semibold text-gray-600">
              Actions
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {(categories ?? []).map((category) => (
          <tr
            key={category.id}
            className="border-t hover:bg-gray-50 transition-colors"
          >
            <td className="p-4 font-medium text-gray-900">{category.name}</td>
            <td className="p-4">
              {category.code ? (
                <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                  {category.code}
                </span>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </td>
            <td className="p-4 text-gray-600">{category.description || "—"}</td>
            <td className="p-4 text-center">
              {canEdit && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(category)}
                    className="text-blue-600 hover:text-blue-800 h-8 w-8"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
