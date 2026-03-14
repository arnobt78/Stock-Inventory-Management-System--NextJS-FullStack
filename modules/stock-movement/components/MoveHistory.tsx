"use client";

import React, { useState, useMemo } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowRightLeft, 
  Settings2,
  Filter,
  Search,
  User as UserIcon,
  Activity,
  Calendar,
  Layers
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format, isSameDay } from "date-fns";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { StatisticsCard } from "@/components/home/StatisticsCard";

interface StockMovement {
  id: string;
  productId: string;
  movementType: "RECEIPT" | "DELIVERY" | "TRANSFER" | "ADJUSTMENT";
  quantity: number;
  sourceWarehouseId?: string;
  destinationWarehouseId?: string;
  referenceType: string;
  referenceId?: string;
  notes?: string;
  userId: string;
  createdAt: string;
  product: { name: string; sku: string };
  sourceWarehouse?: { name: string };
  destinationWarehouse?: { name: string };
}

interface MoveHistoryProps {
  initialMovements: StockMovement[];
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ initialMovements }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const stats = useMemo(() => {
    const total = initialMovements.length;
    const today = initialMovements.filter(m => isSameDay(new Date(m.createdAt), new Date())).length;
    const receipts = initialMovements.filter(m => m.movementType === "RECEIPT").length;
    const transfers = initialMovements.filter(m => m.movementType === "TRANSFER").length;
    
    return { total, today, receipts, transfers };
  }, [initialMovements]);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "RECEIPT":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none flex items-center gap-1 w-fit font-bold uppercase text-[10px]"><ArrowUpRight size={12} /> Receipt</Badge>;
      case "DELIVERY":
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none flex items-center gap-1 w-fit font-bold uppercase text-[10px]"><ArrowDownRight size={12} /> Delivery</Badge>;
      case "TRANSFER":
        return <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 border-none flex items-center gap-1 w-fit font-bold uppercase text-[10px]"><ArrowRightLeft size={12} /> Transfer</Badge>;
      case "ADJUSTMENT":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none flex items-center gap-1 w-fit font-bold uppercase text-[10px]"><Settings2 size={12} /> Adjustment</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] uppercase">{type}</Badge>;
    }
  };

  const filteredMovements = initialMovements.filter(m => {
    const matchesSearch = 
      m.product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.referenceId && m.referenceId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === "all" || m.movementType === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col poppins">
      {/* Header Section */}
      <div className="pb-6 flex flex-col items-start text-left">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white pb-2">
          Move History
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Track every inventory change across your warehouses. 
          Monitor receipts, deliveries, transfers, and adjustments in real-time.
        </p>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch pb-6">
        <StatisticsCard
          title="Total Movements"
          value={stats.total}
          description="Total recorded actions"
          icon={History}
          variant="sky"
        />
        <StatisticsCard
          title="Recent (Today)"
          value={stats.today}
          description="Movements in last 24h"
          icon={Calendar}
          variant="teal"
          badges={[{ label: "Active", value: stats.today }]}
        />
        <StatisticsCard
          title="Stock Receipts"
          value={stats.receipts}
          description="Inbound inventory"
          icon={ArrowUpRight}
          variant="amber"
        />
        <StatisticsCard
          title="Transfers"
          value={stats.transfers}
          description="Internal movements"
          icon={Layers}
          variant="rose"
        />
      </div>

      {/* Filters Section */}
      <div className="pb-6">
         <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-sm">
           <div className="relative w-full sm:max-w-md">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search className="h-4 w-4 text-gray-400" />
             </div>
             <input
               className="pl-10 h-10 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
               placeholder="Search by product, SKU or reference..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           
           <div className="flex items-center gap-2 px-3 py-2 border rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm w-full sm:w-auto">
             <Activity className="h-4 w-4 text-gray-500" />
             <select
               className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full text-gray-700 dark:text-gray-200 pr-8"
               value={typeFilter}
               onChange={(e) => setTypeFilter(e.target.value)}
             >
               <option value="all">All Movements</option>
               <option value="RECEIPT">Receipts</option>
               <option value="DELIVERY">Deliveries</option>
               <option value="TRANSFER">Transfers</option>
               <option value="ADJUSTMENT">Adjustments</option>
             </select>
           </div>
         </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">Movement Type</th>
                <th className="px-6 py-4 text-center">Qty</th>
                <th className="px-6 py-4">Location(s)</th>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredMovements.length > 0 ? (
                filteredMovements.map((movement) => (
                  <tr key={movement.id} className="group hover:bg-sky-50/50 dark:hover:bg-sky-900/10 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {format(new Date(movement.createdAt), "MMM d, yyyy")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(movement.createdAt), "HH:mm a")}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors">
                        {movement.product.name}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-widest">{movement.product.sku}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {getTypeBadge(movement.movementType)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <span className={`text-sm font-bold ${movement.quantity > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col gap-0.5 text-[11px]">
                        {movement.movementType === "TRANSFER" ? (
                          <>
                            <span className="text-gray-400 italic">From: {movement.sourceWarehouse?.name}</span>
                            <span className="text-gray-900 dark:text-gray-200 font-medium font-semibold">To: {movement.destinationWarehouse?.name}</span>
                          </>
                        ) : movement.movementType === "RECEIPT" ? (
                          <div className="flex items-center gap-1.5">
                             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                             <span className="text-gray-900 dark:text-gray-200 font-medium">{movement.destinationWarehouse?.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                             <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                             <span className="text-gray-900 dark:text-gray-200 font-medium">{movement.sourceWarehouse?.name}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{movement.referenceType}</div>
                      <div className="text-xs text-sky-600 dark:text-sky-400 font-bold">{movement.referenceId || "N/A"}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-500 text-xs font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                          <UserIcon size={14} className="text-gray-400" />
                        </div>
                        {movement.userId.substring(0, 8)}
                      </div>
                    </TableCell>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <History className="h-10 w-10 text-gray-200 dark:text-gray-700" />
                      <div>
                        <p className="text-base font-medium text-gray-900 dark:text-gray-100">No movements found</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Inventory transactions will appear here as they happen.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

