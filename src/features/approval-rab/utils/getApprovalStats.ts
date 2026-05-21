import { Request } from "@/types";

import { Clock, CheckCircle, XCircle, DollarSign } from "lucide-react";

export const getApprovalStats = (data: Request[]) => {
  const safeData = data ?? [];
  const pending = safeData.filter((r) => r.status === "pending").length;
  const approved = safeData.filter((r) => r.status === "approved").length;
  const rejected = safeData.filter((r) => r.status === "rejected").length;

  const totalNominal = safeData.reduce((acc, curr) => acc + curr.nominal, 0);

  return [
    {
      label: "Pending",
      icon: Clock,
      color: "text-yellow-400",
      total: String(pending),
    },
    {
      label: "Approved",
      icon: CheckCircle,
      color: "text-green-600",
      total: String(approved),
    },
    {
      label: "Rejected",
      icon: XCircle,
      color: "text-red-600",
      total: String(rejected),
    },
    {
      label: "Total Amount",
      icon: DollarSign,
      color: "text-blue-600",
      total: `Rp ${totalNominal.toLocaleString("id-ID")}`,
    },
  ];
};
