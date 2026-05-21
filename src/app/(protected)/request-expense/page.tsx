"use client";

import { useRouter } from "next/navigation";
import { createEventProcurement } from "@/lib/event-procurement";
import ProcurementForm from "@/features/event-procurements/components/procurement-form";
import { toast } from "sonner";

export default function CreateEventProcurementPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      await createEventProcurement(data);
      toast.success("Event procurement created successfully");
      router.push("/event-procurement");
    } catch (error) {
      console.error("Failed to create:", error);
      toast.error("Failed to create event procurement");
      throw error;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Event Procurement</h1>
        <p className="text-gray-500 mt-1">
          Fill in the details to create a new event procurement request
        </p>
      </div>

      <ProcurementForm type="event" onSubmit={handleSubmit} />
    </div>
  );
}
