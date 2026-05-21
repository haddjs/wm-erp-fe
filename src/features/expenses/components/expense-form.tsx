"use client";

import FileUploadButton from "@/components/FileUploadButton";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExpenseOptions } from "../utils/useExpenseOptions";
import {
  CreateExpensePayload,
  UpdateExpensePayload,
  ExpenseResponse,
} from "@/types/expense";

type Props = {
  initialData?: ExpenseResponse;
  onSubmit: (
    payload: CreateExpensePayload | UpdateExpensePayload,
  ) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
};

const NONE_VALUE = "__none__";

const ExpenseForm = ({ initialData, onSubmit, onCancel, isLoading }: Props) => {
  const { branches, items, loading: optionsLoading } = useExpenseOptions();

  const [fileId, setFileId] = useState<string | null>(
    initialData?.file_id ?? null,
  );
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [name, setName] = useState(initialData?.name ?? "");
  const [date, setDate] = useState(
    initialData?.date ? initialData.date.slice(0, 10) : "",
  );
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? "");
  const [nominal, setNominal] = useState(
    initialData?.nominal?.toString() ?? "",
  );
  const [branchId, setBranchId] = useState<string | null>(
    initialData?.branch_id ?? "",
  );
  const [itemId, setItemId] = useState<string | null>(
    initialData?.item_id ?? "",
  );
  const [orderId, setOrderId] = useState<string>(initialData?.order_id ?? "");
  const [merchant, setMerchant] = useState<string>(initialData?.merchant ?? "");

  const handleSubmit = async () => {
    const payload = {
      name,
      date: new Date(date).toISOString(),
      amount: parseFloat(amount),
      nominal: parseFloat(nominal),
      ...(merchant ? { merchant } : {}),
      ...(branchId ? { branch_id: branchId } : {}),
      ...(itemId ? { item_id: itemId } : {}),
      ...(orderId ? { order_id: orderId } : {}),
      ...(fileId ? { file_id: fileId } : {}),
    };
    await onSubmit(payload);
  };

  return (
    <div className="space-y-4">
      {/* Name */}
      <div className="space-y-1">
        <Label>
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder="Expense name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Date */}
      <div className="space-y-1">
        <Label>
          Date <span className="text-red-500">*</span>
        </Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* Amount & Nominal */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>
            Amount <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            min={0}
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>
            Nominal (Rp) <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            min={0}
            placeholder="0"
            value={nominal}
            onChange={(e) => setNominal(e.target.value)}
          />
        </div>
      </div>

      {/* Merchant */}
      <div className="space-y-1">
        <Label>Merchant</Label>
        <Input
          placeholder="Merchant name (optional)"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
        />
      </div>

      {/* Branch */}
      <div className="space-y-1">
        <Label>Branch</Label>
        <Select
          value={branchId || NONE_VALUE}
          onValueChange={(val) => setBranchId(val === NONE_VALUE ? "" : val)}
          disabled={optionsLoading}
        >
          <SelectTrigger>
            <SelectValue>
              {branchId
                ? branches.find((b) => b.id === branchId)?.name
                : "Select Branch"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>None</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Item */}
      <div className="space-y-1">
        <Label>Item</Label>
        <Select
          value={itemId || NONE_VALUE}
          onValueChange={(val) => setItemId(val === NONE_VALUE ? "" : val)}
          disabled={optionsLoading}
        >
          <SelectTrigger>
            <SelectValue>
              {itemId
                ? items.find((i) => i.id === itemId)?.name
                : "Select Item"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>None</SelectItem>
            {items.map((i) => (
              <SelectItem key={i.id} value={i.id}>
                {i.name} {i.variant ? `(${i.variant})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Order ID */}
      <div className="space-y-1">
        <Label>Order ID</Label>
        <Input
          placeholder="Order ID (optional)"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label>Invoice / Receipt</Label>
        <FileUploadButton
          onUploaded={(id, url) => {
            setFileId(id);
            setFileUrl(url);
          }}
          onClear={() => {
            setFileId(null);
            setFileUrl(null);
          }}
          currentFileUrl={fileUrl}
          label="Attach Invoice"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !name || !date || !amount || !nominal}
        >
          {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
};

export default ExpenseForm;
