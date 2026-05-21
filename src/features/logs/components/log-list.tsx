"use client";

import { Activity, User, MapPin } from "lucide-react";
import { getLogConfig, formatTimestamp } from "../utils/useActivityLog";
import { Badge } from "@/components/ui/badge";
import { ActivityLogResponse } from "@/types/activity-log";

const REQUEST_ACTIONS = [
  "request_approved",
  "request_rejected",
  "request_cancelled",
  "request_created",
  "request_status_changed",
];

type Props = {
  logs: ActivityLogResponse[];
};

const LogList = ({ logs }: Props) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 my-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Activity Timeline
      </h2>

      <div className="space-y-4">
        {logs.map((log) => {
          const config = getLogConfig(log.type);
          if (!config) return null;
          const Icon = config.icon;

          return (
            <div
              key={log.id}
              className="flex gap-4 pb-4 border-b border-gray-100 last:border-0"
            >
              <div className="shrink-0">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.className}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={config.className}>{config.label}</Badge>

                      {log.nominal !== 0 &&
                        !REQUEST_ACTIONS.includes(log.type) && (
                          <span
                            className={`text-sm font-semibold ${log.nominal < 0 ? "text-red-600" : "text-green-600"}`}
                          >
                            {log.nominal < 0 ? "-" : "+"}Rp{" "}
                            {Math.abs(log.nominal).toLocaleString("id-ID")}
                          </span>
                        )}

                      {log.amount > 0 &&
                        !REQUEST_ACTIONS.includes(log.type) && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({log.amount} item{log.amount > 1 ? "s" : ""})
                          </span>
                        )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {log.description}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatTimestamp(log.created_at)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{log.email}</span>
                  </div>
                  {log.branch_name && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{log.branch_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {logs.length === 0 && (
        <div className="p-12 text-center">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            No activity logs found matching your criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default LogList;
