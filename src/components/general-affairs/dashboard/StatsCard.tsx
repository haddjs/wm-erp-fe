// components/ga/BudgetStatsCard.tsx
import { Wallet, TrendingDown, TrendingUp, Package } from "lucide-react";

interface BudgetStatsCardProps {
  title: string;
  value: number;
  subtitle: string;
  color: "blue" | "orange" | "green" | "purple";
  icon: "budget" | "used" | "remaining" | "items";
}

const colorStyles = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-600",
    iconBg: "bg-orange-100",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-600",
    iconBg: "bg-green-100",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-600",
    iconBg: "bg-purple-100",
  },
};

const icons = {
  budget: Wallet,
  used: TrendingDown,
  remaining: TrendingUp,
  items: Package,
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const BudgetStatsCard = ({
  title,
  value,
  subtitle,
  color,
  icon,
}: BudgetStatsCardProps) => {
  const IconComponent = icons[icon];
  const styles = colorStyles[color];

  // Format value differently for currency vs number
  const formattedValue = icon === "items" ? value : formatCurrency(value);

  return (
    <div
      className={`rounded-lg border ${styles.border} bg-white p-4 transition-all hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold mt-2 ${styles.text}`}>
            {formattedValue}
          </p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`p-2 rounded-lg ${styles.iconBg}`}>
          <IconComponent className={`w-5 h-5 ${styles.text}`} />
        </div>
      </div>
    </div>
  );
};
