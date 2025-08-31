import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getSessionServer } from "@/utils/auth";
import { MongoClient } from "mongodb";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSessionServer(req, res);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { method } = req;
  const userId = session.id;

  switch (method) {
    case "POST":
      try {
        const { name, sku, price, quantity, status, categoryId, supplierId } =
          req.body;

        // Check if SKU already exists
        const existingProduct = await prisma.product.findUnique({
          where: { sku },
        });

        if (existingProduct) {
          return res.status(400).json({ error: "SKU must be unique" });
        }

        // Use Prisma for product creation to ensure consistency
        const product = await prisma.product.create({
          data: {
            name,
            sku,
            price,
            quantity: BigInt(quantity) as any,
            status,
            userId,
            categoryId,
            supplierId,
            createdAt: new Date(),
          },
        });
        
        // Fetch category and supplier data for the response
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
        });
        const supplier = await prisma.supplier.findUnique({
          where: { id: supplierId },
        });
        
        // Return the created product data with category and supplier names
        res.status(201).json({
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          quantity: Number(product.quantity),
          status: product.status,
          userId: product.userId,
          categoryId: product.categoryId,
          supplierId: product.supplierId,
          createdAt: product.createdAt.toISOString(),
          category: category?.name || "Unknown",
          supplier: supplier?.name || "Unknown",
        });
      } catch (error) {
        res.status(500).json({ error: "Failed to create product" });
      }
      break;

    case "GET":
      try {
        const products = await prisma.product.findMany({
          where: { userId },
        });

        // Debug log - only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log("Raw products from database:", products);
        }

        // Fetch category and supplier data separately
        const transformedProducts = await Promise.all(
          products.map(async (product) => {
            const category = await prisma.category.findUnique({
              where: { id: product.categoryId },
            });
            const supplier = await prisma.supplier.findUnique({
              where: { id: product.supplierId },
            });

            return {
              ...product,
              quantity: Number(product.quantity), // Convert BigInt to Number
              createdAt: product.createdAt.toISOString(), // Convert `createdAt` to ISO string
              category: category?.name || "Unknown", // Transform category to string
              supplier: supplier?.name || "Unknown", // Transform supplier to string
            };
          })
        );

        res.status(200).json(transformedProducts);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
      }
      break;

    case "PUT":
      try {
        const {
          id,
          name,
          sku,
          price,
          quantity,
          status,
          categoryId,
          supplierId,
        } = req.body;

        const updatedProduct = await prisma.product.update({
          where: { id },
          data: {
            name,
            sku,
            price,
            quantity: BigInt(quantity) as any, // Convert to BigInt for database
            status,
            categoryId,
            supplierId,
          },
        });

        // Fetch category and supplier data for the response
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
        });
        const supplier = await prisma.supplier.findUnique({
          where: { id: supplierId },
        });

        // Return the updated product data with category and supplier names
        res.status(200).json({
          id: updatedProduct.id,
          name: updatedProduct.name,
          sku: updatedProduct.sku,
          price: updatedProduct.price,
          quantity: Number(updatedProduct.quantity), // Convert BigInt to Number
          status: updatedProduct.status,
          userId: updatedProduct.userId,
          categoryId: updatedProduct.categoryId,
          supplierId: updatedProduct.supplierId,
          createdAt: updatedProduct.createdAt.toISOString(),
          category: category?.name || "Unknown",
          supplier: supplier?.name || "Unknown",
        });
      } catch (error) {
        res.status(500).json({ error: "Failed to update product" });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.body;

        await prisma.product.delete({
          where: { id },
        });

        res.status(204).end();
      } catch (error) {
        res.status(500).json({ error: "Failed to delete product" });
      }
      break;

    default:
      res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
