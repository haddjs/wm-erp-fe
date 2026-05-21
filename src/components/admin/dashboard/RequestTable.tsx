// components/admin/RequestsTable.tsx
"use client";

import { Eye, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type RequestStatus = "pending" | "approved" | "rejected";
type ActionType = "view" | "fill_realization";

interface Request {
  id: string;
  date: string;
  programName: string;
  amount: number;
  status: RequestStatus;
  invoice: { current: number; total: number } | null;
  action: ActionType;
}

interface RequestsTableProps {
  requests: Request[];
  onAction: (requestId: string, actionType: string) => void;
  loading?: boolean;
}

const statusColors = {
  pending: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    label: "Pending",
  },
  approved: {
    bg: "bg-green-50",
    text: "text-green-700",
    label: "Disetujui",
  },
  rejected: {
    bg: "bg-red-50",
    text: "text-red-700",
    label: "Ditolak",
  },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
  });
};

export const RequestsTable = ({
  requests,
  onAction,
  loading,
}: RequestsTableProps) => {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
        <p className="mt-2 text-sm text-gray-500">Memuat data...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-gray-500">Belum ada pengajuan</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left p-4 font-medium text-gray-600">Tanggal</th>
            <th className="text-left p-4 font-medium text-gray-600">
              Nama Program
            </th>
            <th className="text-left p-4 font-medium text-gray-600">Total</th>
            <th className="text-left p-4 font-medium text-gray-600">Status</th>
            <th className="text-left p-4 font-medium text-gray-600">Invoice</th>
            <th className="text-left p-4 font-medium text-gray-600">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr
              key={request.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="p-4 text-gray-900">{formatDate(request.date)}</td>
              <td className="p-4 text-gray-900">{request.programName}</td>
              <td className="p-4 text-gray-900">
                {formatCurrency(request.amount)}
              </td>
              <td className="p-4">
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[request.status].bg} ${statusColors[request.status].text}`}
                >
                  {statusColors[request.status].label}
                </span>
              </td>
              <td className="p-4 text-gray-600">
                {request.invoice
                  ? `${request.invoice.current}/${request.invoice.total} item`
                  : "—"}
              </td>
              <td className="p-4">
                {request.action === "fill_realization" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAction(request.id, "fill_realization")}
                    className="gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Isi Realisasi
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAction(request.id, "view")}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Lihat
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
