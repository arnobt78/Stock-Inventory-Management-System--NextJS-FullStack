import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { StockService } from "@/modules/stock/api/stock.service";

/**
 * GET: Retrieve all stock records across warehouses
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stocks = await StockService.getAllStocks();
    return NextResponse.json({ success: true, data: stocks });
  } catch (error: any) {
    console.error("Error fetching stocks:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch stocks" },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a new stock record mapping a product to a warehouse
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, warehouseId, quantity } = body;

    if (!productId || !warehouseId) {
      return NextResponse.json(
        { success: false, error: "Product ID and Warehouse ID are required." },
        { status: 400 }
      );
    }

    const stock = await StockService.createStock({
      productId,
      warehouseId,
      quantity: quantity ? parseInt(String(quantity), 10) : 0,
      userId: user.id,
    });

    return NextResponse.json({ success: true, data: stock }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating stock:", error);
    // Handle specific business logic error for duplicate entries
    if (error.message?.includes("already exists")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create stock" },
      { status: 500 }
    );
  }
}
