import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { StockService } from "@/modules/stock/api/stock.service";

/**
 * PUT: Update stock quantity or reserved quantity by ID
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string | null = null;
  try {
    const user = await getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    id = (await params).id;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Stock ID is required." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { quantity, reservedQuantity } = body;

    const dataToUpdate: any = {};
    if (quantity !== undefined) {
      dataToUpdate.quantity = parseInt(String(quantity), 10);
    }
    if (reservedQuantity !== undefined) {
      dataToUpdate.reservedQuantity = parseInt(String(reservedQuantity), 10);
    }

    const updatedStock = await StockService.updateStock(id, dataToUpdate);

    return NextResponse.json({ success: true, data: updatedStock });
  } catch (error: any) {
    console.error("Error updating stock:", error);
    if (error.message?.includes("not found")) {
      return NextResponse.json(
        { success: false, error: "Stock record not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update stock" },
      { status: 500 }
    );
  }
}
