"use client";

import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

import { ChevronDown } from "lucide-react";

import { APPROVAL_PRIORITY } from "@/data/constants";
import { STATUS_PRIORITY } from "@/data/constants";

type Props = {
  search: string;
  setSearch: (val: string) => void;
  priority: string;
  setPriority: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
};

const ApprovalHeader = ({
  search,
  setSearch,
  priority,
  setPriority,
  status,
  setStatus,
}: Props) => {
  return (
    <div className="bg-white border-b border-gray-200 py-6 px-8">
      <div className="flex flex-col justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Approval Requests
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Review and approve expense requests
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Input
            placeholder="Search..."
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            className="w-sm"
          />

          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center gap-3 border-gray-400 border-2 px-4 py-1 rounded-lg text-sm cursor-pointer">
                <span>{status}</span>
                <ChevronDown className="w-5 h-5" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem
                onClick={() => setStatus("All Status")}
                className="p-2"
              >
                All Status
              </DropdownMenuItem>
              {STATUS_PRIORITY.map((stat, i) => (
                <DropdownMenuItem
                  key={i}
                  onClick={() => setStatus(stat)}
                  className="p-2 cursor-pointer"
                >
                  {stat}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center gap-3 border-gray-400 border-2 px-4 py-1 rounded-lg text-sm cursor-pointer">
                <span>{priority}</span>
                <ChevronDown className="w-5 h-5" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem
                onClick={() => setPriority("All Priority")}
                className="p-2"
              >
                All Priority
              </DropdownMenuItem>
              {APPROVAL_PRIORITY.map((prior, i) => (
                <DropdownMenuItem
                  key={i}
                  onClick={() => setPriority(prior)}
                  className="p-2 cursor-pointer"
                >
                  {prior}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default ApprovalHeader;
