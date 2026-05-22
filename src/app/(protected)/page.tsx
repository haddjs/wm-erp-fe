"use client";

import { useEffect, useState } from "react";
import { useAuth, isAdmin, ROLES } from "@/context/AuthContext";
import { getBranches } from "@/lib/branch";
import { hasRole } from "@/context/AuthContext";
import { getMPDashboard, getEPDashboard } from "@/lib/dashboard";
import {
  DollarSign,
  Package,
  TrendingUp,
  Filter,
  Calendar,
  PartyPopper,
  CheckCircle,
  Clock,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Branch } from "@/types/branch";
import type {
  MPDashboardResponse,
  EPDashboardResponse,
  DashboardMP,
  DashboardEP,
} from "@/types/dashboard";
import { getMonthlyProcurements } from "@/lib/monthly-procurement";
import { getEventProcurements } from "@/lib/event-procurement";

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [mpData, setMpData] = useState<MPDashboardResponse | null>(null);
  const [epData, setEpData] = useState<EPDashboardResponse | null>(null);
  const [allEPs, setAllEPs] = useState<DashboardEP[]>([]);

  const canViewDashboard = hasRole(user, ROLES.ADMIN, ROLES.GA, ROLES.FINANCE);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (canViewDashboard) fetchDashboardData();
  }, [selectedBranchId, canViewDashboard]);

  const fetchBranches = async () => {
    try {
      const data = await getBranches(1, 100);
      setBranches(data.data ?? []);
    } catch {
      toast.error("Failed to load branches");
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setSelectedPeriod("");
    try {
      const branchList =
        branches.length > 0
          ? branches
          : ((await getBranches(1, 100)).data ?? []);

      const targetBranches = selectedBranchId
        ? branchList.filter((b) => b.id === selectedBranchId)
        : branchList;

      // Summary from dashboard endpoints
      const [mp, ep] = await Promise.all([
        getMPDashboard(selectedBranchId ? { branch_id: selectedBranchId } : {}),
        getEPDashboard(selectedBranchId ? { branch_id: selectedBranchId } : {}),
      ]);
      setMpData(mp);
      setEpData(ep);

      // Tables from list endpoints
      const [mpList, epList] = await Promise.all([
        getMonthlyProcurements({
          branch_id: selectedBranchId || undefined,
          page: 1,
          limit: 100,
        }),
        getEventProcurements({
          branch_id: selectedBranchId || undefined,
          page: 1,
          limit: 100,
        }),
      ]);

      // Inject into mpData as monthly_procurements
      setMpData((prev) => ({
        ...(prev ?? { summary: { total_budget: 0, total_actual_spending: 0 } }),
        monthly_procurements: (mpList ?? [])
          .sort((a, b) => b.period.localeCompare(a.period))
          .slice(0, 5)
          .map((p) => ({
            id: p.id,
            period: p.period,
            status: p.status,
            total_nominal: p.total_nominal,
            actual_spending: p.actual_spending ?? 0,
            items: {
              total: p.procurement_items?.length ?? 0,
              pending:
                p.procurement_items?.filter((i) => i.status === "pending")
                  .length ?? 0,
              purchased:
                p.procurement_items?.filter((i) => i.status === "purchased")
                  .length ?? 0,
              completed:
                p.procurement_items?.filter((i) => i.status === "completed")
                  .length ?? 0,
            },
          })),
      }));

      setAllEPs(
        (epList ?? [])
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
          .slice(0, 5)
          .map((e) => ({
            id: e.id,
            name: e.name,
            date: e.date,
            status: e.status,
            total_nominal: e.total_nominal,
            actual_spending: e.actual_spending ?? 0,
            items: {
              total: e.procurement_items?.length ?? 0,
              pending:
                e.procurement_items?.filter((i) => i.status === "pending")
                  .length ?? 0,
              purchased:
                e.procurement_items?.filter((i) => i.status === "purchased")
                  .length ?? 0,
              completed:
                e.procurement_items?.filter((i) => i.status === "completed")
                  .length ?? 0,
            },
          })),
      );
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const availablePeriods = Array.from(
    new Set((mpData?.monthly_procurements ?? []).map((p) => p.period)),
  ).sort((a, b) => b.localeCompare(a));

  const filteredMP = (mpData?.monthly_procurements ?? []).filter((p) =>
    selectedPeriod ? p.period === selectedPeriod : true,
  );

  const formatPeriod = (period: string) =>
    new Date(`${period}-01`).toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      approved: "bg-green-50 text-green-700 border-green-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      partial: "bg-blue-50 text-blue-700 border-blue-200",
      disburse: "bg-purple-50 text-purple-700 border-purple-200",
    };
    return map[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin border-4 border-blue-600 border-t-transparent rounded-full w-8 h-8" />
      </div>
    );

  const totalBudget =
    (mpData?.summary.total_budget ?? 0) + (epData?.summary.total_budget ?? 0);
  const totalSpending =
    (mpData?.summary.total_actual_spending ?? 0) +
    (epData?.summary.total_actual_spending ?? 0);
  const branchBalance = mpData?.branch?.balance ?? null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Header */}
      <header className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}
            </h1>
            <p className="text-gray-500 mt-0.5">
              {mpData?.branch
                ? `Showing data for ${mpData.branch.name}`
                : "Procurement overview — all branches"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filter:</span>
            </div>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            >
              <option value="">All Branches</option>
              {(branches ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            >
              <option value="">All Periods</option>
              {(availablePeriods ?? []).map((p) => (
                <option key={p} value={p}>
                  {formatPeriod(p)}
                </option>
              ))}
            </select>
            {(selectedBranchId || selectedPeriod) && (
              <button
                onClick={() => {
                  setSelectedBranchId("");
                  setSelectedPeriod("");
                }}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Budget",
            val: `Rp ${totalBudget.toLocaleString("id-ID")}`,
            sub: "Budgeted across all procurements",
            icon: DollarSign,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            title: "Actual Spending",
            val: `Rp ${totalSpending.toLocaleString("id-ID")}`,
            sub: "Confirmed purchase records",
            icon: TrendingUp,
            color: "text-red-600",
            bg: "bg-red-50",
          },
          {
            title: branchBalance !== null ? "Branch Balance" : "Branches",
            val:
              branchBalance !== null
                ? `Rp ${branchBalance.toLocaleString("id-ID")}`
                : branches.length,
            sub:
              branchBalance !== null
                ? (mpData?.branch?.name ?? "")
                : "Total active branches",
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            title: "MP Pending",
            val: (mpData?.monthly_procurements ?? []).filter(
              (p) => p.status === "pending",
            ).length,
            sub: "Monthly procurements awaiting approval",
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500">{s.title}</span>
              <div
                className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}
              >
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.val}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly Procurement Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold">Monthly Procurements</h2>
            {selectedPeriod && (
              <span className="text-xs text-gray-400 ml-1">
                — {formatPeriod(selectedPeriod)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-400">Budget</p>
              <p className="text-sm font-bold text-gray-700">
                Rp {mpData?.summary.total_budget.toLocaleString("id-ID") ?? 0}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Actual</p>
              <p className="text-sm font-bold text-red-600">
                Rp{" "}
                {mpData?.summary.total_actual_spending.toLocaleString(
                  "id-ID",
                ) ?? 0}
              </p>
            </div>
            <Link
              href="/monthly-procurement"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                {[
                  "Period",
                  "Status",
                  "Budget",
                  "Actual Spend",
                  "Items",
                  "",
                ].map((h) => (
                  <th key={h} className="px-6 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMP.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No monthly procurements found
                  </td>
                </tr>
              ) : (
                (filteredMP ?? []).map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {formatPeriod(p.period)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(p.status)}`}
                      >
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-700">
                      Rp {p.total_nominal.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-red-600 font-semibold">
                      Rp {p.actual_spending.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          {p.items.pending}
                        </span>
                        <span className="flex items-center gap-1">
                          <ShoppingCart className="w-3 h-3 text-blue-500" />
                          {p.items.purchased}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {p.items.completed}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/monthly-procurement?id=${p.id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Procurement Table — hidden when period filter active */}
      {!selectedPeriod && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold">Event Procurements</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">Budget</p>
                <p className="text-sm font-bold text-gray-700">
                  Rp {epData?.summary.total_budget.toLocaleString("id-ID") ?? 0}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Actual</p>
                <p className="text-sm font-bold text-red-600">
                  Rp{" "}
                  {epData?.summary.total_actual_spending.toLocaleString(
                    "id-ID",
                  ) ?? 0}
                </p>
              </div>
              <Link
                href="/event-procurement"
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  {[
                    "Event Name",
                    "Date",
                    "Status",
                    "Budget",
                    "Actual Spend",
                    "",
                  ].map((h) => (
                    <th key={h} className="px-6 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allEPs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      No event procurements found
                    </td>
                  </tr>
                ) : (
                  allEPs.map((ep) => (
                    <EPRow
                      key={ep.id}
                      ep={ep}
                      getStatusColor={getStatusColor}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function EPRow({
  ep,
  getStatusColor,
}: {
  ep: NonNullable<EPDashboardResponse["event_procurement"]>;
  getStatusColor: (s: string) => string;
}) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 font-medium text-gray-800">{ep.name}</td>
      <td className="px-6 py-4 text-gray-500 text-sm">
        {new Date(ep.date).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </td>
      <td className="px-6 py-4">
        <span
          className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(ep.status)}`}
        >
          {ep.status.toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4 font-mono text-sm text-gray-700">
        Rp {ep.total_nominal.toLocaleString("id-ID")}
      </td>
      <td className="px-6 py-4 font-mono text-sm text-red-600 font-semibold">
        Rp {ep.actual_spending.toLocaleString("id-ID")}
      </td>
      <td className="px-6 py-4 text-right">
        <Link
          href={`/event-procurement?id=${ep.id}`}
          className="text-xs text-blue-600 hover:underline"
        >
          Detail
        </Link>
      </td>
    </tr>
  );
}
