// app/(protected)/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
} from "@/lib/branch";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/category";
import { getItems, createItem, updateItem, deleteItem } from "@/lib/item";
import { useAuth, isAdmin } from "@/context/AuthContext";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Package,
  Wallet,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import type { Branch } from "@/types/branch";
import type { Category } from "@/types/category";
import type { ItemResponse } from "@/types/item";

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const admin = isAdmin(user);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage branches, categories, and master items
        </p>
      </div>

      <div className="bg-white border-b border-gray-200 px-8 pt-6 pb-0">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">
            Manage branches, categories, and master items
          </p>
        </div>

        <Tabs defaultValue="branches">
          <TabsList className="bg-transparent p-0 h-auto gap-0 border-none">
            <TabsTrigger
              value="branches"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Branches
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Categories
            </TabsTrigger>
            <TabsTrigger
              value="items"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Master Items
            </TabsTrigger>
          </TabsList>

          <div className="px-0 py-6">
            <TabsContent value="branches" className="mt-0">
              <BranchesTab />
            </TabsContent>
            <TabsContent value="categories" className="mt-0">
              <CategoriesTab />
            </TabsContent>
            <TabsContent value="items" className="mt-0">
              <ItemsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Branches Tab ─────────────────────────────────────────────────────────────

function BranchesTab() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    balance: 0,
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const data = await getBranches();
      setBranches(data.data);
    } catch {
      toast.error("Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await updateBranch(editingBranch.id, {
          name: formData.name,
          address: formData.address,
        });
        toast.success("Branch updated");
      } else {
        await createBranch(formData);
        toast.success("Branch created");
      }
      await fetchBranches();
      setIsModalOpen(false);
      resetForm();
    } catch {
      toast.error("Failed to save branch");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this branch?")) return;
    try {
      await deleteBranch(id);
      toast.success("Branch deleted");
      await fetchBranches();
    } catch {
      toast.error("Failed to delete branch. It might have related records.");
    }
  };

  const resetForm = () => {
    setEditingBranch(null);
    setFormData({ name: "", address: "", balance: 0 });
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      balance: branch.balance,
    });
    setIsModalOpen(true);
  };

  const getBalanceStyle = (balance: number) => {
    if (balance <= 0) return "text-red-600 font-semibold";
    if (balance < 1_000_000) return "text-orange-500 font-semibold";
    return "text-green-600 font-semibold";
  };

  const totalBalance = branches.reduce((sum, b) => sum + b.balance, 0);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="grid grid-cols-2 gap-4 flex-1 mr-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Total Balance
              </p>
              <p
                className={`text-lg font-bold ${getBalanceStyle(totalBalance)}`}
              >
                Rp {totalBalance.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Low Balance
              </p>
              <p className="text-lg font-bold text-orange-600">
                {branches.filter((b) => b.balance < 1_000_000).length} branch
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Branch
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">
                Name
              </th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">
                Address
              </th>
              <th className="p-4 text-right text-sm font-semibold text-gray-600">
                Remaining Balance
              </th>
              <th className="p-4 text-center text-sm font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {branches.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">
                  No branches found. Click "Add Branch" to create one.
                </td>
              </tr>
            ) : (
              branches.map((branch) => (
                <tr
                  key={branch.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 font-medium">{branch.name}</td>
                  <td className="p-4 text-gray-600">{branch.address}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {branch.balance <= 0 && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                          Depleted
                        </span>
                      )}
                      {branch.balance > 0 && branch.balance < 1_000_000 && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                          Low
                        </span>
                      )}
                      <span className={getBalanceStyle(branch.balance)}>
                        Rp {branch.balance.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEditModal(branch)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(branch.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <Modal
          title={editingBranch ? "Edit Branch" : "Add New Branch"}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Branch Name" required>
              <input
                type="text"
                placeholder="e.g., Jakarta Pusat"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </Field>
            <Field label="Address" required>
              <textarea
                placeholder="Full branch address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </Field>
            {!editingBranch ? (
              <Field
                label="Initial Balance (Rp)"
                hint="Balance will be automatically adjusted as expenses are recorded"
              >
                <input
                  type="number"
                  placeholder="0"
                  value={formData.balance}
                  min="0"
                  step="1000"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      balance: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </Field>
            ) : (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 font-medium uppercase mb-1">
                  Current Balance
                </p>
                <p
                  className={`text-base font-bold ${getBalanceStyle(editingBranch.balance)}`}
                >
                  Rp {editingBranch.balance.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Balance is managed automatically by expense transactions
                </p>
              </div>
            )}
            <ModalActions
              onCancel={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              submitLabel={editingBranch ? "Update" : "Create"}
            />
          </form>
        </Modal>
      )}
    </>
  );
}

// ─── Categories Tab ───────────────────────────────────────────────────────────

function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await getCategories({ limit: 100 });
      setCategories(res.data);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        toast.success("Category updated");
      } else {
        await createCategory(formData);
        toast.success("Category created");
      }
      await fetchCategories();
      setIsModalOpen(false);
      resetForm();
    } catch {
      toast.error("Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This may affect existing procurement items."))
      return;
    try {
      await deleteCategory(id);
      toast.success("Category deleted");
      await fetchCategories();
    } catch {
      toast.error("Failed to delete category. It might have related items.");
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

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {isModalOpen && (
        <Modal
          title={editingCategory ? "Edit Category" : "Add New Category"}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Category Name" required>
              <input
                type="text"
                placeholder="e.g., Office Supplies, Equipment"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </Field>
            <Field label="Code" hint="Short identifier code for this category">
              <input
                type="text"
                placeholder="e.g., OFF, EQP"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono uppercase"
              />
            </Field>
            <Field label="Description">
              <textarea
                placeholder="Brief description of this category"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </Field>
            <ModalActions
              onCancel={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              submitLabel={editingCategory ? "Update" : "Create"}
            />
          </form>
        </Modal>
      )}
    </>
  );
}

