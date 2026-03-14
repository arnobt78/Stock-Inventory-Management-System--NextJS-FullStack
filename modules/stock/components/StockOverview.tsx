"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Package, 
  Warehouse as WarehouseIcon,
  AlertCircle,
  TrendingDown,
  Info,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StatisticsCard } from "@/components/home/StatisticsCard";
import { StatisticsCardSkeleton } from "@/components/home/StatisticsCardSkeleton";
import { useAuth } from "@/contexts";
import StockDetailsModal from "./StockDetailsModal";

export default function StockOverview() {
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | "all">("all");
  const [selectedProductStock, setSelectedProductStock] = useState<any[] | null>(null);
  
  const { isCheckingAuth } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch all stocks
  const { data, isLoading, error } = useQuery({
    queryKey: ["stocks-all"],
    queryFn: async () => {
      const res = await fetch("/api/stocks");
      if (!res.ok) throw new Error("Failed to fetch stocks");
      const result = await res.json();
      return result.data;
    },
  });

  // Unique warehouses for filter dropdown
  const warehouses = useMemo(() => {
    if (!data) return [];
    const whMap = new Map();
    data.forEach((s: any) => {
      if (s.warehouse) {
        whMap.set(s.warehouseId, s.warehouse.name);
      }
    });
    return Array.from(whMap.entries()).map(([id, name]) => ({ id, name }));
  }, [data]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (!data) return { totalQuantity: 0, reservedQuantity: 0, lowStockCount: 0, outOfStockCount: 0 };
    
    const productStats = new Map();
    data.forEach((s: any) => {
      if (!productStats.has(s.productId)) {
        productStats.set(s.productId, { qty: 0, res: 0 });
      }
      const p = productStats.get(s.productId);
      p.qty += s.quantity;
      p.res += s.reservedQuantity;
    });

    let totalQuantity = 0;
    let reservedQuantity = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    productStats.forEach(({ qty, res }) => {
      totalQuantity += qty;
      reservedQuantity += res;
      const available = qty - res;
      if (available <= 0) outOfStockCount++;
      else if (available < 10) lowStockCount++;
    });

    return { totalQuantity, reservedQuantity, lowStockCount, outOfStockCount };
  }, [data]);

  // Group stocks by product
  const groupedStocks = useMemo(() => {
    if (!data) return [];
    
    let filtered = data.filter((s: any) => {
      const matchesSearch = 
        s.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesWarehouse = selectedWarehouse === "all" || s.warehouseId === selectedWarehouse;
      
      return matchesSearch && matchesWarehouse;
    });

    const grouped = new Map();
    filtered.forEach((s: any) => {
      if (!grouped.has(s.productId)) {
        grouped.set(s.productId, {
          productId: s.productId,
          productName: s.product?.name || "Unknown Product",
          sku: s.product?.sku || "N/A",
          totalQuantity: 0,
          totalReserved: 0,
          stocks: [],
        });
      }
      const groupData = grouped.get(s.productId);
      groupData.totalQuantity += s.quantity;
      groupData.totalReserved += s.reservedQuantity;
      groupData.stocks.push(s);
    });

    return Array.from(grouped.values()).sort((a, b) => a.productName.localeCompare(b.productName));
  }, [data, searchTerm, selectedWarehouse]);

  const showSkeleton = !isMounted || isCheckingAuth || isLoading;

  return (
    <div className="flex flex-col poppins">
      {/* Header Section */}
      <div className="pb-6 flex flex-col items-start text-left">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white pb-2">
          Stock Management
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          View and manage product stock quantities across all your warehouses. 
          Track available inventory, reserved items, and low-stock alerts in real-time.
        </p>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch pb-6">
        {showSkeleton ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <StatisticsCardSkeleton key={i} />
            ))}
          </>
        ) : (
          <>
            <StatisticsCard
              title="Total Inventory"
              value={stats.totalQuantity}
              description="Across all warehouses"
              icon={Package}
              variant="sky"
              badges={[
                { label: "Reserved", value: stats.reservedQuantity },
                { label: "Available", value: stats.totalQuantity - stats.reservedQuantity }
              ]}
            />
            <StatisticsCard
              title="Stock Distribution"
              value={warehouses.length}
              description="Warehouses with inventory"
              icon={WarehouseIcon}
              variant="teal"
            />
            <StatisticsCard
              title="Low Stock Alerts"
              value={stats.lowStockCount}
              description="Needs attention soon"
              icon={Activity}
              variant="amber"
              badges={[{ label: "Threshold", value: "< 10" }]}
            />
            <StatisticsCard
              title="Out of Stock"
              value={stats.outOfStockCount}
              description="Immediate restock required"
              icon={TrendingDown}
              variant="rose"
            />
          </>
        )}
      </div>

      {/* Filters Section */}
      <div className="pb-6">
         <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-sm">
           <div className="relative w-full sm:max-w-md">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Package className="h-4 w-4 text-gray-400" />
             </div>
             <input
               className="pl-10 h-10 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
               placeholder="Search by product name or SKU..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           
           <div className="flex items-center gap-2 px-3 py-2 border rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm w-full sm:w-auto">
             <WarehouseIcon className="h-4 w-4 text-gray-500" />
             <select
               className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full text-gray-700 dark:text-gray-200 pr-8"
               value={selectedWarehouse}
               onChange={(e) => setSelectedWarehouse(e.target.value)}
             >
               <option value="all">All Warehouses</option>
               {warehouses.map((wh) => (
                 <option key={wh.id} value={wh.id}>{wh.name}</option>
               ))}
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
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4 text-right">In Stock</th>
                <th className="px-6 py-4 text-right">Reserved</th>
                <th className="px-6 py-4 text-right">Available</th>
                <th className="px-6 py-4 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {showSkeleton ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
                  </tr>
                ))
              ) : groupedStocks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100">No stock found</p>
                      <p className="text-sm">Try adjusting your filters or search terms.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                groupedStocks.map((group) => {
                  const available = group.totalQuantity - group.totalReserved;
                  const isLowStock = available < 10 && available > 0;
                  const isOutOfStock = available <= 0;

                  return (
                    <tr 
                      key={group.productId} 
                      className="group hover:bg-sky-50/50 dark:hover:bg-sky-900/10 cursor-pointer transition-colors"
                      onClick={() => setSelectedProductStock(group.stocks)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-sky-100 dark:group-hover:bg-sky-900/40 transition-colors">
                            <Package className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-sky-600 dark:group-hover:text-sky-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-300">
                              {group.productName}
                            </p>
                            <div className="flex gap-2 mt-1">
                              {isOutOfStock && (
                                <Badge variant="destructive" className="text-[10px] h-4 px-1.5 py-0 flex items-center gap-1 w-fit uppercase font-bold">
                                  Out of stock
                                </Badge>
                              )}
                              {isLowStock && (
                                <Badge variant="outline" className="text-[10px] h-4 px-1.5 py-0 border-amber-500 text-amber-600 dark:text-amber-400 flex items-center gap-1 w-fit uppercase font-bold">
                                  Low stock
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">
                        {group.sku}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-gray-900 dark:text-white text-base">
                          {group.totalQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {group.totalReserved > 0 ? (
                          <span className="font-medium text-amber-600 dark:text-amber-400">
                            {group.totalReserved}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-bold text-base ${isOutOfStock ? 'text-rose-500' : isLowStock ? 'text-amber-500' : 'text-emerald-500 dark:text-emerald-400'}`}>
                          {available}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/30 font-medium"
                        >
                          {group.stocks.length} {group.stocks.length === 1 ? 'Location' : 'Locations'}
                          <Info className="ml-2 h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <StockDetailsModal 
        isOpen={!!selectedProductStock}
        onClose={() => setSelectedProductStock(null)}
        productStock={selectedProductStock || []}
      />
    </div>
  );
}
