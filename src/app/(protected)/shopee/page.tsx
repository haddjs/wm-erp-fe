"use client";

import { useState, useEffect } from "react";
import { useAuth, ROLES } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Package,
  Receipt,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { importShopeeOrders } from "@/lib/shopee";
import type { ShopeeImportResult } from "@/types/shopee";

function formatIDR(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function ImportResultView({ result }: { result: ShopeeImportResult }) {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-blue-100 dark:border-blue-900/40 rounded-xl p-4 bg-blue-50/50 dark:bg-blue-950/20">
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
            Purchase Records
          </p>
          <p className="text-3xl font-black text-blue-700 dark:text-blue-400 mt-1">
            {result.purchase_records.count}
          </p>
          {result.purchase_records.flagged > 0 && (
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <AlertTriangle size={10} />
              {result.purchase_records.flagged} flagged
            </p>
          )}
        </div>
        <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-50/50 dark:bg-zinc-900/30">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Expenses
          </p>
          <p className="text-3xl font-black text-slate-700 dark:text-zinc-300 mt-1">
            {result.expenses.count}
          </p>
          {result.expenses.flagged > 0 && (
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <AlertTriangle size={10} />
              {result.expenses.flagged} flagged
            </p>
          )}
        </div>
        <div
          className={`border rounded-xl p-4 ${
            result.errors && result.errors.length > 0
              ? "border-rose-200 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/20"
              : "border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20"
          }`}
        >
          <p
            className={`text-[10px] font-bold uppercase tracking-wider ${
              result.errors && result.errors.length > 0
                ? "text-rose-500"
                : "text-emerald-600"
            }`}
          >
            Errors
          </p>
          <p
            className={`text-3xl font-black mt-1 ${
              result.errors && result.errors.length > 0
                ? "text-rose-700 dark:text-rose-400"
                : "text-emerald-700 dark:text-emerald-400"
            }`}
          >
            {result.errors?.length ?? 0}
          </p>
        </div>
      </div>

      {/* Errors */}
      {result.errors && result.errors.length > 0 && (
        <div className="border border-rose-200 dark:border-rose-900/40 rounded-xl p-4 bg-rose-50/30 dark:bg-rose-950/10 space-y-1.5">
          <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">
            Import Errors
          </p>
          {(result.errors ?? []).map((err, i) => (
            <p
              key={i}
              className="text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2"
            >
              <XCircle size={12} className="mt-0.5 shrink-0" />
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Reconciliation */}
      <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-slate-50/70 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-900">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Order Reconciliation
          </p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-zinc-900">
              <th className="px-5 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">
                Order ID
              </th>
              <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
                Total Amount
              </th>
              <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
                Total Nominal
              </th>
              <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-zinc-900">
            {result.reconciliation.map((rec) => (
              <tr
                key={rec.order_id}
                className="hover:bg-slate-50/30 dark:hover:bg-zinc-900/20"
              >
                <td className="px-5 py-3 text-xs font-mono text-slate-600 dark:text-zinc-400">
                  #{rec.order_id}
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono text-slate-700 dark:text-zinc-300">
                  {formatIDR(rec.total_amount)}
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono text-slate-700 dark:text-zinc-300">
                  {formatIDR(rec.total_nominal)}
                </td>
                <td className="px-4 py-3 text-center">
                  {rec.reconciled ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      <CheckCircle2 size={9} />
                      OK
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/60">
                      <XCircle size={9} />
                      DIFF {formatIDR(rec.difference)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ShopeePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);

  const [importResult, setImportResult] = useState<ShopeeImportResult | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await importShopeeOrders(new Date(from), new Date(to));
      setImportResult(result);
    } catch (e: any) {
      setError(e.message ?? "Failed to import");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === ROLES.FINANCE) {
      router.replace("/dashboard");
    }
  }, [user]);

  if (user?.role === ROLES.FINANCE) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b bg-linear-to-r from-orange-50 to-white dark:from-orange-950/20 dark:to-zinc-950 shrink-0">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <ShoppingBag size={18} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-zinc-50 tracking-tight">
              Shopee Import
            </h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              Parse orders from email and route to purchase records or expenses
            </p>
          </div>
        </div>

        {/* Date range + actions */}
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              From
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-700"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              To
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-700"
            />
          </div>
          {!importResult ? (
            <Button
              onClick={handleImport}
              disabled={loading}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              {loading ? "Importing..." : "Import"}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setImportResult(null)}
              className="flex items-center gap-2"
            >
              <RefreshCw size={14} />
              New Import
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/10 text-sm text-rose-700 dark:text-rose-400">
            <XCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Empty state */}
        {!importResult && !loading && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-zinc-500 gap-3">
            <ShoppingBag className="w-12 h-12 text-slate-200 dark:text-zinc-700" />
            <div className="text-center">
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                Ready to import
              </p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                Select a date range and click Import to process Shopee orders
                from email
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
            <p className="text-sm">Importing and matching Shopee orders...</p>
          </div>
        )}

        {/* Import result */}
        {importResult && <ImportResultView result={importResult} />}
      </div>
    </div>
  );
}
