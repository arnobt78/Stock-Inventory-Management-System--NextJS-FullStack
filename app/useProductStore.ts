import { Category, Product, Supplier } from "@/app/types";
import axiosInstance from "@/utils/axiosInstance";
import { create } from "zustand";

// Structure of the overall state
interface ProductState {
  allProducts: Product[];
  categories: Category[];
  suppliers: Supplier[];
  isLoading: boolean;
  openDialog: boolean;
  setOpenDialog: (openDialog: boolean) => void;
  openProductDialog: boolean;
  setOpenProductDialog: (openProductDialog: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  setAllProducts: (allProducts: Product[]) => void;
  loadProducts: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadSuppliers: () => Promise<void>;
  addProduct: (product: Product) => Promise<{ success: boolean }>;
  updateProduct: (updatedProduct: Product) => Promise<{ success: boolean }>;
  deleteProduct: (productId: string) => Promise<{ success: boolean }>;
  addCategory: (category: Category) => void;
  editCategory: (categoryId: string, newCategoryName: string) => void;
  deleteCategory: (categoryId: string) => void;
  addSupplier: (supplier: Supplier) => void;
  editSupplier: (oldName: string, newName: string) => void;
  deleteSupplier: (name: string) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  allProducts: [],
  categories: [],
  suppliers: [],
  isLoading: false,
  selectedProduct: null,
  openDialog: false,

  // Set the open dialog state
  setOpenDialog: (openDialog) => {
    set({ openDialog });
  },

  openProductDialog: false,

  // Set the open product dialog state
  setOpenProductDialog: (openProductDialog) => {
    set({ openProductDialog });
  },

  // Set the selected product for editing
  setSelectedProduct: (product: Product | null) => {
    set({ selectedProduct: product });
  },

  // Set all products
  setAllProducts: (allProducts) => {
    set({ allProducts });
  },

  // Load all products with caching
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

      if (process.env.NODE_ENV === "development") {
        console.log("Updated State with Products:", products);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error loading products:", error);
      }
      set({ allProducts: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  // Add a new product
  addProduct: async (product: Product) => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.post("/products", product);

      const newProduct = response.data;
      // Debug log - only log in development
      if (process.env.NODE_ENV === "development") {
        console.log("Product added successfully:", newProduct);
      }
      set((state) => ({
        allProducts: [...state.allProducts, newProduct],
      }));
      return { success: true };
    } catch (error) {
      console.error("Error adding product:", error);
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  // Update an existing product
  updateProduct: async (updatedProduct: Product) => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.put("/products", updatedProduct); // Send the `id` in the request body

      const newProduct = response.data;

      set((state) => ({
        allProducts: state.allProducts.map((product) =>
          product.id === newProduct.id ? newProduct : product
        ),
      }));

      // Debug log - only log in development
      if (process.env.NODE_ENV === "development") {
        console.log("Product updated successfully:", newProduct);
      }
      return { success: true };
    } catch (error) {
      console.error("Error updating product:", error);
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  // Delete a product
  deleteProduct: async (productId: string) => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.delete("/products", {
        data: { id: productId }, // Send the ID in the request body
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
      console.error("Error deleting product:", error);
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  // Load all categories
  loadCategories: async () => {
    try {
      const response = await axiosInstance.get("/categories");
      set({ categories: response.data });
      // Debug log - only log in development
      if (process.env.NODE_ENV === "development") {
        console.log("Categories loaded successfully:", response.data);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  },

  // Add a new category
  addCategory: (category: Category) =>
    set((state) => ({
      categories: [...state.categories, category],
    })),

  // Edit an existing category
  editCategory: (categoryId: string, newCategoryName: string) =>
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === categoryId
          ? { ...category, name: newCategoryName }
          : category
      ),
    })),

  // Delete a category
  deleteCategory: (categoryId) =>
    set((state) => ({
      categories: state.categories.filter((cat) => cat.id !== categoryId),
    })),

  // Load all suppliers
  loadSuppliers: async () => {
    try {
      const response = await axiosInstance.get("/suppliers");
      set({ suppliers: response.data });
      // Debug log - only log in development
      if (process.env.NODE_ENV === "development") {
        console.log("Suppliers loaded successfully:", response.data);
      }
    } catch (error) {
      console.error("Error loading suppliers:", error);
    }
  },

  // Add a new supplier
  addSupplier: (supplier: Supplier) =>
    set((state) => ({
      suppliers: [...state.suppliers, supplier],
    })),

  // Edit an existing supplier
  editSupplier: (supplierId: string, newSupplierName: string) =>
    set((state) => ({
      suppliers: state.suppliers.map((supplier) =>
        supplier.id === supplierId
          ? { ...supplier, name: newSupplierName }
          : supplier
      ),
    })),

  // Delete a supplier
  deleteSupplier: (supplierId: string) =>
    set((state) => ({
      suppliers: state.suppliers.filter(
        (supplier) => supplier.id !== supplierId
      ),
    })),
}));
