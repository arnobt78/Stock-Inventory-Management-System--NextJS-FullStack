import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { StockService } from "@/modules/stock/api/stock.service";

/**
 * GET: Retrieve stock records for a specific product across all warehouses
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  let productId: string | null = null;
  try {
    const user = await getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    productId = (await params).productId;
    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required." },
        { status: 400 }
      );
    }

    const stocks = await StockService.getStockByProduct(productId);
    return NextResponse.json({ success: true, data: stocks });
  } catch (error: any) {
    console.error(`Error fetching stock for product ${productId || 'unknown'}:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch stock for product" },
      { status: 500 }
    );
  }
}