function CategorySection({
  title,
  color,
  categories,
  onEdit,
  onDelete,
  emptyText,
}: {
  title: string;
  color: string;
  categories: Category[];
  onEdit: (c: Category) => void;
  onDelete: (id: string) => void;
  emptyText: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className={`w-2 h-2 ${color} rounded-full`}></span>
        {title} ({categories.length})
      </h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-gray-400">{emptyText}</div>
        ) : (
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
                <th className="p-4 w-24 text-center text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="p-4">
                    {category.code ? (
                      <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        {category.code}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-600">
                    {category.description || "—"}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onEdit(category)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(category.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Items Tab ────────────────────────────────────────────────────────────────

function ItemsTab() {
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    code: "",
    description: "",
    unit: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, categoriesRes] = await Promise.all([
        getItems({ limit: 100 }),
        getCategories({ limit: 100 }),
      ]);
      setItems(itemsRes.data);
      setCategories(categoriesRes.data);
    } catch {
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

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
    if (!formData.code) {
      toast.error("Please enter item code");
      return;
    }
    try {
      if (editingItem) {
        await updateItem(editingItem.id, formData);
        toast.success("Item updated");
      } else {
        await createItem(formData);
        toast.success("Item created");
      }
      await fetchData();
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to save item");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteItem(id);
      toast.success("Item deleted");
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete item");
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      category_id: "",
      name: "",
      code: "",
      description: "",
      unit: "",
    });
  };

  const openEditModal = (item: ItemResponse) => {
    setEditingItem(item);
    setFormData({
      category_id: item.category_id,
      name: item.name,
      code: item.code,
      description: item.description || "",
      unit: item.unit || "",
    });
    setIsModalOpen(true);
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      !selectedCategory || item.category_id === selectedCategory;
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

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="flex justify-between items-start mb-4 gap-4">
        <div className="flex gap-4 flex-1 flex-wrap">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 p-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shrink-0 mt-6"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {itemsByCategory.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No items found</p>
          <p className="text-sm mt-1">
            Click "Add Item" to create your first item
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {itemsByCategory.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-lg border overflow-hidden"
            >
              <div className="bg-gray-50 px-6 py-3 border-b">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  {group.name}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({group.items.length} items)
                  </span>
                </h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left font-medium text-gray-600">
                      Code
                    </th>
                    <th className="p-3 text-left font-medium text-gray-600">
                      Name
                    </th>
                    <th className="p-3 text-left font-medium text-gray-600">
                      Description
                    </th>
                    <th className="p-3 text-left font-medium text-gray-600">
                      Unit
                    </th>
                    <th className="p-3 text-center font-medium text-gray-600 w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 font-mono text-xs text-gray-600">
                        {item.code}
                      </td>
                      <td className="p-3 font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="p-3 text-gray-500">
                        {item.description || "-"}
                      </td>
                      <td className="p-3 text-gray-600">{item.unit || "-"}</td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <Modal
          title={editingItem ? "Edit Item" : "Create New Item"}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Item Code"
              required
              hint="Unique identifier for this item"
            >
              <input
                type="text"
                placeholder="e.g., ITM-001, OFF-100"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className="w-full p-2 border rounded-lg font-mono text-sm"
                required
              />
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
            <Field label="Unit" hint="e.g., pcs, box, kg, unit">
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
            <ModalActions
              onCancel={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              submitLabel={editingItem ? "Update" : "Create"}
            />
          </form>
        </Modal>
      )}
    </>
  );
}

// ─── Shared UI Helpers ────────────────────────────────────────────────────────

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
