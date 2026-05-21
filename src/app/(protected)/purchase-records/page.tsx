"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, PartyPopper } from "lucide-react";
import PurchaseRecordList from "@/features/purchase-record/components/purchase-record-list";
import PurchaseRecordDetail from "@/features/purchase-record/components/purchase-record-detail";

type TabType = "monthly" | "event";

export default function PurchaseRecordsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("monthly");
  const [selectedMonthlyId, setSelectedMonthlyId] = useState<string | null>(
    null,
  );
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const selectedId =
    activeTab === "monthly" ? selectedMonthlyId : selectedEventId;
  const setSelectedId =
    activeTab === "monthly" ? setSelectedMonthlyId : setSelectedEventId;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-zinc-900/30">
      {/* Header */}
      <header className="border-b bg-white dark:bg-zinc-950 px-6 py-5 sticky top-0 z-10 shadow-sm shadow-slate-100/40 dark:shadow-none">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
          Purchase Records
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
          Record actual purchases for approved procurement items
        </p>
      </header>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabType)}
        className="flex-1 flex flex-col"
      >
        <div className="border-b bg-white dark:bg-zinc-950 px-6 py-2.5">
          <TabsList className="grid w-full max-w-sm grid-cols-2 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg">
            <TabsTrigger
              value="monthly"
              className="flex items-center justify-center gap-2 text-sm font-medium transition-none"
            >
              <CalendarDays className="w-4 h-4 opacity-70" />
              Monthly
            </TabsTrigger>
            <TabsTrigger
              value="event"
              className="flex items-center justify-center gap-2 text-sm font-medium transition-none"
            >
              <PartyPopper className="w-4 h-4 opacity-70" />
              Event
            </TabsTrigger>
          </TabsList>
        </div>

        {(["monthly", "event"] as TabType[]).map((tab) => (
          <TabsContent
            key={tab}
            value={tab}
            className="flex-1 mt-0 outline-none focus-visible:ring-0"
          >
            <div className="flex h-[calc(100vh-175px)] min-h-125 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <aside className="w-80 md:w-96 shrink-0 border-r border-slate-200 dark:border-zinc-800 h-full overflow-y-auto bg-slate-50/50 dark:bg-zinc-900/10">
                <PurchaseRecordList
                  type={tab}
                  onSelect={
                    tab === "monthly"
                      ? setSelectedMonthlyId
                      : setSelectedEventId
                  }
                  selectedId={
                    tab === "monthly" ? selectedMonthlyId : selectedEventId
                  }
                />
              </aside>
              <main className="flex-1 h-full overflow-y-auto bg-white dark:bg-zinc-950">
                <PurchaseRecordDetail
                  type={tab}
                  procurementId={
                    tab === "monthly" ? selectedMonthlyId : selectedEventId
                  }
                  onRecorded={() => {
                    /* optionally refresh list counts */
                  }}
                />
              </main>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
