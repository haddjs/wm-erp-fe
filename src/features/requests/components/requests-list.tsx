"use client";

import { useState } from "react";
import { mockRABList } from "@/features/approval-rab/types/rab";
import { RequestsFilter } from "./requests-filter";

export default function RequestsList() {
  const [items, setItems] = useState(mockRABList);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <RequestsFilter />

      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4">Pemohon</th>
              <th className="px-6 py-4">Cabang</th>
              <th className="px-6 py-4">Nama Program</th>
              <th className="px-6 py-4">Tgl Event</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Urgensi</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => (
              <tr
                key={item.id}
                className="text-sm text-gray-700 hover:bg-gray-50/50"
              >
                <td className="px-6 py-4">{item.date}</td>
                <td className="px-6 py-4 font-medium">{item.submitter}</td>
                <td className="px-6 py-4">{item.submitter}</td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {item.title}
                </td>
                <td className="px-6 py-4">{item.date}</td>
                <td className="px-6 py-4 font-semibold">
                  Rp {item.total.toLocaleString()}
                </td>

                {/* Urgensi Badge */}
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-500 border border-orange-100">
                    Urgent
                  </span>
                </td>

                {/* Status Badge */}
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-orange-600">
                    Pending
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-center">
                    <button className="px-3 py-1 border rounded-lg text-xs font-semibold hover:bg-gray-50">
                      Detail
                    </button>
                    <button className="px-3 py-1 bg-green-50 text-green-600 border border-green-200 rounded-lg text-xs font-semibold hover:bg-green-100">
                      Setuju
                    </button>
                    <button className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100">
                      Tolak
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
