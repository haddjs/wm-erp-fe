"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Trash2,
  RefreshCw,
  Send,
  Calendar as CalendarIcon,
  Building2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getBranches } from "@/lib/branch";
import { useRequest } from "../hooks/useRequest";
import { cn } from "@/lib/utils";

// --- Types & Constants ---
interface FormItem {
  id: string;
  category: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: string;
  total: number;
}

const CATEGORIES = [
  "ATK",
  "Peralatan",
  "Konsumsi",
  "Transportasi",
  "Marketing",
  "Lainnya",
];
const UNITS = ["pcs", "box", "paket", "set", "lembar", "unit"];
const URGENCY_LEVELS = [
  { label: "Rendah", value: "low", color: "text-emerald-600 bg-emerald-50" },
  { label: "Sedang", value: "medium", color: "text-amber-600 bg-amber-50" },
  { label: "Tinggi", value: "high", color: "text-rose-600 bg-rose-50" },
];

const RequestForm = () => {
  const { createRequest, loading } = useRequest();
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);

  // Main Form State
  const [branchId, setBranchId] = useState<string | null>(null);
  const [programName, setProgramName] = useState("");
  const [eventDate, setEventDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [bankAccount, setBankAccount] = useState("");
  const [urgency, setUrgency] = useState<string | null>("medium");
  const [description, setDescription] = useState("");

  // Items State
  const [items, setItems] = useState<FormItem[]>([
    {
      id: crypto.randomUUID(),
      category: "",
      itemName: "",
      quantity: 1,
      unit: "",
      unitPrice: "",
      total: 0,
    },
  ]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await getBranches();
        setBranches(data.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load branches");
      }
    };
    fetchBranches();
  }, []);

  // --- Logic Handlers ---
  const updateItem = (id: string, field: keyof FormItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updatedItem = { ...item, [field]: value };

        // Recalculate total
        const qty = field === "quantity" ? Number(value) : item.quantity;
        const price =
          field === "unitPrice" ? Number(value) : Number(item.unitPrice);
        updatedItem.total = qty * price;

        return updatedItem;
      }),
    );
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        category: "",
        itemName: "",
        quantity: 1,
        unit: "",
        unitPrice: "",
        total: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return toast.error("Minimal harus ada 1 item");
    setItems(items.filter((i) => i.id !== id));
  };

  const calculateGrandTotal = () =>
    items.reduce((sum, item) => sum + item.total, 0);

  const handleReset = () => {
    setBranchId("");
    setProgramName("");
    setEventDate(new Date().toISOString().split("T")[0]);
    setBankAccount("");
    setUrgency("medium");
    setDescription("");
    setItems([
      {
        id: crypto.randomUUID(),
        category: "",
        itemName: "",
        quantity: 1,
        unit: "",
        unitPrice: "",
        total: 0,
      },
    ]);
    toast.info("Form reset");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!branchId || !programName || !eventDate || !bankAccount) {
      return toast.error("Mohon lengkapi informasi utama pengajuan");
    }

    const hasIncompleteItems = items.some(
      (i) => !i.category || !i.itemName || !i.unit || !i.unitPrice,
    );
    if (hasIncompleteItems) {
      return toast.error("Mohon lengkapi semua detail item barang");
    }

    const payload = {
      branch_id: branchId,
      name: programName,
      date: new Date(eventDate).toISOString(),
      bank_account: bankAccount,
      priority: urgency,
      description,
      items: items.map((i) => ({ ...i, unitPrice: Number(i.unitPrice) })),
      total_amount: calculateGrandTotal(),
    };

    try {
      await createRequest(payload);
      toast.success("Pengajuan berhasil dikirim!");
      handleReset();
    } catch (error: any) {
      toast.error(error?.message || "Gagal mengirim pengajuan");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex gap-4 items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Form Pengajuan Dana
              </h1>
              <p className="text-sm text-slate-500">
                Lengkapi detail kebutuhan anggaran untuk persetujuan
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={loading}
              className="gap-2 text-slate-600"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: MAIN INFO */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" /> Informasi Umum
              </h3>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Cabang
                </Label>
                <Select value={branchId} onValueChange={setBranchId}>
                  <SelectTrigger className="bg-slate-50">
                    <SelectValue placeholder="Pilih Cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Nama Program
                </Label>
                <Input
                  placeholder="Contoh: Operasional Mei"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Tanggal Kebutuhan
                </Label>
                <Input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Urgensi
                </Label>
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger className="bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_LEVELS.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                            u.color,
                          )}
                        >
                          {u.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Rekening Tujuan
                </Label>
                <Input
                  placeholder="BCA 123 - A/N Nama"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="bg-slate-50"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Pastikan nomor rekening sudah benar. Kesalahan input rekening
                dapat menghambat proses pencairan dana.
              </p>
            </div>
          </div>

          {/* RIGHT: ITEM DETAILS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">
                  Detail Item & Anggaran
                </h3>
                <Button
                  type="button"
                  size="sm"
                  onClick={addItem}
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
                >
                  <Plus className="w-4 h-4" /> Tambah Item
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b">
                    <tr>
                      <th className="p-4 text-left font-medium w-10">#</th>
                      <th className="p-4 text-left font-medium">
                        Item / Kategori
                      </th>
                      <th className="p-4 text-left font-medium w-32">Jumlah</th>
                      <th className="p-4 text-left font-medium w-40">
                        Harga Satuan
                      </th>
                      <th className="p-4 text-right font-medium w-32">Total</th>
                      <th className="p-4 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item, idx) => (
                      <tr
                        key={item.id}
                        className="group hover:bg-slate-50/30 transition-colors"
                      >
                        <td className="p-4 text-slate-400 align-top pt-6">
                          {idx + 1}
                        </td>
                        <td className="p-4 space-y-2">
                          <Input
                            placeholder="Nama item"
                            value={item.itemName}
                            onChange={(e) =>
                              updateItem(item.id, "itemName", e.target.value)
                            }
                            className="h-8"
                          />
                          <Select
                            value={item.category}
                            onValueChange={(v) =>
                              updateItem(item.id, "category", v)
                            }
                          >
                            <SelectTrigger className="h-7 text-[11px] bg-slate-50/50">
                              <SelectValue placeholder="Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4 space-y-2">
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(item.id, "quantity", e.target.value)
                              }
                              className="h-8"
                            />
                            <Select
                              value={item.unit}
                              onValueChange={(v) =>
                                updateItem(item.id, "unit", v)
                              }
                            >
                              <SelectTrigger className="h-8 w-20 text-[11px]">
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {UNITS.map((u) => (
                                  <SelectItem key={u} value={u}>
                                    {u}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                        <td className="p-4 align-top pt-4">
                          <div className="relative">
                            <span className="absolute left-2 top-1.5 text-slate-400 text-xs">
                              Rp
                            </span>
                            <Input
                              type="number"
                              placeholder="0"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateItem(item.id, "unitPrice", e.target.value)
                              }
                              className="h-8 pl-8 text-right"
                            />
                          </div>
                        </td>
                        <td className="p-4 text-right font-semibold text-slate-700 align-top pt-6">
                          {formatCurrency(item.total)}
                        </td>
                        <td className="p-4 align-top pt-5">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* FOOTER: TOTALS */}
              <div className="p-6 bg-slate-50 border-t flex flex-col items-end gap-2">
                <span className="text-sm text-slate-500 font-medium tracking-tight">
                  RINGKASAN TOTAL
                </span>
                <div className="text-2xl font-black text-blue-700">
                  {formatCurrency(calculateGrandTotal())}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Keterangan Tambahan
              </Label>
              <Textarea
                placeholder="Tulis alasan atau detail tambahan di sini..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white shadow-sm"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full md:w-auto px-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 gap-2 transition-all active:scale-95"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {loading ? "Memproses..." : "Kirim Pengajuan"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RequestForm;
