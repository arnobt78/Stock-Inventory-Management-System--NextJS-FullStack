
"use client";

//import React, { useEffect } from "react";
import { Product } from "@/app/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Papa from 'papaparse';
import { FiFileText, FiGrid } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import * as XLSX from 'xlsx';
import { CategoryDropDown } from "./AppTable/dropdowns/CategoryDropDown";
import { StatusDropDown } from "./AppTable/dropdowns/StatusDropDown";
import { SuppliersDropDown } from "./AppTable/dropdowns/SupplierDropDown";
import AddCategoryDialog from "./AppTable/ProductDialog/AddCategoryDialog";
import AddProductDialog from "./AppTable/ProductDialog/AddProductDialog";
import AddSupplierDialog from "./AppTable/ProductDialog/AddSupplierDialog";
import PaginationSelection, {
  PaginationType,
} from "./Products/PaginationSelection";

type FiltersAndActionsProps = {
  allProducts: Product[];
  selectedCategory: string[];
  setSelectedCategory: React.Dispatch<React.SetStateAction<string[]>>;
  selectedStatuses: string[];
  setSelectedStatuses: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSuppliers: string[];
  setSelectedSuppliers: React.Dispatch<React.SetStateAction<string[]>>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  pagination: PaginationType;
  setPagination: (
    updater: PaginationType | ((old: PaginationType) => PaginationType)
  ) => void;
  userId: string;
};

