// components/admin/StatsCard.tsx
interface StatsCardProps {
  title: string;
  value: number;
  color: "blue" | "yellow" | "green" | "red";
}

const colorStyles = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
  },
  yellow: {
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    border: "border-yellow-200",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
  },
};

export const StatsCard = ({ title, value, color }: StatsCardProps) => {
  return (
    <div
      className={`rounded-lg border ${colorStyles[color].border} bg-white p-4`}
    >
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className={`text-2xl font-bold mt-2 ${colorStyles[color].text}`}>
        {value}
      </p>
    </div>
  );
};
