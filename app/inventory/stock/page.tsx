import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import Navbar from "@/components/layouts/Navbar";
import { PageContentWrapper } from "@/components/shared";
import StockOverview from "@/modules/stock/components/StockOverview";

export const metadata = {
  title: "Stock Management - Stock Inventory",
  description: "View and manage product stock quantities across all your warehouses.",
};

export default async function StockPage() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  return (
    <Navbar>
      <PageContentWrapper>
        <StockOverview />
      </PageContentWrapper>
    </Navbar>
  );
}
