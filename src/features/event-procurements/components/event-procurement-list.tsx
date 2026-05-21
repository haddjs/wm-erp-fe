// features/approval-ep/components/event-procurement-list.tsx
"use client";

import { useState, useEffect } from "react";
import { getEventProcurements } from "@/lib/event-procurement";
import type { EventProcurement } from "@/types/event-procurement";
import Link from "next/link";
import { Calendar, User, Clock, AlertCircle } from "lucide-react";

export default function EventProcurementList({
  onSelect,
  selectedId,
}: {
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  const [procurements, setProcurements] = useState<EventProcurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProcurements();
  }, []);

  const fetchProcurements = async () => {
    setLoading(true);
    setError(null);

    try {
      const branch_id = "3CLldlFSwsMOMtj3CewVZJsND87";
      const data = await getEventProcurements({ branch_id });
      setProcurements(data);
    } catch (err: any) {
      console.error("Failed to fetch event procurements:", err);
      setError(err.message || "Failed to load event procurements");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
      case "disburse":
        return "bg-violet-50 text-violet-700 border-violet-200/60 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "disburse":
        return "Disbursed";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col bg-slate-50/40 dark:bg-zinc-900/10">
        <div className="p-4 border-b bg-white dark:bg-zinc-950">
          <div className="h-5 bg-slate-200 dark:bg-zinc-800 rounded w-1/2 mb-1.5 animate-pulse" />
          <div className="h-3 bg-slate-100 dark:bg-zinc-800/80 rounded w-1/3 animate-pulse" />
        </div>
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-2/3 animate-pulse" />
                <div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-12 animate-pulse" />
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="h-3 bg-slate-100 dark:bg-zinc-800/60 rounded w-1/2 animate-pulse" />
                <div className="h-3 bg-slate-100 dark:bg-zinc-800/60 rounded w-2/3 animate-pulse" />
              </div>
              <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/3 pt-1 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col bg-slate-50/40 dark:bg-zinc-900/10">
        <div className="p-4 border-b bg-white dark:bg-zinc-950">
          <h2 className="font-semibold text-sm text-slate-900 dark:text-zinc-50">
            Event Procurement
          </h2>
        </div>
        <div className="p-6 flex flex-col items-center justify-center text-center my-auto">
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-full text-rose-600 dark:text-rose-400 mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-zinc-100 mb-1">
            Failed to Load Content
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-60 mb-4">
            {error}
          </p>
          <button
            onClick={fetchProcurements}
            className="w-full max-w-40 inline-flex justify-center items-center bg-slate-900 dark:bg-zinc-50 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/40 dark:bg-zinc-900/10">
      <div className="p-4 border-b bg-white dark:bg-zinc-950 sticky top-0 z-10">
        <div>
          <h2 className="font-semibold text-sm text-slate-900 dark:text-zinc-50">
            Request Log
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {procurements.length} running event
            {procurements.length !== 1 ? "s" : ""} recorded
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3 space-y-2.5 overflow-y-auto">
        {procurements.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="p-3 bg-slate-100 dark:bg-zinc-800 rounded-full w-fit mx-auto mb-3">
              <Calendar className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
            </div>
            <p className="text-xs font-medium text-slate-900 dark:text-zinc-200">
              No requests found
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5 max-w-50 mx-auto">
              There are no event procurement logs available for this branch.
            </p>
            <Link
              href="/event-procurement"
              className="inline-block mt-4 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Create your first event →
            </Link>
          </div>
        ) : (
          procurements.map((proc) => {
            const isSelected = selectedId === proc.id;
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
                {/* Clean left-accent focus active bar marker replacing messy wrap outlines */}
                {isSelected && (
                  <div className="absolute left-0 top-4 bottom-4 w-1 bg-slate-900 dark:bg-zinc-50 rounded-r-md" />
                )}

                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 line-clamp-1 flex-1 tracking-tight">
                    {proc.name}
                  </h3>
                  <span
                    className={`text-[10px] tracking-wide px-2 py-0.5 rounded-md font-medium border shrink-0 ${getStatusColor(
                      proc.status,
                    )}`}
                  >
                    {getStatusLabel(proc.status)}
                  </span>
                </div>

                <div className="space-y-1.5 mt-2.5 border-t border-slate-100 dark:border-zinc-900 pt-2">
                  <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <User size={12} className="opacity-60 text-slate-400" />
                    <span className="truncate max-w-45">
                      {proc.submitter_name || proc.submitter_id} -{" "}
                      {proc.branch_name || proc.branch_id}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Calendar size={12} className="opacity-60 text-slate-400" />
                    <span>Event: {formatDate(proc.date)}</span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-zinc-500 flex items-center gap-1.5">
                    <Clock size={12} className="opacity-40 text-slate-400" />
                    <span>Created: {formatDate(proc.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
