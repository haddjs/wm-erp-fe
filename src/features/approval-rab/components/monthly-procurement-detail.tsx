"use client";

import { useState, useEffect } from "react";
import {
  getMonthlyProcurementById,
  reviseMonthlyProcurement,
  updateMonthlyProcurementStatus,
} from "@/lib/monthly-procurement";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/context/AuthContext";
import type { MonthlyProcurement } from "@/types/monthly-procurement";
import {
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProcurementTable from "@/features/event-procurements/components/event-procurement-table";

export default function MonthlyProcurementDetail({
  procurementId,
  onStatusChange,
}: {
  procurementId: string | null;
  onStatusChange?: () => void;
}) {
  const { user } = useAuth();
  const [procurement, setProcurement] = useState<MonthlyProcurement | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [revising, setRevising] = useState(false);

  const canApprove = user?.role === ROLES.ADMIN || user?.role === ROLES.FINANCE;
  const canEditProcurement =
    user?.role === ROLES.ADMIN || user?.role === ROLES.GA;
  const canEditQty = user?.role === ROLES.ADMIN || user?.role === ROLES.FINANCE;

  const isPending = procurement?.status === "pending";
  const isApproved = procurement?.status === "approved";
  const isRejected = procurement?.status === "rejected";

  const showActionButtons = canApprove && isPending;
  const showPartialButton = canApprove && isApproved;
  const canRevise = canEditProcurement && isRejected;

  useEffect(() => {
    if (procurementId) fetchProcurement();
    else setProcurement(null);
  }, [procurementId]);

  const fetchProcurement = async () => {
    if (!procurementId) return;
    setLoading(true);
    try {
      const data = await getMonthlyProcurementById(procurementId);
      setProcurement(data);
    } catch (error) {
      console.error("Failed to fetch monthly procurement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!procurement) return;
    setUpdating(true);
    try {
      await updateMonthlyProcurementStatus(procurement.id, "approved");
      await fetchProcurement();
      onStatusChange?.();
    } catch (error) {
      console.error("Failed to approve:", error);
      alert("Failed to approve monthly procurement. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!procurement) return;
    setUpdating(true);
    try {
      await updateMonthlyProcurementStatus(procurement.id, "rejected");
      await fetchProcurement();
      onStatusChange?.();
    } catch (error) {
      console.error("Failed to reject:", error);
      alert("Failed to reject monthly procurement. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handlePartial = async () => {
    if (!procurement) return;
    setUpdating(true);
    try {
      await updateMonthlyProcurementStatus(procurement.id, "partial");
      await fetchProcurement();
      onStatusChange?.();
    } catch (error) {
      console.error("Failed to mark partial:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleRevise = async () => {
    if (!procurement) return;
    setRevising(true);
    try {
      await reviseMonthlyProcurement(procurement.id);
      await fetchProcurement();
      onStatusChange?.();
    } catch (error) {
      console.error("Failed to revise:", error);
      alert("Failed to revise monthly procurement. Please try again.");
    } finally {
      setRevising(false);
    }
  };

  const formatDate = (
    dateString: string,
    format: "full" | "short" = "full",
  ) => {
    const options: Intl.DateTimeFormatOptions =
      format === "full"
        ? { weekday: "long", year: "numeric", month: "long", day: "numeric" }
        : { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  if (!procurementId) {
    return (
      <div className="flex-1 bg-white h-screen flex flex-col items-center justify-center text-gray-400">
        <Calendar className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium">No period selected</p>
        <p className="text-sm">
          Select a monthly procurement from the list to view details
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 bg-white h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!procurement) {
    return (
      <div className="flex-1 bg-white h-screen flex items-center justify-center text-red-500">
        Failed to load monthly procurement details
      </div>
    );
  }

  const getStatusBadge = () => {
    const statusConfig = {
      pending: {
        icon: Clock,
        label: "Pending",
        color: "bg-amber-100 text-amber-700 border-amber-200",
      },
      approved: {
        icon: CheckCircle,
        label: "Approved",
        color: "bg-green-100 text-green-700 border-green-200",
      },
      rejected: {
        icon: XCircle,
        label: "Rejected",
        color: "bg-red-100 text-red-700 border-red-200",
      },
      partial: {
        icon: CreditCard,
        label: "Partial",
        color: "bg-purple-100 text-purple-700 border-purple-200",
      },
    };
    const config = statusConfig[procurement.status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const periodLabel = procurement.period
    ? new Date(`${procurement.period}-01`).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      })
    : "Monthly Procurement";

  return (
    <div className="flex-1 bg-white h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b bg-linear-to-r from-blue-50 to-white">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{periodLabel}</h1>
            <div className="flex flex-wrap gap-4 mt-3">
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <User size={14} />
                Submitted by:{" "}
                <span className="font-medium">
                  {procurement.submitter_name || procurement.submitter_id}
                </span>
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <User size={14} />
                Branch:{" "}
                <span className="font-medium">
                  {procurement.branch_name || procurement.branch_id}
                </span>
              </p>
              {procurement.period && (
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar size={14} />
                  Target Period:{" "}
                  <span className="font-medium">
                    {formatDate(procurement.period)}
                  </span>
                </p>
              )}
              {procurement.created_at && (
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock size={14} />
                  Created: {formatDate(procurement.created_at, "short")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-gray-500">Status:</span>
              {getStatusBadge()}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Total Budget
            </p>
            <p className="text-2xl font-black text-blue-600">
              Rp {procurement.total_nominal?.toLocaleString("id-ID") || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="flex-1 overflow-y-auto p-6">
        <ProcurementTable
          items={procurement.procurement_items || []}
          onRefresh={fetchProcurement}
          canApprove={canApprove}
          canEdit={canEditQty && isPending}
          type="monthly"
          procurementStatus={procurement.status}
        />
      </div>

      {/* Sticky Action Bar */}
      {(showActionButtons || showPartialButton || canRevise) && (
        <div className="sticky bottom-0 z-10 px-6 py-4 border-t bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex items-center justify-between gap-3">
          {showActionButtons && (
            <>
              <p className="text-xs text-gray-400">
                Review all items before approving or rejecting this procurement
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleReject}
                  disabled={updating}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Procurement
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={updating}
                  variant="default"
                  className="px-6 py-2 text-sm font-medium"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {updating ? "Processing..." : "Approve Procurement"}
                </Button>
              </div>
            </>
          )}

          {/* Partial button was missing — monthly procurement has a "partial" status */}
          {showPartialButton && (
            <>
              <p className="text-xs text-gray-400">
                Some items may still be pending. You can mark this as partially
                fulfilled.
              </p>
              <Button
                onClick={handlePartial}
                disabled={updating}
                variant="outline"
                className="border-purple-200 text-purple-600 hover:bg-purple-50 px-6 py-2 text-sm font-medium disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {updating ? "Processing..." : "Mark as Partial"}
              </Button>
            </>
          )}

          {canRevise && (
            <>
              <p className="text-xs text-gray-400">
                This procurement was rejected. You can revise and resubmit it.
              </p>
              <Button
                onClick={handleRevise}
                disabled={revising}
                variant="default"
                className="px-6 py-2 text-sm font-medium"
              >
                <Pencil className="w-4 h-4 mr-2" />
                {revising ? "Submitting..." : "Revise & Resubmit"}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
