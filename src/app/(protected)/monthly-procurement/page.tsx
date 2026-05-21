"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUp, ClipboardList } from "lucide-react";
import MPList from "@/features/approval-rab/components/monthly-procurement-list";
import MPDetail from "@/features/approval-rab/components/monthly-procurement-detail";
import { ProcurementForm } from "@/components/procurement/ProcurementForm";
import { createMonthlyProcurement } from "@/lib/monthly-procurement";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/context/AuthContext";

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

export default function MonthlyProcurementPage() {
  const { user } = useAuth();

  const canCreate = user?.role === ROLES.ADMIN || user?.role === ROLES.GA;
  const canApprove = user?.role === ROLES.ADMIN || user?.role === ROLES.FINANCE;
  const canView = user?.role === ROLES.GA;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [items, setItems] = useState<ProcurementItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "approve">(
    canCreate ? "create" : "approve",
  );
  const [listKey, setListKey] = useState(0);

  const handleStatusChange = () => setListKey((k) => k + 1);

  const handleAddItem = (item: ProcurementItem) => {
    setItems([...items, item]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    toast.info("Item removed");
  };

  const handleSubmit = async (formData: {
    branch_id: string;
    period: string;
  }) => {
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        branch_id: formData.branch_id,
        period: formData.period,
        items: (items ?? []).map((item) => ({
          category_id: item.category_id,
          item_id: item.item_id,
          code: item.code,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          notes: item.notes,
        })),
      };
      await createMonthlyProcurement(payload);
      toast.success("Monthly procurement created successfully");
      setItems([]);
      if (canApprove) setActiveTab("approve");
    } catch (error: any) {
      console.error("Failed to create:", error);
      toast.error(error.message || "Failed to create monthly procurement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-zinc-900/30">
      <header className="border-b bg-white dark:bg-zinc-950 px-6 py-5 z-10 shadow-sm shadow-slate-100/40 dark:shadow-none">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              Monthly Procurement
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
              {canCreate && canApprove
                ? "Create new procurement requests or review pending approvals"
                : canCreate && canView
                  ? "Create requests or view existing procurement approvals"
                  : canCreate
                    ? "Create and submit new procurement requests"
                    : "Review and approve pending procurement requests"}
            </p>
          </div>
        </div>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "create" | "approve")}
        className="flex-1 flex flex-col w-full"
      >
        {/* Only show tab strip if user can see both tabs */}
        {canCreate && (canApprove || canView) && (
          <div className="border-b bg-white dark:bg-zinc-950 px-6 py-2.5">
            <div className="max-w-7xl mx-auto w-full">
              <TabsList className="grid w-full max-w-sm grid-cols-2 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg">
                <TabsTrigger
                  value="create"
                  className="flex items-center justify-center gap-2 text-sm font-medium transition-none"
                >
                  <FileUp className="w-4 h-4 opacity-70" />
                  Create Request
                </TabsTrigger>
                <TabsTrigger
                  value="approve"
                  className="flex items-center justify-center gap-2 text-sm font-medium transition-none"
                >
                  <ClipboardList className="w-4 h-4 opacity-70" />
                  {canView ? "View Approvals" : "Approve Requests"}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        )}

        {canCreate && (
          <TabsContent
            value="create"
            className="flex-1 mt-0 outline-none focus-visible:ring-0"
          >
            <main className="p-6 max-w-7xl mx-auto w-full">
              <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6">
                <ProcurementForm
                  type="monthly"
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  items={items}
                  onAddItem={handleAddItem}
                  onRemoveItem={handleRemoveItem}
                />
              </div>
            </main>
          </TabsContent>
        )}

        {(canApprove || canView) && (
          <TabsContent
            value="approve"
            className="flex-1 mt-0 outline-none focus-visible:ring-0"
          >
            <div className="flex min-h-125 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <aside className="w-80 md:w-96 shrink-0 border-r border-slate-200 dark:border-zinc-800 h-full overflow-y-auto bg-slate-50/50 dark:bg-zinc-900/10">
                <MPList
                  onSelect={setSelectedId}
                  selectedId={selectedId}
                  key={listKey}
                />
              </aside>
              <main className="flex-1 h-full overflow-y-auto bg-white dark:bg-zinc-950">
                <MPDetail
                  procurementId={selectedId}
                  onStatusChange={handleStatusChange}
                />
              </main>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
