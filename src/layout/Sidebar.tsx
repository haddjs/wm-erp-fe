"use client";

import { LogOut, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { SIDEBAR_ITEMS } from "@/config/user";
import { useAuth } from "@/context/AuthContext";
import { UserRoleLabel } from "@/types/user";

const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const sidebarItems = user
    ? (SIDEBAR_ITEMS.filter ?? [])((item) => item.roles.includes(user.role))
    : [];

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-slate-50/50 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-18" : "w-64",
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 z-50 h-6 w-6 rounded-full border bg-white shadow-sm hover:bg-gray-100"
      >
        <ChevronLeft
          className={cn(
            "h-4 w-4 transition-transform",
            isCollapsed && "rotate-180",
          )}
        />
      </Button>

      <div className="flex h-screen flex-col">
        {/* Header */}
        <div className="flex h-20 items-center px-4 py-6">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="shrink-0 rounded-xl bg-blue-600 p-2">
              <Image
                src="/wm-blue.svg"
                alt="Logo"
                width={24}
                height={24}
                className="brightness-0 invert"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap">
                <span className="text-sm font-bold tracking-tight text-slate-900">
                  FinanceHub
                </span>
                <span className="text-[10px] font-medium uppercase text-slate-500">
                  Budget Tracker
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link key={item.path} href={item.path} className="block">
                <div
                  className={cn(
                    "group flex items-center rounded-lg px-3 py-2.5 transition-all duration-200",
                    isActive
                      ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive
                        ? "text-blue-600"
                        : "text-slate-500 group-hover:text-slate-900",
                    )}
                  />
                  {!isCollapsed && (
                    <span className="ml-3 text-sm font-medium transition-opacity duration-300">
                      {item.label}
                    </span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors",
              isCollapsed ? "justify-center px-0" : "justify-start gap-3 px-3",
            )}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </Button>

          {!isCollapsed && user && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border bg-white p-2 shadow-sm">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                {user.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-xs font-semibold text-slate-900">
                  {user.name}
                </span>
                <span className="truncate text-[10px] text-slate-500">
                  {UserRoleLabel[user.role]}{" "}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
