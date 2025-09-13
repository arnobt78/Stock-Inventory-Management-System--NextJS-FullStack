"use client";

import { AnalyticsCard } from "@/components/ui/analytics-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartCard } from "@/components/ui/chart-card";
import { ForecastingCard } from "@/components/ui/forecasting-card";
import { QRCodeComponent } from "@/components/ui/qr-code";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  DollarSign,
  Download,
  Eye,
  Package,
  PieChart as PieChartIcon,
  QrCode,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../authContext";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { useProductStore } from "../useProductStore";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function BusinessInsightsPage() {
  const { allProducts } = useProductStore();
  const { user } = useAuth();
  const { toast } = useToast();

  // Calculate analytics data with corrected calculations
  const analyticsData = useMemo(() => {
    if (!allProducts || allProducts.length === 0) {
      return {
        totalProducts: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        averagePrice: 0,
        totalQuantity: 0,
        categoryDistribution: [],
        statusDistribution: [],
        priceRangeDistribution: [],
        monthlyTrend: [],
        topProducts: [],
        lowStockProducts: [],
        stockUtilization: 0,
        valueDensity: 0,
        stockCoverage: 0,
      };
    }

    const totalProducts = allProducts.length;

    // CORRECTED: Total value calculation - sum of (price * quantity) for each product
    const totalValue = allProducts.reduce((sum, product) => {
      return sum + product.price * Number(product.quantity);
    }, 0);

    // CORRECTED: Low stock items - products with quantity > 0 AND quantity <= 20 (matching product table logic)
    const lowStockItems = allProducts.filter(
      (product) =>
        Number(product.quantity) > 0 && Number(product.quantity) <= 20
    ).length;

    // CORRECTED: Out of stock items - products with quantity = 0
    const outOfStockItems = allProducts.filter(
      (product) => Number(product.quantity) === 0
    ).length;

    // CORRECTED: Total quantity - sum of all quantities
    const totalQuantity = allProducts.reduce((sum, product) => {
      return sum + Number(product.quantity);
    }, 0);

    // CORRECTED: Average price calculation - total value divided by total quantity
    const averagePrice = totalQuantity > 0 ? totalValue / totalQuantity : 0;

    // CORRECTED: Stock utilization - percentage of products that are not out of stock
    const stockUtilization =
      totalProducts > 0
        ? ((totalProducts - outOfStockItems) / totalProducts) * 100
        : 0;

    // CORRECTED: Value density - total value divided by total products
    const valueDensity = totalProducts > 0 ? totalValue / totalProducts : 0;

    // CORRECTED: Stock coverage - average quantity per product
    const stockCoverage = totalProducts > 0 ? totalQuantity / totalProducts : 0;

    // Category distribution based on quantity (not just count)
    const categoryMap = new Map<
      string,
      { count: number; quantity: number; value: number }
    >();
    allProducts.forEach((product) => {
      const category = product.category || "Unknown";
      const current = categoryMap.get(category) || {
        count: 0,
        quantity: 0,
        value: 0,
      };
      categoryMap.set(category, {
        count: current.count + 1,
        quantity: current.quantity + Number(product.quantity),
        value: current.value + product.price * Number(product.quantity),
      });
    });

    // Convert to percentage based on quantity
    const categoryDistribution = Array.from(categoryMap.entries()).map(
      ([name, data]) => ({
        name,
        value: data.quantity,
        count: data.count,
        totalValue: data.value,
      })
    );

    // Status distribution
    const statusMap = new Map<string, number>();
    allProducts.forEach((product) => {
      const status = product.status || "Unknown";
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });
    const statusDistribution = Array.from(statusMap.entries()).map(
      ([name, value]) => ({ name, value })
    );

    // Price range distribution
    const priceRanges = [
      { name: "$0-$100", min: 0, max: 100 },
      { name: "$100-$500", min: 100, max: 500 },
      { name: "$500-$1000", min: 500, max: 1000 },
      { name: "$1000-$2000", min: 1000, max: 2000 },
      { name: "$2000+", min: 2000, max: Infinity },
    ];

    const priceRangeDistribution = priceRanges.map((range, index) => ({
      name: range.name,
      value: allProducts.filter((product) => {
        if (range.name === "$2000+") {
          // For $2000+ range, include products > $2000 (not including $2000)
          return product.price > 2000;
        } else if (range.name === "$1000-$2000") {
          // For $1000-$2000 range, include products >= $1000 and <= $2000
          return product.price >= range.min && product.price <= range.max;
        } else {
          // For other ranges, include products >= min and < max (exclusive upper bound)
          return product.price >= range.min && product.price < range.max;
        }
      }).length,
    }));

    // CORRECTED: Monthly trend based on actual product creation dates
    const monthlyTrend: Array<{
      month: string;
      products: number;
      monthlyAdded: number;
    }> = [];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Group products by creation month using UTC to avoid timezone issues
    const productsByMonth = new Map<string, number>();
    allProducts.forEach((product) => {
      const date = new Date(product.createdAt);
      // Use UTC methods to ensure consistent month extraction
      const monthKey = `${date.getUTCFullYear()}-${String(
        date.getUTCMonth() + 1
      ).padStart(2, "0")}`;
      productsByMonth.set(monthKey, (productsByMonth.get(monthKey) || 0) + 1);
    });

    // Create trend data for the whole year
    // Use the year from the first product's creation date to ensure correct year mapping
    const dataYear =
      allProducts.length > 0
        ? new Date(allProducts[0].createdAt).getUTCFullYear()
        : new Date().getUTCFullYear();
    let cumulativeProducts = 0;

    months.forEach((month, index) => {
      const monthKey = `${dataYear}-${String(index + 1).padStart(2, "0")}`;
      const productsThisMonth = productsByMonth.get(monthKey) || 0;
      cumulativeProducts += productsThisMonth;

      monthlyTrend.push({
        month,
        products: cumulativeProducts,
        monthlyAdded: productsThisMonth,
      });
    });

    // Top products by value
    const topProducts = allProducts
      .sort(
        (a, b) => b.price * Number(b.quantity) - a.price * Number(a.quantity)
      )
      .slice(0, 5)
      .map((product) => ({
        name: product.name,
        value: product.price * Number(product.quantity),
        quantity: Number(product.quantity),
      }));

    // Low stock products (matching product table logic: quantity > 0 AND quantity <= 20)
    const lowStockProducts = allProducts
      .filter(
        (product) =>
          Number(product.quantity) > 0 && Number(product.quantity) <= 20
      )
      .sort((a, b) => Number(a.quantity) - Number(b.quantity))
      .slice(0, 5);

    return {
      totalProducts,
      totalValue,
      lowStockItems,
      outOfStockItems,
      averagePrice,
      totalQuantity,
      stockUtilization,
      valueDensity,
      stockCoverage,
      categoryDistribution,
      statusDistribution,
      priceRangeDistribution,
      monthlyTrend,
      topProducts,
      lowStockProducts,
    };
  }, [allProducts]);

  const handleExportAnalytics = () => {
    toast({
      title: "Analytics Export",
      description: "Analytics export feature coming soon!",
    });
  };

  if (!user) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              Please log in to view business insights.
            </p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-primary">
              Business Insights
            </h1>
            <p className="text-lg text-muted-foreground">
              Comprehensive insights into your inventory performance
            </p>
          </div>
          <Button
            onClick={handleExportAnalytics}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Analytics
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsCard
            title="Total Products"
            value={analyticsData.totalProducts}
            icon={Package}
            iconColor="text-blue-600"
            description="Products in inventory"
          />
          <AnalyticsCard
            title="Total Value"
            value={`$${analyticsData.totalValue.toLocaleString()}`}
            icon={DollarSign}
            iconColor="text-green-600"
            description="Total inventory value"
          />
          <AnalyticsCard
            title="Low Stock Items"
            value={analyticsData.lowStockItems}
            icon={AlertTriangle}
            iconColor="text-orange-600"
            description="Items with quantity <= 20"
          />
          <AnalyticsCard
            title="Out of Stock"
            value={analyticsData.outOfStockItems}
            icon={ShoppingCart}
            iconColor="text-red-600"
            description="Items with zero quantity"
          />
        </div>

        {/* Charts and Insights */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Category Distribution */}
              <ChartCard title="Category Distribution" icon={PieChartIcon}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.categoryDistribution.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Monthly Trend - Full Year */}
              <ChartCard
                title="Product Growth Trend (Full Year)"
                icon={TrendingUp}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="products"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Status Distribution */}
              <ChartCard title="Status Distribution" icon={Activity}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.statusDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Price Range Distribution */}
              <ChartCard title="Price Range Distribution" icon={BarChart3}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.priceRangeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top Products by Value */}
              <ChartCard title="Top Products by Value" icon={TrendingUp}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={analyticsData.topProducts}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        `$${value.toLocaleString()}`,
                        "Value",
                      ]}
                      labelFormatter={(label) => `Product: ${label}`}
                    />
                    <Bar dataKey="value" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Monthly Product Addition Trend */}
              <ChartCard title="Monthly Product Addition" icon={TrendingDown}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="monthlyAdded"
                      stroke="#FF8042"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            {/* Low Stock Alerts */}
            <ChartCard title="Low Stock Alerts" icon={AlertTriangle}>
              <div className="space-y-4">
                {analyticsData.lowStockProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analyticsData.lowStockProducts.map((product, index) => (
                      <Card
                        key={index}
                        className="border-orange-200 bg-orange-50 dark:bg-orange-950/20"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-sm">
                                {product.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                SKU: {product.sku}
                              </p>
                            </div>
                            <Badge variant="destructive" className="text-xs">
                              {product.quantity} left
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No low stock alerts at the moment!
                    </p>
                  </div>
                )}
              </div>
            </ChartCard>
          </TabsContent>
        </Tabs>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Quick Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Price</span>
                <span className="font-semibold">
                  ${analyticsData.averagePrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Quantity</span>
                <span className="font-semibold">
                  {analyticsData.totalQuantity.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Stock Utilization</span>
                <span className="font-semibold">
                  {analyticsData.stockUtilization.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Inventory Health</span>
                <Badge
                  variant={
                    analyticsData.lowStockItems > 5 ? "destructive" : "default"
                  }
                >
                  {analyticsData.lowStockItems > 5
                    ? "Needs Attention"
                    : "Healthy"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Stock Coverage</span>
                <span className="font-semibold">
                  {analyticsData.stockCoverage.toFixed(1)} units avg
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Value Density</span>
                <span className="font-semibold">
                  ${analyticsData.valueDensity.toFixed(2)} per product
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Quick QR Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QRCodeComponent
                data={`${window.location.origin}/business-insights`}
                title="Dashboard QR"
                size={120}
                showDownload={false}
              />
            </CardContent>
          </Card>
        </div>

        {/* Forecasting Section */}
        <ForecastingCard products={allProducts} />
      </div>
    </AuthenticatedLayout>
  );
}
