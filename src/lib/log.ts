import { apiFetch } from "@/lib/api";
import { ActivityLogListResponse } from "@/types/activity-log";

export async function getActivityLogs(
  page = 1,
  limit = 10,
): Promise<ActivityLogListResponse> {
  return apiFetch(`/activity-logs?page=${page}&limit=${limit}`);
}
