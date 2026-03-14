import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { StockService } from "@/modules/stock/api/stock.service";

/**
 * GET: Retrieve stock records for a specific warehouse
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ warehouseId: string }> }
) {
  let warehouseId: string | null = null;
  try {
    const user = await getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    warehouseId = (await params).warehouseId;
    if (!warehouseId) {
      return NextResponse.json(
        { success: false, error: "Warehouse ID is required." },
        { status: 400 }
      );
    }

    const stocks = await StockService.getStockByWarehouse(warehouseId);
    return NextResponse.json({ success: true, data: stocks });
  } catch (error: any) {
    console.error(`Error fetching stock for warehouse ${warehouseId || 'unknown'}:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch stock for warehouse" },
      { status: 500 }
    );
  }
}
