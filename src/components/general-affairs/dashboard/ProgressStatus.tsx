import { Progress } from "@/components/ui/progress";

export const ProgressWithStatus = ({ percentage }: { percentage: number }) => {
  let statusColor = "";
  let statusText = "";
  let barColor = "";

  if (percentage === 100) {
    statusColor = "text-red-600";
    statusText = "Habis";
    barColor = "bg-red-500";
  } else if (percentage >= 90) {
    statusColor = "text-red-500";
    statusText = "Kritis";
    barColor = "bg-red-400";
  } else if (percentage >= 70) {
    statusColor = "text-orange-500";
    statusText = "Mendekati habis";
    barColor = "bg-orange-500";
  } else if (percentage >= 30) {
    statusColor = "text-yellow-600";
    statusText = "Normal";
    barColor = "bg-yellow-500";
  } else {
    statusColor = "text-green-600";
    statusText = "Aman";
    barColor = "bg-green-500";
  }

  return (
    <div className="space-y-1">
      <Progress value={percentage} />
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-gray-700">{percentage}%</span>
        <span className={`text-xs font-medium ${statusColor}`}>
          {statusText}
        </span>
      </div>
    </div>
  );
};
