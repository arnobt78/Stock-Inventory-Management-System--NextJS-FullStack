import Navbar from "@/components/layouts/Navbar";
import { PageContentWrapper } from "@/components/shared";
import { MoveHistory } from "@/modules/stock-movement/components/MoveHistory";
import { StockMovementService } from "@/modules/stock-movement/api/stock-movement.service";
import { getSessionFromRequest } from "@/utils/auth"; // Assuming this utility exists or similar
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Move History - Inventory Management",
  description: "Track and audit all inventory movements across warehouses.",
};

export default async function MoveHistoryPage() {
  // Fetch initial movements
  const movements = await StockMovementService.getAllMovements({});

  // Serialize BigInt/Date if necessary
  const serializedMovements = JSON.parse(JSON.stringify(movements));

  return (
    <Navbar>
      <PageContentWrapper>
        <MoveHistory initialMovements={serializedMovements} />
      </PageContentWrapper>
    </Navbar>
  );
}

