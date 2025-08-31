import { Product } from "@/app/types";
import { useProductStore } from "@/app/useProductStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast"; // Import toast hook
import { useState } from "react"; // Import useState for loading states

interface ProductsDropDownProps {
  row: {
    original: Product;
  };
}

export default function ProductsDropDown({ row }: ProductsDropDownProps) {
  const {
    addProduct,
    deleteProduct,
    setSelectedProduct,
    setOpenProductDialog,
    loadProducts,
  } = useProductStore();
  const router = useRouter();
  const { toast } = useToast(); // Use toast hook
  const [isCopying, setIsCopying] = useState(false); // Loading state for copy
  const [isDeleting, setIsDeleting] = useState(false); // Loading state for delete

  // Debug log removed to prevent payload errors

  // Handle Copy Product
  const handleCopyProduct = async () => {
    setIsCopying(true); // Start loading

    try {
      const uniqueSku = `${row.original.sku}-${Date.now()}`;

      const productToCopy: Product = {
        ...row.original,
        id: Date.now().toString(),
        name: `${row.original.name} (copy)`,
        sku: uniqueSku,
        createdAt: new Date(),
        category: row.original.category || "Unknown",
        supplier: row.original.supplier || "Unknown",
      };

      // Debug log removed to prevent payload errors

      const result = await addProduct(productToCopy);
      if (result.success) {
        // Show success toast
        toast({
          title: "Product Copied Successfully!",
          description: `"${row.original.name}" has been copied with a new SKU.`,
        });

        await loadProducts();
        router.refresh();
      } else {
        // Show error toast
        toast({
          title: "Copy Failed",
          description: "Failed to copy the product. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Show error toast
      toast({
        title: "Copy Failed",
        description: "An unexpected error occurred while copying the product.",
        variant: "destructive",
      });
    } finally {
      setIsCopying(false); // Stop loading
    }
  };

  // Handle Edit Product
  const handleEditProduct = () => {
    try {
      setSelectedProduct(row.original);
      setOpenProductDialog(true);
    } catch (error) {
      console.error("Error opening edit dialog:", error);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async () => {
    setIsDeleting(true); // Start loading

    try {
      const result = await deleteProduct(row.original.id);
      if (result.success) {
        // Show success toast
        toast({
          title: "Product Deleted Successfully!",
          description: `"${row.original.name}" has been permanently deleted.`,
        });

        router.refresh();
      } else {
        // Show error toast
        toast({
          title: "Delete Failed",
          description: "Failed to delete the product. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Show error toast
      toast({
        title: "Delete Failed",
        description: "An unexpected error occurred while deleting the product.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false); // Stop loading
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM10 8a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM10 13a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={handleCopyProduct}
          disabled={isCopying}
        >
          {isCopying ? "Copying..." : "Copy"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEditProduct}>Edit</DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDeleteProduct}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
