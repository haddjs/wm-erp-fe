// // components/logs/ActivityCard.tsx
// "use client";

// import {
//   FileText,
//   ShoppingCart,
//   CheckCircle,
//   XCircle,
//   TrendingUp,
//   User,
//   MapPin,
//   Clock,
// } from "lucide-react";
// // import { Activity } from "@/app/general-affairs/logs/page";

// interface ActivityCardProps {
//   activity: Activity;
// }

// const getActivityIcon = (type: Activity["type"]) => {
//   switch (type) {
//     case "rab_submitted":
//       return { icon: FileText, color: "text-blue-600", bg: "bg-blue-100" };
//     case "expense_recorded":
//       return {
//         icon: ShoppingCart,
//         color: "text-green-600",
//         bg: "bg-green-100",
//       };
//     case "request_approved":
//       return {
//         icon: CheckCircle,
//         color: "text-emerald-600",
//         bg: "bg-emerald-100",
//       };
//     case "request_rejected":
//       return { icon: XCircle, color: "text-red-600", bg: "bg-red-100" };
//     case "budget_correction":
//       return {
//         icon: TrendingUp,
//         color: "text-purple-600",
//         bg: "bg-purple-100",
//       };
//     default:
//       return { icon: FileText, color: "text-gray-600", bg: "bg-gray-100" };
//   }
// };

// const getStatusBadge = (type: Activity["type"]) => {
//   switch (type) {
//     case "rab_submitted":
//       return { label: "RAB Submitted", color: "bg-blue-100 text-blue-700" };
//     case "expense_recorded":
//       return {
//         label: "Expense Recorded",
//         color: "bg-green-100 text-green-700",
//       };
//     case "request_approved":
//       return {
//         label: "Request Approved",
//         color: "bg-emerald-100 text-emerald-700",
//       };
//     case "request_rejected":
//       return { label: "Request Rejected", color: "bg-red-100 text-red-700" };
//     case "budget_correction":
//       return {
//         label: "Budget Koreksi",
//         color: "bg-purple-100 text-purple-700",
//       };
//     default:
//       return { label: "Activity", color: "bg-gray-100 text-gray-700" };
//   }
// };

// const formatTimestamp = (date: Date) => {
//   const now = new Date();
//   const diffMs = now.getTime() - date.getTime();
//   const diffMins = Math.floor(diffMs / 60000);
//   const diffHours = Math.floor(diffMs / 3600000);
//   const diffDays = Math.floor(diffMs / 86400000);

//   if (diffMins < 1) return "Baru saja";
//   if (diffMins < 60) return `${diffMins} menit lalu`;
//   if (diffHours < 24) return `${diffHours} jam lalu`;
//   if (diffDays === 1) return "Kemarin";
//   return `${diffDays} hari lalu`;
// };

// const formatCurrency = (amount?: number) => {
//   if (!amount) return "";
//   return new Intl.NumberFormat("id-ID", {
//     style: "currency",
//     currency: "IDR",
//     minimumFractionDigits: 0,
//   }).format(amount);
// };

// export const ActivityCard = ({ activity }: ActivityCardProps) => {
//   const { icon: Icon, color, bg } = getActivityIcon(activity.type);
//   const statusBadge = getStatusBadge(activity.type);
//   const timeAgo = formatTimestamp(activity.timestamp);

//   return (
//     <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
//       <div className="flex gap-4">
//         {/* Icon */}
//         <div
//           className={`shrink-0 w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}
//         >
//           <Icon className={`w-5 h-5 ${color}`} />
//         </div>

//         {/* Content */}
//         <div className="flex-1 min-w-0">
//           <div className="flex flex-wrap items-start justify-between gap-2">
//             <div className="flex-1">
//               <h3 className="text-sm font-semibold text-gray-900">
//                 {activity.title}
//               </h3>
//               <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
//                 <span
//                   className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}
//                 >
//                   {statusBadge.label}
//                 </span>
//                 {activity.amount && (
//                   <span className="text-xs font-medium text-gray-700">
//                     {formatCurrency(activity.amount)}
//                   </span>
//                 )}
//               </div>
//             </div>
//             <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
//               <Clock className="w-3 h-3" />
//               <span>{timeAgo}</span>
//             </div>
//           </div>

//           {/* User Info */}
//           <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
//             <div className="flex items-center gap-1">
//               <User className="w-3 h-3" />
//               <span>{activity.user.email}</span>
//             </div>
//             <div className="flex items-center gap-1">
//               <MapPin className="w-3 h-3" />
//               <span>Branch {activity.user.branch}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
