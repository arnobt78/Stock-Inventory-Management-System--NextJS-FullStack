"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductTable } from "../Products/ProductTable";
import { columns } from "../Products/columns";
import { useProductStore } from "../useProductStore";
import { useAuth } from "../authContext";
import { useRouter } from "next/navigation";
import FiltersAndActions from "../FiltersAndActions";
import { PaginationType } from "../Products/PaginationSelection";
//import { ColumnFiltersState } from "@tanstack/react-table";

export default function AppTable() {
  const { allProducts, loadProducts, isLoading } = useProductStore();
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();

  // State for column filters, search term, and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<PaginationType>({
    pageIndex: 0,
    pageSize: 8,
  });

  // State for selected filters
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

  // Load products if the user is logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      loadProducts();
    }
  }, [isLoggedIn, loadProducts, router]);

  useEffect(() => {
    // Debug log for products - only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log("All Products in AppTable:", allProducts);
    }
  }, [allProducts]);

  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <Card className="flex flex-col shadow-none poppins border-none">
      {/* Centered Header */}
      <CardHeader className="flex flex-col justify-center items-center space-y-2 sm:space-y-0 sm:flex-row sm:justify-between sm:space-x-4">
        <div className="flex flex-col items-center sm:items-start">
          <CardTitle className="font-bold text-[23px]">Products</CardTitle>
          <p className="text-sm text-slate-600">
            {allProducts.length} products
          </p>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters and Actions */}
        <FiltersAndActions
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm} // Update search term
          pagination={pagination}
          setPagination={setPagination}
          allProducts={allProducts}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
          selectedSuppliers={selectedSuppliers}
          setSelectedSuppliers={setSelectedSuppliers}
          userId={user.id}
        />

        {/* Product Table */}
        <ProductTable
          data={allProducts || []} // Pass all products with fallback to empty array
          columns={columns} // Pass table columns
          userId={user.id}
          isLoading={isLoading}
          searchTerm={searchTerm} // Pass search term
          pagination={pagination} // Pass pagination state
          setPagination={setPagination} // Allow ProductTable to update pagination
          selectedCategory={selectedCategory}
          selectedStatuses={selectedStatuses}
          selectedSuppliers={selectedSuppliers}
        />
      </CardContent>
    </Card>
  );
}
