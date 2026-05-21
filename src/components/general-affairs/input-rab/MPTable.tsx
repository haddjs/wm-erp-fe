"use client";

import { Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProcurementItem {
  id: string;
  category_id: string;
  category_name?: string;
  code: string;
  item_name?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  notes?: string;
}

interface MPTableProps {
  items: ProcurementItem[];
  onRemoveItem: (id: string) => void;
  grandTotal: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const MPTable = ({ items, onRemoveItem, grandTotal }: MPTableProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Procurement Items Preview
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Review items before submitting for approval
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Total {items.length} items</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-3 font-medium text-gray-600">
                Category
              </th>
              <th className="text-left p-3 font-medium text-gray-600">Code</th>
              <th className="text-left p-3 font-medium text-gray-600">
                Item Name
              </th>
              <th className="text-center p-3 font-medium text-gray-600">Qty</th>
              <th className="text-left p-3 font-medium text-gray-600">Unit</th>
              <th className="text-right p-3 font-medium text-gray-600">
                Unit Price
              </th>
              <th className="text-right p-3 font-medium text-gray-600">
                Total
              </th>
              <th className="text-center p-3 font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="p-3 text-gray-700">
                  {item.category_name || "-"}
                </td>
                <td className="p-3">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {item.code}
                  </code>
                </td>
                <td className="p-3 font-medium text-gray-900">
                  {item.item_name || "-"}
                  {item.notes && (
                    <div className="text-xs text-gray-400 mt-1">
                      {item.notes}
                    </div>
                  )}
                </td>
                <td className="p-3 text-center text-gray-700">
                  {item.quantity}
                </td>
                <td className="p-3 text-gray-700">{item.unit}</td>
                <td className="p-3 text-right text-gray-700">
                  {formatCurrency(item.unit_price)}
                </td>
                <td className="p-3 text-right font-medium text-gray-900">
                  {formatCurrency(item.total_price)}
                </td>
                <td className="p-3 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t border-gray-200">
            <tr>
              <td
                colSpan={6}
                className="p-3 text-right font-semibold text-gray-700"
              >
                Grand Total
              </td>
              <td className="p-3 text-right font-bold text-gray-900">
                {formatCurrency(grandTotal)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
