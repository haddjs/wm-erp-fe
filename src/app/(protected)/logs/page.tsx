"use client";

import { useState } from "react";
import LogHeader, {
  DateFilter,
  ActionFilter,
} from "@/features/logs/components/log-header";
import LogList from "@/features/logs/components/log-list";
import { useActivityLogs } from "@/features/logs/utils/useActivityLog";
import { ActivityLogResponse } from "@/types/activity-log";

const REQUEST_ACTIONS = [
  "request_approved",
  "request_rejected",
  "request_cancelled",
  "request_created",
  "request_status_changed",
];

function filterLogs(
  logs: ActivityLogResponse[],
  search: string,
  date: DateFilter,
  action: ActionFilter,
): ActivityLogResponse[] {
  const now = new Date();

  return logs.filter((log) => {
    if (search) {
      const q = search.toLowerCase();
      const matches =
        log.description.toLowerCase().includes(q) ||
        log.email.toLowerCase().includes(q) ||
        log.branch_name.toLowerCase().includes(q);
      if (!matches) return false;
    }

    if (action !== "all" && log.type !== action) return false;

    if (date !== "all") {
      const logDate = new Date(log.created_at);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      if (date === "today" && logDate < today) return false;
      if (date === "yesterday" && (logDate < yesterday || logDate >= today))
        return false;
      if (date === "week" && logDate < weekAgo) return false;
    }

    return true;
  });
}

export default function LogPage() {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState<DateFilter>("all");
  const [action, setAction] = useState<ActionFilter>("all");

  const { logs, loading, error } = useActivityLogs(1, 100);

  const filtered = filterLogs(logs, search, date, action);

  if (error) return <p className="text-red-500 p-8">{error}</p>;

  return (
    <div>
      <LogHeader
        search={search}
        setSearch={setSearch}
        date={date}
        setDate={setDate}
        action={action}
        setAction={setAction}
      />
      {loading ? (
        <div className="p-12 text-center text-gray-400">Loading...</div>
      ) : (
        <LogList logs={filtered} />
      )}
    </div>
  );
}
