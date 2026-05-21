// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { MPForm } from "@/components/general-affairs/input-rab/MPForm";
// import { createMonthlyProcurement } from "@/lib/monthly-procurement";
// import { toast } from "sonner";

// interface ProcurementItem {
//   id: string;
//   category_id: string;
//   category_name?: string;
//   item_id: string;
//   item_name?: string;
//   code: string;
//   quantity: number;
//   unit: string;
//   unit_price: number;
//   total_price: number;
//   notes?: string;
// }

// export default function CreateMonthlyProcurementPage() {
//   const router = useRouter();
//   const [items, setItems] = useState<ProcurementItem[]>([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleAddItem = (item: ProcurementItem) => {
//     setItems([...items, item]);
//   };

//   const handleRemoveItem = (id: string) => {
//     setItems(items.filter((item) => item.id !== id));
//     toast.info("Item removed");
//   };

//   const handleSubmit = async (formData: {
//     branch_id: string;
//     period: string;
//   }) => {
//     if (items.length === 0) {
//       toast.error("Please add at least one item");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const periodDate = new Date(formData.period);
//       const payload = {
//         branch_id: formData.branch_id,
//         period: periodDate.toISOString(),
//         items: items.map((item) => ({
//           category_id: item.category_id,
//           item_id: item.item_id || null,
//           code: item.code,
//           quantity: item.quantity,
//           unit: item.unit,
//           unit_price: item.unit_price,
//           notes: item.notes,
//         })),
//       };

//       await createMonthlyProcurement(payload);
//       toast.success("Monthly procurement created successfully");
//       router.push("/monthly-procurement");
//     } catch (error: any) {
//       console.error("Failed to create:", error);
//       toast.error(error.message || "Failed to create monthly procurement");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-900">
//           Create Monthly Procurement
//         </h1>
//         <p className="text-sm text-gray-500 mt-1">
//           Fill in the details to create a new monthly procurement request
//         </p>
//       </div>

//       <MPForm
//         onSubmit={handleSubmit}
//         isSubmitting={isSubmitting}
//         items={items}
//         onAddItem={handleAddItem}
//         onRemoveItem={handleRemoveItem}
//       />
//     </div>
//   );
// }
