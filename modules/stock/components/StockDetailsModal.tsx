"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin } from "lucide-react";
import type { Stock } from "@prisma/client";

interface StockDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productStock: any[]; // Grouped stocks by product
}

export default function StockDetailsModal({
  isOpen,
  onClose,
  productStock,
}: StockDetailsModalProps) {
  if (!productStock || productStock.length === 0) return null;

  const productInfo = productStock[0].product;
  const totalQuantity = productStock.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalReserved = productStock.reduce((acc, curr) => acc + curr.reservedQuantity, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] border-white/20 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-sky-500" />
            <span className="text-xl">{productInfo.name}</span>
          </DialogTitle>
          <DialogDescription>
            SKU: <span className="font-medium text-gray-900 dark:text-gray-100">{productInfo.sku}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-3 gap-4 mb-6">
          <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-xl border border-sky-100 dark:border-sky-800/30">
            <p className="text-xs text-sky-600 dark:text-sky-400 font-medium uppercase tracking-wider mb-1">Total Stock</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalQuantity}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase tracking-wider mb-1">Reserved</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalReserved}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wider mb-1">Available</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalQuantity - totalReserved}</p>
          </div>
        </div>

        <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-3">Warehouse Distribution</h3>
        
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {productStock.map((stock) => (
            <div 
              key={stock.id} 
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{stock.warehouse.name}</p>
                  <p className="text-xs text-gray-500 flex gap-2 mt-0.5">
                    {stock.warehouse.location || "No location specified"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-right">
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-500">Reserved</p>
                  <p className="font-medium text-amber-600 dark:text-amber-400">{stock.reservedQuantity}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Available</p>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">{stock.quantity - stock.reservedQuantity}</p>
                </div>
                <div className="w-px h-8 bg-gray-200 dark:bg-gray-800 mx-1"></div>
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-bold text-gray-900 dark:text-white text-base">{stock.quantity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
