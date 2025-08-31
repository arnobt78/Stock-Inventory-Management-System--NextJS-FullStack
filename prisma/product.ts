import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createProduct = async (data: {
  name: string;
  sku: string;
  price: number;
  quantity: number;
  status: string;
  userId: string;
  categoryId: string;
  supplierId: string;
  createdAt: Date;
}) => {
  return prisma.product.create({
    data,
  });
};

export const getProductsByUser = async (userId: string) => {
  return prisma.product.findMany({
    where: { userId },
  });
};

export const updateProduct = async (
  id: string,
  data: {
    name?: string;
    sku?: string;
    price?: number;
    quantity?: number;
    status?: string;
    categoryId?: string;
    supplierId?: string;
  }
) => {
  return prisma.product.update({
    where: { id },
    data,
  });
};

export const deleteProduct = async (id: string) => {
  return prisma.product.delete({
    where: { id },
  });
};
