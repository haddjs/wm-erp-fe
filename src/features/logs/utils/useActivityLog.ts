"use client";

import { useEffect, useState } from "react";
import { getActivityLogs } from "@/lib/log";
import { ActivityLogResponse, ActivityLogPaging } from "@/types/activity-log";
import { LogConfig, LOG_CONFIG } from "@/data/constants";

export function useActivityLogs(page = 1, limit = 10) {
  const [logs, setLogs] = useState<ActivityLogResponse[]>([]);
  const [paging, setPaging] = useState<ActivityLogPaging | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getActivityLogs(page, limit)
      .then((res) => {
        setLogs(res.data);
        setPaging(res.paging);
      })
      .catch((err) => setError(err?.message || "Failed to load logs"))
      .finally(() => setLoading(false));
  }, [page, limit]);

  return { logs, paging, loading, error };
}

export function getLogConfig(type: string): LogConfig | null {
  return LOG_CONFIG[type] ?? null;
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
