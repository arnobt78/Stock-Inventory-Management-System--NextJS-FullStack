/**
 * Product query hooks
 * useProducts() / useProduct(id) for reads; useCreateProduct(), useUpdateProduct(), useDeleteProduct()
 * for mutations. Mutations call invalidateAllRelatedQueries so lists and dashboards refresh.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getErrorMessage, isAxiosError } from "@/lib/api";
import { queryKeys, invalidateAllRelatedQueries } from "@/lib/react-query";
import { useToast } from "@/hooks/use-toast";
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from "@/types";

/**
 * Fetch all products
 * Query hook for getting the list of all products
 */
export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products.lists(),
    queryFn: async () => {
      const response = await apiClient.products.getAll();
      return response.data;
    },
  });
}

/**
 * Fetch single product by ID
 * Query hook for getting a single product with all related data
 */
export function useProduct(productId: string) {
  return useQuery<Product>({
    queryKey: queryKeys.products.detail(productId),
    queryFn: async () => {
      const response = await apiClient.products.getById(productId);
      return response.data;
    },
    // Only fetch if productId is provided
    enabled: !!productId,
  });
}

/**
 * Create product mutation
 * Mutation hook for creating a new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateProductInput) => {
      const response = await apiClient.products.create(data);
      return response.data;
    },
    onSuccess: (newProduct) => {
      invalidateAllRelatedQueries(queryClient);
      const name = (newProduct as { name?: string })?.name ?? "Product";
      toast({
        title: "Success",
        description: `Product "${name}" created successfully`,
      });
      return newProduct;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

/**
 * Update product mutation
 * Mutation hook for updating an existing product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateProductInput) => {
      const response = await apiClient.products.update(data);
      return response.data;
    },
    onSuccess: (updatedProduct) => {
      invalidateAllRelatedQueries(queryClient);
      if (updatedProduct.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.products.detail(updatedProduct.id),
        });
      }
      const name = (updatedProduct as { name?: string })?.name ?? "Product";
      toast({
        title: "Success",
        description: `Product "${name}" updated successfully`,
      });
      return updatedProduct;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

/**
 * Delete product mutation
 * Mutation hook for deleting a product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // Get product name before deleting for dynamic toast message (list or detail cache)
      const products = queryClient.getQueryData<Product[]>(
        queryKeys.products.lists()
      );
      let productName =
        products?.find((p) => p.id === id)?.name ??
        (queryClient.getQueryData<{ name?: string }>(
          queryKeys.products.detail(id)
        )?.name ?? "Product");

      await apiClient.products.delete(id);
      return { id, name: productName };
    },
    onSuccess: (deletedData) => {
      invalidateAllRelatedQueries(queryClient);
      queryClient.removeQueries({
        queryKey: queryKeys.products.detail(deletedData.id),
      });
      toast({
        title: "Success",
        description: `Product "${deletedData.name}" deleted successfully`,
      });
    },
    onError: (error) => {
      // Extract error message - getErrorMessage handles ApiError and AxiosError
      const errorMessage = getErrorMessage(error);
      
      // Check if this is a conflict error (409) - product cannot be deleted due to related orders/invoices
      const isConflictError = isAxiosError(error) && error.response?.status === 409;

      toast({
        title: isConflictError ? "Cannot Delete Product" : "Error Deleting Product",
        description: errorMessage || "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    },
  });
}