export default function FiltersAndActions({
  allProducts,
  selectedCategory,
  setSelectedCategory,
  selectedStatuses,
  setSelectedStatuses,
  selectedSuppliers,
  setSelectedSuppliers,
  searchTerm,
  setSearchTerm,
  pagination,
  setPagination,
  userId,
}: FiltersAndActionsProps) {
  const { toast } = useToast();

  // Filter products based on current filters
  const getFilteredProducts = () => {
    return allProducts.filter((product) => {
      const searchMatch = !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch =
        selectedCategory.length === 0 ||
        selectedCategory.includes(product.categoryId ?? "");
      const supplierMatch =
        selectedSuppliers.length === 0 ||
        selectedSuppliers.includes(product.supplierId ?? "");
      const statusMatch =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(product.status ?? "");
      return searchMatch && categoryMatch && supplierMatch && statusMatch;
    });
  };

  const exportToCSV = () => {
    try {
      const filteredProducts = getFilteredProducts();

      if (filteredProducts.length === 0) {
        toast({
          title: "No Data to Export",
          description: "There are no products to export with the current filters.",
          variant: "destructive",
        });
        return;
      }

      const csvData = filteredProducts.map(product => ({
        'Product Name': product.name,
        'SKU': product.sku,
        'Price': `$${product.price.toFixed(2)}`,
        'Quantity': product.quantity,
        'Status': product.status,
        'Category': product.category || 'Unknown',
        'Supplier': product.supplier || 'Unknown',
        'Created Date': new Date(product.createdAt).toLocaleDateString(),
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `stockly-products-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "CSV Export Successful!",
        description: `${filteredProducts.length} products exported to CSV file.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export products to CSV. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportToExcel = () => {
    try {
      const filteredProducts = getFilteredProducts();

      if (filteredProducts.length === 0) {
        toast({
          title: "No Data to Export",
          description: "There are no products to export with the current filters.",
          variant: "destructive",
        });
        return;
      }

      const excelData = filteredProducts.map(product => ({
        'Product Name': product.name,
        'SKU': product.sku,
        'Price': product.price,
        'Quantity': product.quantity,
        'Status': product.status,
        'Category': product.category || 'Unknown',
        'Supplier': product.supplier || 'Unknown',
        'Created Date': new Date(product.createdAt).toLocaleDateString(),
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Products');

      // Auto-size columns
      const colWidths = [
        { wch: 20 }, // Product Name
        { wch: 15 }, // SKU
        { wch: 10 }, // Price
        { wch: 10 }, // Quantity
        { wch: 12 }, // Status
        { wch: 15 }, // Category
        { wch: 15 }, // Supplier
        { wch: 12 }, // Created Date
      ];
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `stockly-products-${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: "Excel Export Successful!",
        description: `${filteredProducts.length} products exported to Excel file.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export products to Excel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Search Bar */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-xl">
          <Input
            placeholder="Search by Name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 pr-10 w-full"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <IoClose className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter Area */}
      <FilterArea
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
        selectedCategories={selectedCategory}
        setSelectedCategories={setSelectedCategory}
        selectedSuppliers={selectedSuppliers}
        setSelectedSuppliers={setSelectedSuppliers}
      />

      {/* Export Section */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 bg-muted p-2 rounded-lg">
          <span className="text-sm font-medium text-muted-foreground">
            Export {filteredProducts.length} products:
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <FiFileText className="h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToExcel}
            className="flex items-center gap-2"
          >
            <FiGrid className="h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* Large Screen Layout */}
      <div className="hidden lg:flex justify-between items-center gap-4">
        {/* Add Buttons */}
        <div className="flex gap-4">
          <AddProductDialog allProducts={allProducts} userId={userId} />
          <AddCategoryDialog />
          <AddSupplierDialog />
        </div>

        {/* Pagination Selection */}
        <div className="flex justify-center">
          <PaginationSelection
            pagination={pagination}
            setPagination={setPagination}
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-4">
          <CategoryDropDown
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
          <StatusDropDown
            selectedStatuses={selectedStatuses}
            setSelectedStatuses={setSelectedStatuses}
          />
          <SuppliersDropDown
            selectedSuppliers={selectedSuppliers}
            setSelectedSuppliers={setSelectedSuppliers}
          />
        </div>
      </div>

      {/* Medium and Small Screen Layout */}
      <div className="flex flex-col lg:hidden gap-4">
        {/* Add Buttons */}
        <div className="flex flex-col gap-4">
          <AddProductDialog allProducts={allProducts} userId={userId} />
          <AddCategoryDialog />
          <AddSupplierDialog />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-col gap-4">
          <CategoryDropDown
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
          <StatusDropDown
            selectedStatuses={selectedStatuses}
            setSelectedStatuses={setSelectedStatuses}
          />
          <SuppliersDropDown
            selectedSuppliers={selectedSuppliers}
            setSelectedSuppliers={setSelectedSuppliers}
          />
        </div>
      </div>
    </div>
  );
}

// Add the FilterArea component here
function FilterArea({
  selectedStatuses,
  setSelectedStatuses,
  selectedCategories,
  setSelectedCategories,
  selectedSuppliers,
  setSelectedSuppliers,
}: {
  selectedStatuses: string[];
  setSelectedStatuses: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSuppliers: string[];
  setSelectedSuppliers: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 poppins">
      {/* Status Filter */}
      {selectedStatuses.length > 0 && (
        <div className="border-dashed border rounded-sm p-1 flex gap-2 items-center px-2 text-sm">
          <span className="text-gray-600">Status</span>
          <Separator orientation="vertical" />
          <div className="flex gap-2 items-center">
            {selectedStatuses.length < 3 ? (
              selectedStatuses.map((status, index) => (
                <Badge key={index} variant={"secondary"}>
                  {status}
                </Badge>
              ))
            ) : (
              <Badge variant={"secondary"}>3 Selected</Badge>
            )}
          </div>
        </div>
      )}

      {/* Category Filter */}
      {selectedCategories.length > 0 && (
        <div className="border-dashed border rounded-sm p-1 flex gap-2 items-center px-2 text-sm">
          <span className="text-gray-600">Category</span>
          <Separator orientation="vertical" />
          <div className="flex gap-2 items-center">
            {selectedCategories.length < 3 ? (
              selectedCategories.map((category, index) => (
                <Badge key={index} variant={"secondary"}>
                  {category}
                </Badge>
              ))
            ) : (
              <Badge variant={"secondary"}>3 Selected</Badge>
            )}
          </div>
        </div>
      )}

      {/* Supplier Filter */}
      {selectedSuppliers.length > 0 && (
        <div className="border-dashed border rounded-sm p-1 flex gap-2 items-center px-2 text-sm">
          <span className="text-gray-600">Supplier</span>
          <Separator orientation="vertical" />
          <div className="flex gap-2 items-center">
            {selectedSuppliers.length < 3 ? (
              selectedSuppliers.map((supplier, index) => (
                <Badge key={index} variant={"secondary"}>
                  {supplier}
                </Badge>
              ))
            ) : (
              <Badge variant={"secondary"}>3 Selected</Badge>
            )}
          </div>
        </div>
      )}

      {/* Reset Filters Button */}
      {(selectedStatuses.length > 0 ||
        selectedCategories.length > 0 ||
        selectedSuppliers.length > 0) && (
          <Button
            onClick={() => {
              setSelectedStatuses([]);
              setSelectedCategories([]);
              setSelectedSuppliers([]);
            }}
            variant={"ghost"}
            className="p-1 px-2"
          >
            <span>Reset</span>
            <IoClose />
          </Button>
        )}
    </div>
  );
}
