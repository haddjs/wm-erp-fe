"use client";

import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { LOG_ACTION, ActionType } from "@/data/constants";

export type DateFilter = "all" | "today" | "yesterday" | "week";
export type ActionFilter = "all" | ActionType;

type Props = {
  search: string;
  setSearch: (val: string) => void;
  date: DateFilter;
  setDate: (val: DateFilter) => void;
  action: ActionFilter;
  setAction: (val: ActionFilter) => void;
};

const DATE_OPTIONS = ["all", "today", "yesterday", "week"] as const;

const LogHeader = ({
  search,
  setSearch,
  date,
  setDate,
  action,
  setAction,
}: Props) => {
  return (
    <div className="bg-white border-b border-gray-200 py-6 px-8">
      <div className="flex flex-col justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Activity Log</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Track all system activities and transactions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search..."
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            className="w-sm"
          />

          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center gap-3 border-gray-400 border-2 px-4 py-1 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                <span className="capitalize">
                  {date === "all"
                    ? "All Time"
                    : date === "week"
                      ? "Last 7 Days"
                      : date}
                </span>
                <ChevronDown className="w-5 h-5" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {DATE_OPTIONS.map((d) => (
                <DropdownMenuItem
                  key={d}
                  onClick={() => setDate(d)}
                  className="p-2 cursor-pointer capitalize"
                >
                  {d === "all" ? "All Time" : d === "week" ? "Last 7 Days" : d}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center gap-3 border-gray-400 border-2 px-4 py-1 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                <span>
                  {action === "all"
                    ? "All Actions"
                    : LOG_ACTION[action as ActionType]?.label || action}
                </span>
                <ChevronDown className="w-5 h-5" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem
                onClick={() => setAction("all")}
                className="p-2 cursor-pointer"
              >
                All Actions
              </DropdownMenuItem>
              {(
                Object.entries(LOG_ACTION) as [
                  ActionType,
                  (typeof LOG_ACTION)[ActionType],
                ][]
              ).map(([key, value]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setAction(key)}
                  className="p-2 cursor-pointer"
                >
                  {value.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default LogHeader;
