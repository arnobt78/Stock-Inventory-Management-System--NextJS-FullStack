"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import FiltersAndActions from "../FiltersAndActions";
import { PaginationType } from "../Products/PaginationSelection";
import { ProductTable } from "../Products/ProductTable";
import { columns } from "../Products/columns";
import { useAuth } from "../authContext";
import { useProductStore } from "../useProductStore";
//import { ColumnFiltersState } from "@tanstack/react-table";

const AppTable = React.memo(() => {
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

  // Memoize the loadProducts callback to prevent unnecessary re-renders
  const handleLoadProducts = useCallback(() => {
    if (isLoggedIn) {
      loadProducts();
    }
  }, [isLoggedIn, loadProducts]);

  // Load products if the user is logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      handleLoadProducts();
    }
  }, [isLoggedIn, handleLoadProducts, router]);

  useEffect(() => {
    // Debug log for products - only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log("All Products in AppTable:", allProducts);
    }
  }, [allProducts]);

  // Memoize the product count
  const productCount = useMemo(() => allProducts.length, [allProducts]);

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
            {productCount} products
          </p>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters and Actions */}
        <FiltersAndActions
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
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
          data={allProducts || []}
          columns={columns}
          userId={user.id}
          isLoading={isLoading}
          searchTerm={searchTerm}
          pagination={pagination}
          setPagination={setPagination}
          selectedCategory={selectedCategory}
          selectedStatuses={selectedStatuses}
          selectedSuppliers={selectedSuppliers}
        />
      </CardContent>
    </Card>
  );
});

AppTable.displayName = 'AppTable';

export default AppTable;
