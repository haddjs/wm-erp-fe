import { LogEntry } from "@/data/mock-data";
import { ActionType } from "@/data/constants";

export const mapLog = (log: any): LogEntry => {
  return {
    id: log.id,
    action: actionMap[log.type] || "user_action",
    title: log.title,
    description: log.description,
    timestamp: log.created_at,
    user: log.email || log.user,
    branch: log.branch_name || log.branch,
    nominal: log.nominal || log.amount || 0,
    amount: log.amount || 0,
  };
};

const actionMap: Record<string, ActionType> = {
  // Requests
  request_created: "request_created",
  request_approved: "request_approved",
  request_rejected: "request_rejected",
  request_cancelled: "request_cancelled",
  request_status_changed: "request_status_changed",

  // Expenses
  expense_recorded: "expense_recorded",
  expense_updated: "expense_updated",
  expense_deleted: "expense_deleted",
};
