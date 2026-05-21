"use client";

import { useState, useEffect } from "react";
import {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
} from "@/lib/branch";
import type { Branch } from "@/types/branch";
import { useAuth } from "@/context/AuthContext";
import { Plus, Pencil, Trash2, Wallet } from "lucide-react";

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

export default function BranchesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    balance: 0,
  });

  const isAdminUser = user?.role === "Admin";

  useEffect(() => {
    if (!authLoading && user) {
      if (isAdminUser) {
        fetchBranches();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading, isAdminUser]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const data = await getBranches();
      setBranches(data.data);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        // Don't send balance on update — it's managed by expense transactions
        await updateBranch(editingBranch.id, {
          name: formData.name,
          address: formData.address,
        });
      } else {
        await createBranch(formData);
      }
      await fetchBranches();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save branch:", error);
      alert("Failed to save branch. Please check your inputs.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this branch?")) {
      try {
        await deleteBranch(id);
        await fetchBranches();
      } catch (error) {
        console.error("Failed to delete branch:", error);
        alert("Failed to delete branch. It might have related records.");
      }
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

  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const getBalanceStyle = (balance: number) => {
    if (balance <= 0) return "text-red-600 font-semibold";
    if (balance < 1_000_000) return "text-orange-500 font-semibold";
    return "text-green-600 font-semibold";
  };

  const totalBalance = branches.reduce((sum, b) => sum + b.balance, 0);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (loading && isAdminUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAdminUser) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          ⚠️ Access Denied
          <p className="text-sm mt-1 text-red-600">
            This page is only accessible by administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
          <p className="text-gray-500 mt-1">
            Manage branch locations and budgets
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Branch
        </Button>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">
              Total Balance
            </p>
            <p className={`text-lg font-bold ${getBalanceStyle(totalBalance)}`}>
              Rp {totalBalance.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
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
              <th className="p-4 w-28 text-center text-sm font-semibold text-gray-600">
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
                  <td className="p-4 font-medium text-gray-900">
                    {branch.name}
                  </td>
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
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(branch)}
                        className="text-blue-600 hover:text-blue-800 h-8 w-8"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(branch.id)}
                        className="text-destructive hover:text-destructive/90 h-8 w-8"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Shadcn UI Dialog */}
      <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBranch ? "Edit Branch" : "Add New Branch"}
            </DialogTitle>
            <DialogDescription>
              {editingBranch
                ? "Update structural details for this office location."
                : "Register a fresh corporate branch location and provision initial budgets."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="branch-name">
                  Branch Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="branch-name"
                  type="text"
                  placeholder="e.g., Jakarta Pusat"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="branch-address">
                  Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="branch-address"
                  placeholder="Full branch address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  rows={3}
                  required
                />
              </div>

              {/* Only show initial balance on create */}
              {!editingBranch && (
                <div className="space-y-1">
                  <Label htmlFor="initial-balance">Initial Balance (Rp)</Label>
                  <Input
                    id="initial-balance"
                    type="number"
                    placeholder="0"
                    value={formData.balance || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        balance: Number(e.target.value),
                      })
                    }
                    min="0"
                    step="1000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Balance will be automatically adjusted as expenses are
                    recorded
                  </p>
                </div>
              )}

              {/* Show read-only balance info on edit */}
              {editingBranch && (
                <div className="bg-muted/50 rounded-lg p-3 border">
                  <p className="text-xs text-muted-foreground font-medium uppercase mb-1">
                    Current Balance
                  </p>
                  <p
                    className={`text-base font-bold ${getBalanceStyle(editingBranch.balance)}`}
                  >
                    Rp {editingBranch.balance.toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Balance is managed automatically by expense transactions
                  </p>
                </div>
              )}
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
                {editingBranch ? "Update" : "Create"} Branch
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
