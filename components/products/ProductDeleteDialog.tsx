import { AlertDialogWrapper } from "@/components/dialogs";
import { useProductStore } from "@/stores";
import { useDeleteProduct } from "@/hooks/queries";
import { logger } from "@/lib/logger";

export function DeleteDialog() {
  // Keep UI state in Zustand (openDialog, selectedProduct)
  const {
    openDialog,
    setOpenDialog,
    setSelectedProduct,
    selectedProduct,
  } = useProductStore();
  
  // Use TanStack Query mutation for delete operation
  const deleteProductMutation = useDeleteProduct();

  async function deleteProductFx() {
    if (selectedProduct) {
      try {
        await deleteProductMutation.mutateAsync(selectedProduct.id);
        // Close dialog and clear selection on success
        // Toast is handled by the mutation hook
        setOpenDialog(false);
        setSelectedProduct(null);
      } catch (error) {
        // Error toast is handled by the mutation hook
        // Just log for debugging
        logger.error("Delete error:", error);
      }
    }
  }

  return (
    <AlertDialogWrapper
      open={openDialog}
      onOpenChange={(open: boolean) => {
        setOpenDialog(open);
        if (!open) {
          setSelectedProduct(null);
        }
      }}
      title="Are you absolutely sure?"
      description="This action cannot be undone. This will permanently delete the product."
      actionLabel="Delete"
      actionLoadingLabel="Deleting..."
      isLoading={deleteProductMutation.isPending}
      onAction={deleteProductFx}
      onCancel={() => {
        setSelectedProduct(null);
      }}
    />
  );
}
