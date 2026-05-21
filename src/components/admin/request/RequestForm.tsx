// components/admin/RequestForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, RefreshCw, Send } from "lucide-react";

interface FormItem {
  id: string;
  category: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface RequestFormData {
  branch: string;
  programName: string;
  eventDate: string;
  bankAccount: string;
  urgency: "low" | "medium" | "high";
  description?: string;
  items: FormItem[];
}

interface RequestFormProps {
  onSubmit: (data: RequestFormData) => void;
  onReset: () => void;
  isSubmitting: boolean;
}

// Mock branches data - replace with API call
const BRANCHES = [
  "Cabang Jakarta Pusat",
  "Cabang Jakarta Selatan",
  "Cabang Surabaya",
  "Cabang Bandung",
  "Cabang Medan",
];

const CATEGORIES = [
  "ATK",
  "Peralatan",
  "Konsumsi",
  "Transportasi",
  "Marketing",
  "Lainnya",
];

const UNITS = ["pcs", "box", "paket", "set", "lembar", "unit"];

export const RequestForm = ({
  onSubmit,
  onReset,
  isSubmitting,
}: RequestFormProps) => {
  const [branch, setBranch] = useState<string | null>(null);
  const [programName, setProgramName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("medium");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<FormItem[]>([
    {
      id: "1",
      category: "",
      itemName: "",
      quantity: 1,
      unit: "",
      unitPrice: 0,
      total: 0,
    },
  ]);

  const calculateTotal = (quantity: number, price: number) => {
    return quantity * price;
  };

  const updateItem = (
    id: string,
    field: keyof FormItem,
    value: string | number | null,
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Recalculate total if quantity or unitPrice changes
          if (field === "quantity" || field === "unitPrice") {
            const qty = field === "quantity" ? Number(value) : item.quantity;
            const price =
              field === "unitPrice" ? Number(value) : item.unitPrice;
            updatedItem.total = calculateTotal(qty, price);
          }

          return updatedItem;
        }
        return item;
      }),
    );
  };

  const addItem = () => {
    const newId = String(items.length + 1);
    setItems([
      ...items,
      {
        id: newId,
        category: "",
        itemName: "",
        quantity: 1,
        unit: "",
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) {
      alert("Minimal harus ada 1 item");
      return;
    }
    setItems((items ?? []).filter((item) => item.id !== id));
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleReset = () => {
    setBranch("");
    setProgramName("");
    setEventDate("");
    setBankAccount("");
    setUrgency("medium");
    setDescription("");
    setItems([
      {
        id: "1",
        category: "",
        itemName: "",
        quantity: 1,
        unit: "",
        unitPrice: 0,
        total: 0,
      },
    ]);
    onReset();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!branch || !programName || !eventDate || !bankAccount || !urgency) {
      alert("Mohon isi semua field yang diperlukan");
      return;
    }

    // Validate items
    const hasEmptyItems = items.some(
      (item) =>
        !item.category || !item.itemName || !item.unit || item.unitPrice <= 0,
    );

    if (hasEmptyItems) {
      alert("Mohon lengkapi semua detail item");
      return;
    }

    const formData: RequestFormData = {
      branch,
      programName,
      eventDate,
      bankAccount,
      urgency,
      description,
      items,
    };

    onSubmit(formData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Main Fields */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cabang */}
          <div>
            <Label
              htmlFor="branch"
              className="text-sm font-medium text-gray-700"
            >
              Cabang <span className="text-red-500">*</span>
            </Label>
            <Select value={branch} onValueChange={setBranch}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Pilih cabang" />
              </SelectTrigger>
              <SelectContent>
                {BRANCHES.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nama Program */}
          <div>
            <Label
              htmlFor="programName"
              className="text-sm font-medium text-gray-700"
            >
              Nama Program / Kegiatan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="programName"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="Contoh: Pengadaan ATK Bulanan"
              className="mt-1"
            />
          </div>

          {/* Tanggal Event */}
          <div>
            <Label
              htmlFor="eventDate"
              className="text-sm font-medium text-gray-700"
            >
              Tanggal Event / Kebutuhan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* No Rekening */}
          <div>
            <Label
              htmlFor="bankAccount"
              className="text-sm font-medium text-gray-700"
            >
              No. Rekening Pencairan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bankAccount"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="Contoh: BCA 1234567890 a.n. PT Maju Jaya"
              className="mt-1"
            />
          </div>

          {/* Urgensi */}
          <div>
            <Label
              htmlFor="urgency"
              className="text-sm font-medium text-gray-700"
            >
              Tingkat Urgensi <span className="text-red-500">*</span>
            </Label>
            <Select
              value={urgency}
              onValueChange={(value: any) => setUrgency(value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Pilih tingkat urgensi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">🟢 Rendah</SelectItem>
                <SelectItem value="medium">🟡 Sedang</SelectItem>
                <SelectItem value="high">🔴 Tinggi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Deskripsi (optional) */}
          <div className="md:col-span-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              Deskripsi / Keterangan (Opsional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Informasi tambahan jika diperlukan..."
              rows={3}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900">Detail Item Pengajuan</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600 w-12">
                  No
                </th>
                <th className="text-left p-3 font-medium text-gray-600">
                  Kategori
                </th>
                <th className="text-left p-3 font-medium text-gray-600">
                  Nama Item
                </th>
                <th className="text-left p-3 font-medium text-gray-600 w-20">
                  Jml
                </th>
                <th className="text-left p-3 font-medium text-gray-600 w-24">
                  Satuan
                </th>
                <th className="text-left p-3 font-medium text-gray-600 w-32">
                  Harga Satuan
                </th>
                <th className="text-left p-3 font-medium text-gray-600 w-32">
                  Total
                </th>
                <th className="text-center p-3 font-medium text-gray-600 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="p-3 text-gray-600">{index + 1}.</td>
                  <td className="p-3">
                    <Select
                      value={item.category}
                      onValueChange={(value) =>
                        updateItem(item.id, "category", value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <Input
                      value={item.itemName}
                      onChange={(e) =>
                        updateItem(item.id, "itemName", e.target.value)
                      }
                      placeholder="Nama item"
                      className="w-48"
                    />
                  </td>
                  <td className="p-3">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, "quantity", Number(e.target.value))
                      }
                      min="1"
                      className="w-20"
                    />
                  </td>
                  <td className="p-3">
                    <Select
                      value={item.unit}
                      onValueChange={(value) =>
                        updateItem(item.id, "unit", value)
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <Input
                      type="number"
                      value={item.unitPrice || ""}
                      onChange={(e) =>
                        updateItem(item.id, "unitPrice", Number(e.target.value))
                      }
                      placeholder="0"
                      className="w-32"
                    />
                  </td>
                  <td className="p-3 font-medium text-gray-900">
                    {formatCurrency(item.total)}
                  </td>
                  <td className="p-3 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td
                  colSpan={6}
                  className="p-3 text-right font-semibold text-gray-700"
                >
                  Grand Total:
                </td>
                <td className="p-3 font-bold text-gray-900">
                  {formatCurrency(calculateGrandTotal())}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Item
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isSubmitting}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? "Mengirim..." : "Submit Pengajuan"}
        </Button>
      </div>
    </form>
  );
};
