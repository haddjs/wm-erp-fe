import { apiFetch } from "@/lib/api";
import type {
  MPDashboardResponse,
  EPDashboardResponse,
} from "@/types/dashboard";

export async function getMPDashboard(params?: {
  branch_id?: string;
  monthly_procurement_id?: string;
}): Promise<MPDashboardResponse> {
  const searchParams = new URLSearchParams();
  if (params?.branch_id) searchParams.append("branch_id", params.branch_id);
  if (params?.monthly_procurement_id)
    searchParams.append(
      "monthly_procurement_id",
      params.monthly_procurement_id,
    );
  const query = searchParams.toString();
  const res = await apiFetch(`/dashboard/mp${query ? `?${query}` : ""}`);
  return res.data ?? res;
}

export async function getEPDashboard(params?: {
  branch_id?: string;
  event_procurement_id?: string;
}): Promise<EPDashboardResponse> {
  const searchParams = new URLSearchParams();
  if (params?.branch_id) searchParams.append("branch_id", params.branch_id);
  if (params?.event_procurement_id)
    searchParams.append("event_procurement_id", params.event_procurement_id);
  const query = searchParams.toString();
  const res = await apiFetch(`/dashboard/ep${query ? `?${query}` : ""}`);
  return res.data ?? res;
}
