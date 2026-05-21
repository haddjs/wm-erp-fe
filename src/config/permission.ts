import type { UserRole } from "@/types/user";

// ─────────────────────────────────────────────
// Permission Keys
// ─────────────────────────────────────────────
export const PERMISSIONS = {
  // Auth
  AUTH_GET_SESSION: "auth:get_session",
  AUTH_LOGOUT: "auth:logout",

  // Users
  USER_GET_PROFILE: "user:get_profile",
  USER_UPDATE_NAME: "user:update_name",
  USER_UPDATE_PASSWORD: "user:update_password",
  USER_DELETE_OWN: "user:delete_own",
  USER_CREATE: "user:create",
  USER_GET_ALL: "user:get_all",

  // Branches
  BRANCH_GET_ALL: "branch:get_all",
  BRANCH_GET_BY_ID: "branch:get_by_id",
  BRANCH_CREATE: "branch:create",
  BRANCH_UPDATE: "branch:update",
  BRANCH_DELETE: "branch:delete",

  // Categories
  CATEGORY_GET_ALL: "category:get_all",
  CATEGORY_GET_BY_ID: "category:get_by_id",
  CATEGORY_CREATE: "category:create",
  CATEGORY_UPDATE: "category:update",
  CATEGORY_DELETE: "category:delete",

  // Items
  ITEM_GET_ALL: "item:get_all",
  ITEM_GET_BY_ID: "item:get_by_id",
  ITEM_CREATE: "item:create",
  ITEM_UPDATE: "item:update",
  ITEM_DELETE: "item:delete",

  // Expenses
  EXPENSE_GET_ALL: "expense:get_all",
  EXPENSE_GET_BY_ID: "expense:get_by_id",
  EXPENSE_CREATE: "expense:create",
  EXPENSE_UPDATE: "expense:update",
  EXPENSE_ATTACH_INVOICE: "expense:attach_invoice",
  EXPENSE_DELETE: "expense:delete",
  EXPENSE_MIGRATE_TO_PURCHASE: "expense:migrate_to_purchase",

  // Monthly Procurements
  MONTHLY_PROC_GET_ALL: "monthly_proc:get_all",
  MONTHLY_PROC_GET_BY_ID: "monthly_proc:get_by_id",
  MONTHLY_PROC_CREATE: "monthly_proc:create",
  MONTHLY_PROC_UPDATE: "monthly_proc:update",
  MONTHLY_PROC_REVISE: "monthly_proc:revise",
  MONTHLY_PROC_DELETE: "monthly_proc:delete",
  MONTHLY_PROC_UPDATE_STATUS: "monthly_proc:update_status",

  // Event Procurements
  EVENT_PROC_GET_ALL: "event_proc:get_all",
  EVENT_PROC_GET_BY_ID: "event_proc:get_by_id",
  EVENT_PROC_CREATE: "event_proc:create",
  EVENT_PROC_UPDATE: "event_proc:update",
  EVENT_PROC_REVISE: "event_proc:revise",
  EVENT_PROC_DELETE: "event_proc:delete",
  EVENT_PROC_UPDATE_STATUS: "event_proc:update_status",

  // Procurement Items
  PROC_ITEM_GET_BY_ID: "proc_item:get_by_id",
  PROC_ITEM_UPDATE: "proc_item:update",
  PROC_ITEM_DELETE: "proc_item:delete",
  PROC_ITEM_UPDATE_QUANTITY: "proc_item:update_quantity",
  PROC_ITEM_UPDATE_STATUS: "proc_item:update_status",

  // Purchase Records
  PURCHASE_GET_BY_ID: "purchase:get_by_id",
  PURCHASE_GET_BY_PROC_ITEM: "purchase:get_by_proc_item",
  PURCHASE_CREATE: "purchase:create",
  PURCHASE_UPDATE: "purchase:update",
  PURCHASE_ATTACH_INVOICE: "purchase:attach_invoice",
  PURCHASE_DELETE: "purchase:delete",
  PURCHASE_MIGRATE_TO_EXPENSE: "purchase:migrate_to_expense",
  PURCHASE_UPDATE_STATUS: "purchase:update_status",

  // Activity Logs
  LOG_GET_TIMELINE: "log:get_timeline",

  // Dashboard
  DASHBOARD_MONTHLY: "dashboard:monthly",
  DASHBOARD_EVENT: "dashboard:event",

  // Files
  FILE_UPLOAD: "file:upload",
  FILE_PROXY: "file:proxy",

  // Shopee
  SHOPEE_FETCH_EMAILS: "shopee:fetch_emails",
  SHOPEE_DEBUG_EMAILS: "shopee:debug_emails",
  SHOPEE_PREVIEW: "shopee:preview",
  SHOPEE_IMPORT: "shopee:import",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ─────────────────────────────────────────────
// Role → Permissions Map
// UserRole: 1 = Admin, 2 = GA, 3 = Finance
// ─────────────────────────────────────────────
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // ── Admin: everything ──
  1: Object.values(PERMISSIONS) as Permission[],

  // ── GA: operational data, no approvals / no master data ──
  2: [
    PERMISSIONS.AUTH_GET_SESSION,
    PERMISSIONS.AUTH_LOGOUT,

    PERMISSIONS.USER_GET_PROFILE,
    PERMISSIONS.USER_UPDATE_NAME,
    PERMISSIONS.USER_UPDATE_PASSWORD,
    PERMISSIONS.USER_DELETE_OWN,

    PERMISSIONS.BRANCH_GET_ALL,
    PERMISSIONS.BRANCH_GET_BY_ID,

    PERMISSIONS.CATEGORY_GET_ALL,
    PERMISSIONS.CATEGORY_GET_BY_ID,

    PERMISSIONS.ITEM_GET_ALL,
    PERMISSIONS.ITEM_GET_BY_ID,

    PERMISSIONS.EXPENSE_GET_ALL,
    PERMISSIONS.EXPENSE_GET_BY_ID,
    PERMISSIONS.EXPENSE_CREATE,
    PERMISSIONS.EXPENSE_UPDATE,
    PERMISSIONS.EXPENSE_ATTACH_INVOICE,
    PERMISSIONS.EXPENSE_DELETE,
    PERMISSIONS.EXPENSE_MIGRATE_TO_PURCHASE,

    PERMISSIONS.MONTHLY_PROC_GET_ALL,
    PERMISSIONS.MONTHLY_PROC_GET_BY_ID,
    PERMISSIONS.MONTHLY_PROC_CREATE,
    PERMISSIONS.MONTHLY_PROC_UPDATE,
    PERMISSIONS.MONTHLY_PROC_REVISE,
    PERMISSIONS.MONTHLY_PROC_DELETE,

    PERMISSIONS.EVENT_PROC_GET_ALL,
    PERMISSIONS.EVENT_PROC_GET_BY_ID,
    PERMISSIONS.EVENT_PROC_CREATE,
    PERMISSIONS.EVENT_PROC_UPDATE,
    PERMISSIONS.EVENT_PROC_REVISE,
    PERMISSIONS.EVENT_PROC_DELETE,

    PERMISSIONS.PROC_ITEM_GET_BY_ID,
    PERMISSIONS.PROC_ITEM_UPDATE,
    PERMISSIONS.PROC_ITEM_DELETE,

    PERMISSIONS.PURCHASE_GET_BY_ID,
    PERMISSIONS.PURCHASE_GET_BY_PROC_ITEM,
    PERMISSIONS.PURCHASE_CREATE,
    PERMISSIONS.PURCHASE_UPDATE,
    PERMISSIONS.PURCHASE_ATTACH_INVOICE,
    PERMISSIONS.PURCHASE_DELETE,
    PERMISSIONS.PURCHASE_MIGRATE_TO_EXPENSE,

    PERMISSIONS.LOG_GET_TIMELINE,
    PERMISSIONS.DASHBOARD_MONTHLY,
    PERMISSIONS.DASHBOARD_EVENT,

    PERMISSIONS.FILE_UPLOAD,
    PERMISSIONS.FILE_PROXY,

    PERMISSIONS.SHOPEE_FETCH_EMAILS,
    PERMISSIONS.SHOPEE_DEBUG_EMAILS,
    PERMISSIONS.SHOPEE_PREVIEW,
    PERMISSIONS.SHOPEE_IMPORT,
  ],

  // ── Finance: read everything + status/quantity approvals only ──
  3: [
    PERMISSIONS.AUTH_GET_SESSION,
    PERMISSIONS.AUTH_LOGOUT,

    PERMISSIONS.USER_GET_PROFILE,
    PERMISSIONS.USER_UPDATE_NAME,
    PERMISSIONS.USER_UPDATE_PASSWORD,
    PERMISSIONS.USER_DELETE_OWN,

    PERMISSIONS.BRANCH_GET_ALL,
    PERMISSIONS.BRANCH_GET_BY_ID,

    PERMISSIONS.CATEGORY_GET_ALL,
    PERMISSIONS.CATEGORY_GET_BY_ID,

    PERMISSIONS.ITEM_GET_ALL,
    PERMISSIONS.ITEM_GET_BY_ID,

    PERMISSIONS.EXPENSE_GET_ALL,
    PERMISSIONS.EXPENSE_GET_BY_ID,

    PERMISSIONS.MONTHLY_PROC_GET_ALL,
    PERMISSIONS.MONTHLY_PROC_GET_BY_ID,
    PERMISSIONS.MONTHLY_PROC_UPDATE_STATUS,

    PERMISSIONS.EVENT_PROC_GET_ALL,
    PERMISSIONS.EVENT_PROC_GET_BY_ID,
    PERMISSIONS.EVENT_PROC_UPDATE_STATUS,

    PERMISSIONS.PROC_ITEM_GET_BY_ID,
    PERMISSIONS.PROC_ITEM_UPDATE_QUANTITY,
    PERMISSIONS.PROC_ITEM_UPDATE_STATUS,

    PERMISSIONS.PURCHASE_GET_BY_ID,
    PERMISSIONS.PURCHASE_GET_BY_PROC_ITEM,
    PERMISSIONS.PURCHASE_UPDATE_STATUS,

    PERMISSIONS.LOG_GET_TIMELINE,
    PERMISSIONS.DASHBOARD_MONTHLY,
    PERMISSIONS.DASHBOARD_EVENT,

    PERMISSIONS.FILE_UPLOAD,
    PERMISSIONS.FILE_PROXY,
  ],
};
