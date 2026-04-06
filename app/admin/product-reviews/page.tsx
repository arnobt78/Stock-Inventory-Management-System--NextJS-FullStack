import { getSession } from "@/lib/auth-server";
import { getProductReviewsForAdmin } from "@/lib/server/product-reviews-data";
import AdminProductReviewsContent from "@/components/admin/AdminProductReviewsContent";

export default async function AdminProductReviewsPage() {
  const user = await getSession();
  if (!user) return null;
  const initialReviews = await getProductReviewsForAdmin(user.id);
  return <AdminProductReviewsContent initialReviews={initialReviews} />;
}
