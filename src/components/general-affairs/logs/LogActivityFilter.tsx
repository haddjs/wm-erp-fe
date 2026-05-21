// // components/logs/ActivityFilters.tsx
// "use client";

// import { useState } from "react";
// import { Filter, Calendar, ChevronDown } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuCheckboxItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// interface ActivityFiltersProps {
//   onDateRangeChange?: (range: { from: Date | null; to: Date | null }) => void;
// }

// export const ActivityFilters = ({ onDateRangeChange }: ActivityFiltersProps) => {
//   const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
//     from: null,
//     to: null,
//   });

//   const quickRanges = [
//     { label: "Hari ini", days: 0 },
//     { label: "7 hari terakhir", days: 7 },
//     { label: "30 hari terakhir", days: 30 },
//     { label: "Bulan ini", month: "current" },
//   ];

//   const handleQuickRange = (days: number) => {
//     const to = new Date();
//     const from = new Date();
//     from.setDate(from.getDate() - days);
//     setDateRange({ from, to });
//     onDateRangeChange?.({ from, to });
//   };

//   return (
//     <div className="flex gap-2">
//       <DropdownMenu>
//         <DropdownMenuTrigger>
//           <Button variant="outline" size="sm" className="gap-2">
//             <Calendar className="w-4 h-4" />
//             Rentang Waktu
//             <ChevronDown className="w-3 h-3" />
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent align="start" className="w-48">
//           {quickRanges.map((range) => (
//             <DropdownMenuCheckboxItem
//               key={range.label}
//               onSelect={() => "days" in range && handleQuickRange(range.days)}
//             >
//               {range.label}
//             </DropdownMenuCheckboxItem>
//           ))}
//         </DropdownMenuContent>
//       </DropdownMenu>
//     </div>
//   );
// };
