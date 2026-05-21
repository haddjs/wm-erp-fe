"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Plus,
  Trash2,
  Loader2,
  XCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getAllUsers, createUser, deleteAccount } from "@/lib/user";
import type { User, UserRole, AdminCreateUserPayload } from "@/types/user";
import { UserRoleLabel } from "@/types/user";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 2, label: "General Affairs" },
  { value: 3, label: "Finance" },
];

function RoleBadge({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    1: "bg-violet-50 text-violet-700 border-violet-200/60",
    2: "bg-sky-50 text-sky-700 border-sky-200/60",
    3: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${styles[role]}`}
    >
      <ShieldCheck size={9} />
      {UserRoleLabel[role]}
    </span>
  );
}

function CreateUserModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (user: User) => void;
}) {
  const [form, setForm] = useState<AdminCreateUserPayload>({
    email: "",
    name: "",
    password: "",
    role: 2,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setForm({ email: "", name: "", password: "", role: 2 });
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await createUser(form);
      onCreated(res.data);
      handleClose();
    } catch (e: any) {
      setError(e.message ?? "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const field =
    "w-full border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-1">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/10 text-xs text-rose-700 dark:text-rose-400">
              <XCircle size={12} className="shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">
              Name
            </label>
            <input
              className={field}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Full name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">
              Email
            </label>
            <input
              type="email"
              className={field}
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">
              Password
            </label>
            <input
              type="password"
              className={field}
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              placeholder="Min. 6 characters"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-2">
              Role
            </label>
            <RadioGroup
              value={String(form.role)}
              onValueChange={(val) =>
                setForm((f) => ({ ...f, role: Number(val) as UserRole }))
              }
              className="flex gap-4"
            >
              {ROLE_OPTIONS.map((r) => (
                <div key={r.value} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={String(r.value)}
                    id={`role-${r.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`role-${r.value}`}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium
                      ${
                        form.role === r.value
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:border-blue-400 dark:text-blue-400"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600"
                      }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${
                        form.role === r.value
                          ? "border-blue-500 bg-blue-500"
                          : "border-slate-300 dark:border-zinc-600"
                      }`}
                    >
                      {form.role === r.value && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={loading || !form.name || !form.email || !form.password}
          >
            {loading && <Loader2 size={13} className="animate-spin mr-1.5" />}
            Create User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirmModal({
  user,
  onClose,
  onSuccess,
}: {
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-700 dark:text-zinc-200">
            {user?.name}
          </span>
          ? This action cannot be undone.
        </p>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/10 text-xs text-rose-700 dark:text-rose-400 mt-2">
            <XCircle size={12} className="shrink-0" />
            {error}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const limit = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllUsers(page, limit);
      setUsers(res.data ?? []);
      setTotalPages(res.paging?.total_pages ?? 1);
      setTotalData(res.paging?.total_data ?? 0);
    } catch (e: any) {
      setError(e.message ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserCreated = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
    setTotalData((prev) => prev + 1);
  };

  const filtered = search
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      )
    : users;

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b bg-linear-to-r from-slate-50 to-white dark:from-zinc-900/60 dark:to-zinc-950 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                <Users
                  size={18}
                  className="text-slate-600 dark:text-zinc-300"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-zinc-50 tracking-tight">
                  Users
                </h1>
                <p className="text-xs text-slate-400 dark:text-zinc-500">
                  {totalData} total user{totalData !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5"
            >
              <Plus size={14} />
              Add User
            </Button>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/10 text-sm text-rose-700 dark:text-rose-400">
              <XCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400 dark:text-zinc-500">
              <Users className="w-10 h-10 text-slate-200 dark:text-zinc-700" />
              <p className="text-sm">
                {search ? "No users match your search" : "No users found"}
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-zinc-900/50 border-b border-slate-200 dark:border-zinc-800">
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-10 text-center">
                      No
                    </th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-36">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                  {filtered.map((user, i) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/40 dark:hover:bg-zinc-900/20 transition-colors"
                    >
                      <td className="px-5 py-4 text-xs text-slate-400 text-center">
                        {(page - 1) * limit + i + 1}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                          {user.email}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <RoleBadge role={user.role} />
                        <span className="px-4 py-4 text-xs text-slate-500 dark:text-zinc-400">
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-zinc-900 bg-slate-50/40 dark:bg-zinc-900/20">
                  <p className="text-xs text-slate-400 dark:text-zinc-500">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateUserModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleUserCreated}
      />

      <DeleteConfirmModal
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={fetchUsers}
      />
    </>
  );
}
