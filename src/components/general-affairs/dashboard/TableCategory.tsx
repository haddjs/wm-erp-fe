// components/ga/CategoryTable.tsx
"use client";

import { Progress } from "@/components/ui/progress"; // Optional: use shadcn progress

interface Category {
  id: string;
  name: string;
  budget: number;
  used: number;
  remaining: number;
  percentage: number;
}

interface CategoryTableProps {
  categories: Category[];
  loading?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Custom progress bar if you don't have shadcn
const ProgressBar = ({
  percentage,
  color,
}: {
  percentage: number;
  color?: string;
}) => {
  const getColor = () => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-orange-500";
    if (percentage >= 30) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all duration-500 ${color || getColor()}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
};

export const CategoryTable = ({ categories, loading }: CategoryTableProps) => {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
        <p className="mt-2 text-sm text-gray-500">Memuat data...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-gray-500">Belum ada data kategori</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left p-4 font-medium text-gray-600">
              Kategori
            </th>
            <th className="text-right p-4 font-medium text-gray-600">Budget</th>
            <th className="text-right p-4 font-medium text-gray-600">
              Terpakai
            </th>
            <th className="text-right p-4 font-medium text-gray-600">Sisa</th>
            <th className="text-left p-4 font-medium text-gray-600 min-w-50">
              Serapan
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr
              key={category.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="p-4 font-medium text-gray-900">{category.name}</td>
              <td className="p-4 text-right text-gray-900">
                {formatCurrency(category.budget)}
              </td>
              <td className="p-4 text-right text-gray-700">
                {formatCurrency(category.used)}
              </td>
              <td className="p-4 text-right text-gray-700">
                {formatCurrency(category.remaining)}
              </td>
              <td className="p-4">
                <div className="space-y-2">
                  <ProgressBar percentage={category.percentage} />
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-700">
                      {category.percentage}%
                    </span>
                    {category.percentage === 100 && (
                      <span className="text-xs text-red-500 font-medium">
                        ⚠️ Habis
                      </span>
                    )}
                    {category.percentage >= 70 && category.percentage < 100 && (
                      <span className="text-xs text-orange-500 font-medium">
                        ⚠️ Mendekati habis
                      </span>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 border-t border-gray-200">
          <tr>
            <td className="p-4 font-semibold text-gray-900">Total</td>
            <td className="p-4 text-right font-semibold text-gray-900">
              {formatCurrency(categories.reduce((sum, c) => sum + c.budget, 0))}
            </td>
            <td className="p-4 text-right font-semibold text-gray-900">
              {formatCurrency(categories.reduce((sum, c) => sum + c.used, 0))}
            </td>
            <td className="p-4 text-right font-semibold text-gray-900">
              {formatCurrency(
                categories.reduce((sum, c) => sum + c.remaining, 0),
              )}
            </td>
            <td className="p-4"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
