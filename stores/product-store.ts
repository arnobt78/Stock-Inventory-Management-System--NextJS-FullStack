import { create } from "zustand";
import axiosInstance from "@/utils/axiosInstance";
import type { Category, Product, Supplier } from "@/types";

/**
 * Product store state interface
 * Manages products, categories, suppliers, and UI state
 */
interface ProductState {
  // Data state
  allProducts: Product[];
  categories: Category[];
  suppliers: Supplier[];
  isLoading: boolean;

  // UI state
  openDialog: boolean;
  setOpenDialog: (openDialog: boolean) => void;
  openProductDialog: boolean;
  setOpenProductDialog: (openProductDialog: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;

  // Product actions
  setAllProducts: (allProducts: Product[]) => void;
  loadProducts: () => Promise<void>;
  addProduct: (product: Product) => Promise<{ success: boolean }>;
  updateProduct: (updatedProduct: Product) => Promise<{ success: boolean }>;
  deleteProduct: (productId: string) => Promise<{ success: boolean }>;

  // Category actions
  loadCategories: () => Promise<void>;
  addCategory: (category: Category) => void;
  editCategory: (categoryId: string, newCategoryName: string) => void;
  deleteCategory: (categoryId: string) => void;

  // Supplier actions
  loadSuppliers: () => Promise<void>;
  addSupplier: (supplier: Supplier) => void;
  editSupplier: (supplierId: string, newSupplierName: string) => void;
  deleteSupplier: (supplierId: string) => void;
}

/**
 * Zustand store for product management
 * Handles CRUD operations for products, categories, and suppliers
 */
export const useProductStore = create<ProductState>((set) => ({
  // Initial state
  allProducts: [],
  categories: [],
  suppliers: [],
  isLoading: false,
  selectedProduct: null,
  openDialog: false,
  openProductDialog: false,

  // UI state setters
  setOpenDialog: (openDialog) => {
    set({ openDialog });
  },

  setOpenProductDialog: (openProductDialog) => {
    set({ openProductDialog });
  },

  setSelectedProduct: (product: Product | null) => {
    set({ selectedProduct: product });
  },

  setAllProducts: (allProducts) => {
    set({ allProducts });
  },

  /**
   * Load all products from API
   */
  loadProducts: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get("/products");
      const products = response.data || [];

      // Optimize by ensuring we don't set the same data
      set((state) => {
        // Only update if the data is actually different
        if (JSON.stringify(state.allProducts) !== JSON.stringify(products)) {
          return { allProducts: products };
        }
        return state;
      });

    } catch (error) {
      set({ allProducts: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Add a new product
   */
  addProduct: async (product: Product) => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.post("/products", product);

      const newProduct = response.data;
      set((state) => ({
        allProducts: [...state.allProducts, newProduct],
      }));
      return { success: true };
    } catch (error) {
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Update an existing product
   */
  updateProduct: async (updatedProduct: Product) => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.put("/products", updatedProduct);

      const newProduct = response.data;

      set((state) => ({
        allProducts: state.allProducts.map((product) =>
          product.id === newProduct.id ? newProduct : product
        ),
      }));

      return { success: true };
    } catch (error) {
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Delete a product
   */
  deleteProduct: async (productId: string) => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.delete("/products", {
        data: { id: productId },
      });

      if (response.status === 204) {
        set((state) => ({
          allProducts: state.allProducts.filter(
            (product) => product.id !== productId
          ),
        }));
        return { success: true };
      } else {
        throw new Error("Failed to delete product");
      }
    } catch (error) {
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Load all categories from API
   */
  loadCategories: async () => {
    try {
      const response = await axiosInstance.get("/categories");
      set({ categories: response.data ?? [] });
    } catch (error) {
      // Error handled silently
    }
  },

  /**
   * Add a new category to state
   */
  addCategory: (category: Category) =>
    set((state) => ({
      categories: [...state.categories, category],
    })),

  /**
   * Edit an existing category
   */
  editCategory: (categoryId: string, newCategoryName: string) =>
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === categoryId
          ? { ...category, name: newCategoryName }
          : category
      ),
    })),

  /**
   * Delete a category from state
   */
  deleteCategory: (categoryId) =>
    set((state) => ({
      categories: state.categories.filter((cat) => cat.id !== categoryId),
    })),

  /**
   * Load all suppliers from API
   */
  loadSuppliers: async () => {
    try {
      const response = await axiosInstance.get("/suppliers");
      set({ suppliers: response.data ?? [] });
    } catch (error) {
      // Error handled silently
    }
  },

  /**
   * Add a new supplier to state
   */
  addSupplier: (supplier: Supplier) =>
    set((state) => ({
      suppliers: [...state.suppliers, supplier],
    })),

  /**
   * Edit an existing supplier
   */
  editSupplier: (supplierId: string, newSupplierName: string) =>
    set((state) => ({
      suppliers: state.suppliers.map((supplier) =>
        supplier.id === supplierId
          ? { ...supplier, name: newSupplierName }
          : supplier
      ),
    })),

  /**
   * Delete a supplier from state
   */
  deleteSupplier: (supplierId: string) =>
    set((state) => ({
      suppliers: state.suppliers.filter(
        (supplier) => supplier.id !== supplierId
      ),
    })),
}));

