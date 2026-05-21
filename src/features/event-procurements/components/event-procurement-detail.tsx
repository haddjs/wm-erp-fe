"use client";

import { useState, useEffect } from "react";
import {
  getEventProcurementById,
  reviseEventProcurement,
  updateEventProcurementStatus,
} from "@/lib/event-procurement";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/context/AuthContext";
import type { EventProcurement } from "@/types/event-procurement";
import ProcurementTable from "./event-procurement-table";
import {
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
} from "lucide-react";

export default function EventProcurementDetail({
  procurementId,
}: {
  procurementId: string | null;
}) {
  const { user } = useAuth();
  const [procurement, setProcurement] = useState<EventProcurement | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [revising, setRevising] = useState(false);

  const canApprove = user?.role === ROLES.ADMIN || user?.role === ROLES.FINANCE;
  const canEdit = user?.role === ROLES.ADMIN || user?.role === ROLES.GA;

  const isPending = procurement?.status === "pending";
  const isApproved = procurement?.status === "approved";
  const isRejected = procurement?.status === "rejected";

  const showActionButtons = canApprove && isPending;
  const showDisburseButton = canApprove && isApproved;
  const canRevise = canEdit && isRejected;

  useEffect(() => {
    if (procurementId) fetchProcurement();
    else setProcurement(null);
  }, [procurementId]);

  const fetchProcurement = async () => {
    if (!procurementId) return;
    setLoading(true);
    try {
      const data = await getEventProcurementById(procurementId);
      setProcurement(data.data);
    } catch (error) {
      console.error("Failed to fetch event procurement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!procurement) return;
    setUpdating(true);
    try {
      await updateEventProcurementStatus(procurement.id, "approved");
      await fetchProcurement();
    } catch (error) {
      console.error("Failed to approve:", error);
      alert("Failed to approve event procurement. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDisburse = async () => {
    if (!procurement) return;
    setUpdating(true);
    try {
      await updateEventProcurementStatus(procurement.id, "disburse");
      await fetchProcurement();
    } catch (error) {
      console.error("Failed to disburse:", error);
      alert("Failed to process disbursement. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!procurement) return;
    setUpdating(true);
    try {
      await updateEventProcurementStatus(procurement.id, "rejected");
      await fetchProcurement();
    } catch (error) {
      console.error("Failed to reject:", error);
      alert("Failed to reject event procurement. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleRevise = async () => {
    if (!procurement) return;
    setRevising(true);
    try {
      await reviseEventProcurement(procurement.id);
      await fetchProcurement();
    } catch (error) {
      console.error("Failed to revise:", error);
      alert("Failed to revise event procurement. Please try again.");
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
        <p className="text-lg font-medium">No event selected</p>
        <p className="text-sm">Select an event from the list to view details</p>
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
        Failed to load event procurement details
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
      disburse: {
        icon: CreditCard,
        label: "Disbursed",
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

  return (
    <div className="flex-1 bg-white h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b bg-linear-to-r from-blue-50 to-white">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {procurement.name}
            </h1>
            <div className="flex flex-col gap-4 mt-3">
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <User size={14} />
                Submitted by:{" "}
                <span className="font-medium">
                  {procurement.submitter_name || procurement.submitter_id} —{" "}
                  {procurement.branch_name || procurement.branch_id}
                </span>
              </p>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar size={14} />
                  Event Date:{" "}
                  <span className="font-medium">
                    {formatDate(procurement.date)}
                  </span>
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock size={14} />
                  Created: {formatDate(procurement.created_at, "short")}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Status:</span>
                {getStatusBadge()}
              </div>
              <span className="text-xs text-gray-500">
                Approved by: {procurement.approver_name}
              </span>
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

      <div className="flex-1 overflow-y-auto p-6">
        <ProcurementTable
          items={procurement.procurement_items || []}
          onRefresh={fetchProcurement}
          canApprove={canApprove}
          canEdit={canEdit}
          type="event"
          procurementStatus={procurement.status}
        />
      </div>

      {/* Action Buttons */}
      {(showActionButtons || showDisburseButton || canRevise) && (
        <div className="p-4 border-t bg-white flex items-center justify-between gap-3">
          {showActionButtons && (
            <div className="flex justify-end gap-3 w-full">
              <button
                onClick={handleReject}
                disabled={updating}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Reject Event
              </button>
              <button
                onClick={handleApprove}
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
              >
                {updating ? "Processing..." : "Approve Event"}
              </button>
            </div>
          )}

          {/* ✅ Disburse button was missing — now rendered */}
          {showDisburseButton && (
            <div className="flex justify-end gap-3 w-full">
              <button
                onClick={handleDisburse}
                disabled={updating}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-lg shadow-purple-200 transition-all disabled:opacity-50"
              >
                {updating ? "Processing..." : "Disburse Funds"}
              </button>
            </div>
          )}

          {canRevise && (
            <div className="flex items-center justify-between w-full">
              <p className="text-xs text-gray-400">
                This event was rejected. You can revise and resubmit it.
              </p>
              <button
                onClick={handleRevise}
                disabled={revising}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
              >
                {revising ? "Submitting..." : "Revise & Resubmit"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
