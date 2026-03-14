import { NextRequest, NextResponse } from "next/server";
import { getSession } from "next-auth/react"; // Assuming next-auth is used
import { StockMovementService } from "@/modules/stock-movement/api/stock-movement.service";
import { StockMovementType } from "@prisma/client";

/**
 * Handle GET requests for stock movements.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") || undefined;
    const warehouseId = searchParams.get("warehouseId") || undefined;
    const movementType = searchParams.get("movementType") as StockMovementType | undefined;
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;

    const movements = await StockMovementService.getAllMovements({
      productId,
      warehouseId,
      movementType,
      startDate,
      endDate,
    });

    return NextResponse.json(movements);
  } catch (error: any) {
    console.error("Error fetching stock movements:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Handle POST requests for manual stock movements (e.g., Adjustments).
 */
export async function POST(req: NextRequest) {
  try {
    // In a real app, you'd get the user ID from the session
    // const session = await getSession({ req });
    const userId = "manual_admin"; // Placeholder

    const body = await req.json();
    const movement = await StockMovementService.createMovement({
      ...body,
      userId,
    });

    return NextResponse.json(movement, { status: 201 });
  } catch (error: any) {
    console.error("Error creating stock movement:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
