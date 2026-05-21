"use client";

import { useState, useEffect } from "react";
import { getMonthlyProcurements } from "@/lib/monthly-procurement";
import { getEventProcurements } from "@/lib/event-procurement";
import { getBranches } from "@/lib/branch";
import type { MonthlyProcurement } from "@/types/monthly-procurement";
import type { EventProcurement } from "@/types/event-procurement";
import { AlertCircle, Calendar, Clock, User, Package } from "lucide-react";
import type { Branch } from "@/types/branch";

type Props = {
  type: "monthly" | "event";
  onSelect: (id: string) => void;
  selectedId: string | null;
};

type ProcurementEntry =
  | (MonthlyProcurement & { _type: "monthly" })
  | (EventProcurement & { _type: "event" });

export default function PurchaseRecordList({
  type,
  onSelect,
  selectedId,
}: Props) {
  const [procurements, setProcurements] = useState<ProcurementEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProcurements();
  }, [type]);

  const fetchProcurements = async () => {
    setLoading(true);
    setError(null);
    try {
      if (type === "monthly") {
        const data = await getMonthlyProcurements({ page: 1, limit: 100 });
        const filtered = data.filter(
          (p) => p.status === "approved" || p.status === "partial",
        );
        setProcurements(
          filtered.map((p) => ({ ...p, _type: "monthly" as const })),
        );
      } else {
        const data = await getEventProcurements({ page: 1, limit: 100 });
        const filtered = data.filter(
          (p) => p.status === "approved" || p.status === "disburse",
        );
        setProcurements(
          filtered.map((p) => ({ ...p, _type: "event" as const })),
        );
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      case "partial":
        return "bg-violet-50 text-violet-700 border-violet-200/60 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20";
      case "disburse":
        return "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getLabel = (proc: ProcurementEntry) => {
    if (proc._type === "monthly") {
      return proc.period
        ? new Date(`${proc.period}-01`).toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
          })
        : "Unknown Period";
    }
    return (proc as EventProcurement).name || "Unnamed Event";
  };

  const getPurchasableCount = (proc: ProcurementEntry) => {
    return (proc.procurement_items ?? []).filter(
      (i) => i.status === "purchased",
    ).length;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col bg-slate-50/40 dark:bg-zinc-900/10">
        <div className="p-4 border-b bg-white dark:bg-zinc-950">
          <div className="h-5 bg-slate-200 dark:bg-zinc-800 rounded w-1/2 mb-1.5 animate-pulse" />
          <div className="h-3 bg-slate-100 dark:bg-zinc-800/80 rounded w-1/3 animate-pulse" />
        </div>
        <div className="p-3 space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 p-4 space-y-3 animate-pulse"
            >
              <div className="flex justify-between">
                <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-2/3" />
                <div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-12" />
              </div>
              <div className="h-3 bg-slate-100 dark:bg-zinc-800/60 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col bg-slate-50/40 dark:bg-zinc-900/10">
        <div className="p-6 flex flex-col items-center justify-center text-center my-auto">
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-full mb-3">
            <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-zinc-100 mb-1">
            Failed to Load
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-60 mb-4">
            {error}
          </p>
          <button
            onClick={fetchProcurements}
            className="inline-flex items-center bg-slate-900 dark:bg-zinc-50 text-white dark:text-zinc-950 px-3 py-2 rounded-lg text-xs font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/40 dark:bg-zinc-900/10">
      <div className="p-4 border-b bg-white dark:bg-zinc-950 sticky top-0 z-10">
        <h2 className="font-semibold text-sm text-slate-900 dark:text-zinc-50">
          {type === "monthly" ? "Monthly Procurements" : "Event Procurements"}
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          {procurements.length} procurement
          {procurements.length !== 1 ? "s" : ""} with purchasable items
        </p>
      </div>

      <div className="flex flex-col gap-2 p-3 overflow-y-auto">
        {procurements.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="p-3 bg-slate-100 dark:bg-zinc-800 rounded-full w-fit mx-auto mb-3">
              <Package className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
            </div>
            <p className="text-xs font-medium text-slate-900 dark:text-zinc-200">
              No approved procurements
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5 max-w-50 mx-auto">
              Approved procurements with purchasable items will appear here
            </p>
          </div>
        ) : (
          procurements.map((proc) => {
            const isSelected = selectedId === proc.id;
            const purchasableCount = getPurchasableCount(proc);
            return (
              <div
                key={proc.id}
                onClick={() => onSelect(proc.id)}
                className={`group relative cursor-pointer rounded-xl border p-4 text-left select-none transition-colors duration-150 ${
                  isSelected
                    ? "bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 shadow-sm ring-[1.5px] ring-slate-900/5 dark:ring-zinc-50/10"
                    : "bg-white dark:bg-zinc-950 border-slate-200/80 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30"
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-4 bottom-4 w-1 bg-slate-900 dark:bg-zinc-50 rounded-r-md" />
                )}
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 line-clamp-1 flex-1 tracking-tight">
                    {getLabel(proc)}
                  </h3>
                  <span
                    className={`text-[10px] tracking-wide px-2 py-0.5 rounded-md font-medium border shrink-0 ${getStatusColor(proc.status)}`}
                  >
                    {proc.status.charAt(0).toUpperCase() + proc.status.slice(1)}
                  </span>
                </div>
                <div className="space-y-1.5 mt-2.5 border-t border-slate-100 dark:border-zinc-900 pt-2">
                  <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <User size={12} className="opacity-60" />
                    <span className="truncate">{proc.branch_name}</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-zinc-500 flex items-center gap-1.5">
                    <Clock size={12} className="opacity-40" />
                    <span>
                      {new Date(proc.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                {purchasableCount > 0 && (
                  <div className="mt-2.5 pt-1.5 border-t border-dashed border-slate-100 dark:border-zinc-900/60">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {purchasableCount} item{purchasableCount !== 1 ? "s" : ""}{" "}
                      ready to record
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
