"use client";

import { useState } from "react";

import { Branch, Request } from "@/types";

import { getStatusVariant, getPriorityVariant } from "@/data/helpers";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import ApprovalDetailsDialog from "./approval-details-dialog";

const columns: { key: keyof Request; label: string }[] = [
  { key: "requester_id", label: "REQUESTER" },
  { key: "date", label: "DATE" },
  { key: "name", label: "ITEM" },
  { key: "branch_id", label: "BRANCH" },
  { key: "nominal", label: "NOMINAL" },
  { key: "priority", label: "PRIORITY" },
  { key: "status", label: "STATUS" },
];

type ApprovalTableProps = {
  data: Request[];
  profile: { id: string; name: string } | null;
  branches: Branch[];
  refreshData: () => void;
};

const ApprovalTable = ({
  data,
  profile,
  branches,
  refreshData,
}: ApprovalTableProps) => {
  const [selected, setSelected] = useState<Request | null>(null);
  const [open, setOpen] = useState(false);

  const getRequesterName = (id: string) => {
    if (!profile) return id;

    return id === profile.id ? profile.name : "Unknown User";
  };

  const getBranchName = (id: string) => {
    const branch = branches.find((b) => b.id === id);
    return branch ? branch.name : id;
  };

  return (
    <div className="rounded-2xl border bg-white my-8">
      <table className="w-full">
        <thead className="border-b border-gray-200">
          <tr className="text-center bg-gray-50 text-sm text-gray-500">
            {columns.map((col) => (
              <th key={col.key}>
                <div className="font-semibold flex justify-center items-center gap-2 text-xs">
                  <span>{col.label}</span>
                </div>
              </th>
            ))}

            <th className="py-2">
              <span>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((approval, index) => {
            const isPending = approval.status === "pending";
            return (
              <tr key={index} className=" border-b-2 border-gray-100">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="py-3 text-center text-sm text-gray-700 p-4"
                  >
                    {(() => {
                      switch (col.key) {
                        case "nominal":
                          return (
                            <span className="font-bold">
                              Rp {approval.nominal.toLocaleString("id-ID")}
                            </span>
                          );

                        case "status":
                          return (
                            <Badge variant={getStatusVariant(approval.status)}>
                              {approval.status}
                            </Badge>
                          );

                        case "priority":
                          return (
                            <Badge
                              variant={getPriorityVariant(approval.priority)}
                            >
                              {approval.priority}
                            </Badge>
                          );

                        case "date":
                          return new Date(approval.date).toLocaleDateString();

                        case "requester_id":
                          return getRequesterName(approval.requester_id);

                        case "branch_id":
                          return getBranchName(approval.branch_id);

                        default:
                          return approval[col.key];
                      }
                    })()}
                  </td>
                ))}
                <td className="py-3 text-sm text-gray-700">
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelected(approval);
                        setOpen(true);
                      }}
                      className="flex items-center"
                    >
                      <Eye />
                      Details
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ApprovalDetailsDialog
        open={open}
        onOpenChange={setOpen}
        data={selected}
        profile={profile}
        branches={branches}
        refreshData={refreshData}
      />
    </div>
  );
};

export default ApprovalTable;
