"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Branch, Request } from "@/types";
import { getStatusVariant, getPriorityVariant } from "@/data/helpers";
import { Button } from "@/components/ui/button";

import { useRequest } from "@/features/budget/hooks/useRequest";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Request | null;
  profile: { id: string; name: string } | null;
  branches: Branch[];
  refreshData: () => void;
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-gray-500 text-xs">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

const ApprovalDetailsDialog = ({
  open,
  onOpenChange,
  data,
  profile,
  branches,
  refreshData,
}: Props) => {
  const { updateRequestStatus } = useRequest();

  if (!data) return null;

  const isActionDisabled =
    data.status === "approved" ||
    data.status === "disburse" ||
    data.status === "rejected";

  const getRequesterName = (id: string) => {
    if (!profile) return id;

    return id === profile.id ? profile.name : "Unknown User";
  };

  const getBranchName = (id: string) => {
    const branch = branches.find((b) => b.id === id);
    return branch ? branch.name : id;
  };

  const handleApprove = async (id: string) => {
    await updateRequestStatus(id, "approved");
    refreshData();
    onOpenChange(false);
  };
  const handleReject = async (id: string) => {
    await updateRequestStatus(id, "rejected");
    refreshData();
    onOpenChange(false);
  };

  const handleDisburse = async (id: string) => {
    await updateRequestStatus(id, "disburse");
    refreshData();
    onOpenChange(false);
  };

  const requesterName = getRequesterName(data.requester_id);
  const branchName = getBranchName(data.branch_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-8 max-w-2xl flex flex-col gap-6">
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-1">
            <span className="text-lg font-semibold">
              Expense Request Details
            </span>
            <p className="text-sm text-gray-500 font-light">
              Review complete request information
            </p>
          </DialogTitle>
        </DialogHeader>

        {/* TOP SECTION */}
        <div className="flex flex-col justify-between gap-4">
          <div className="flex flex-col">
            <label>Request ID</label>
            <span className="text-blue-500 font-medium text-sm">
              #{data.id}
            </span>
          </div>

          <div className="flex gap-2">
            <Badge variant={getStatusVariant(data.status)}>{data.status}</Badge>
            <Badge variant={getPriorityVariant(data.priority)}>
              {data.priority}
            </Badge>
          </div>
        </div>

        {/* MAIN INFO */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Info label="Requester" value={requesterName} />
          <Info label="Branch" value={branchName} />
          <Info label="Date" value={new Date(data.date).toLocaleString()} />
          <Info label="Item Name" value={data.name} />
          <Info label="Quantity" value={String(data.amount)} />
        </div>

        {/* AMOUNT SECTION */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <p className="text-gray-500 text-sm">Total Amount</p>
          <p className="text-2xl font-bold">
            Rp {data.nominal.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="destructive"
            onClick={() => handleReject(data.id)}
            disabled={isActionDisabled}
          >
            Reject
          </Button>
          <Button
            className="bg-green-500 hover:bg-green-600"
            disabled={isActionDisabled}
            onClick={() => handleApprove(data.id)}
          >
            Approve
          </Button>
          <Button
            variant="outline"
            disabled={isActionDisabled}
            onClick={() => handleDisburse(data.id)}
          >
            Disburse
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDetailsDialog;
