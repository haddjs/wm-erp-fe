"use client";

import { useState } from "react";

import BudgetTabs from "@/features/budget/components/budget-tabs";
import ExpenseForm from "@/features/budget/components/expense-form";
import RequestForm from "@/features/budget/components/request-form";

type Tab = "expenses" | "request";

const BudgetPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>("expenses");

  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-white px-8 py-6">
        <h1 className="text-2xl font-semibold">Budget Management</h1>

        <BudgetTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="flex justify-center items-center">
        {activeTab === "expenses" && <ExpenseForm />}
        {activeTab === "request" && <RequestForm />}
      </div>
    </div>
  );
};

export default BudgetPage;
