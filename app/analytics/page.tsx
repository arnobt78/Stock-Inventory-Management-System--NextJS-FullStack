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

export default function AnalyticsPage() {
  const { allProducts } = useProductStore();
  const { user } = useAuth();
  const { toast } = useToast();

  // Calculate analytics data
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
      };
    }

    const totalProducts = allProducts.length;
    const totalValue = allProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const lowStockItems = allProducts.filter(product => product.quantity > 0 && product.quantity < 10).length;
    const outOfStockItems = allProducts.filter(product => product.quantity === 0).length;
    const averagePrice = totalProducts > 0 ? totalValue / allProducts.reduce((sum, product) => sum + product.quantity, 0) : 0;
    const totalQuantity = allProducts.reduce((sum, product) => sum + product.quantity, 0);

    // Category distribution
    const categoryMap = new Map<string, number>();
    allProducts.forEach(product => {
      const category = product.category || "Unknown";
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    const categoryDistribution = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

    // Status distribution
    const statusMap = new Map<string, number>();
    allProducts.forEach(product => {
      const status = product.status || "Unknown";
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });
    const statusDistribution = Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }));

    // Price range distribution
    const priceRanges = [
      { name: "$0-$10", min: 0, max: 10 },
      { name: "$10-$50", min: 10, max: 50 },
      { name: "$50-$100", min: 50, max: 100 },
      { name: "$100-$500", min: 100, max: 500 },
      { name: "$500+", min: 500, max: Infinity },
    ];

    const priceRangeDistribution = priceRanges.map(range => ({
      name: range.name,
      value: allProducts.filter(product => product.price >= range.min && product.price < range.max).length,
    }));

    // Monthly trend (simulated data)
    const monthlyTrend = [
      { month: "Jan", products: Math.floor(totalProducts * 0.8) },
      { month: "Feb", products: Math.floor(totalProducts * 0.85) },
      { month: "Mar", products: Math.floor(totalProducts * 0.9) },
      { month: "Apr", products: Math.floor(totalProducts * 0.95) },
      { month: "May", products: totalProducts },
      { month: "Jun", products: Math.floor(totalProducts * 1.05) },
    ];

    // Top products by value
    const topProducts = allProducts
      .sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))
      .slice(0, 5)
      .map(product => ({
        name: product.name,
        value: product.price * product.quantity,
        quantity: product.quantity,
      }));

    // Low stock products
    const lowStockProducts = allProducts
      .filter(product => product.quantity > 0 && product.quantity < 10)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 5);

    return {
      totalProducts,
      totalValue,
      lowStockItems,
      outOfStockItems,
      averagePrice,
      totalQuantity,
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
            <p className="text-muted-foreground">Please log in to view analytics.</p>
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
            <h1 className="text-4xl font-bold text-primary">Analytics Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              Comprehensive insights into your inventory performance
            </p>
          </div>
          <Button onClick={handleExportAnalytics} className="flex items-center gap-2">
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
            description="Items with quantity < 10"
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
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Monthly Trend */}
              <ChartCard title="Product Growth Trend" icon={TrendingUp}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="products" stroke="#8884d8" fill="#8884d8" />
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
                  <BarChart data={analyticsData.topProducts} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Average Price Trend */}
              <ChartCard title="Average Price Trend" icon={TrendingDown}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="products" stroke="#FF8042" strokeWidth={2} />
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
                      <Card key={index} className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-sm">{product.name}</h4>
                              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
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
                    <p className="text-muted-foreground">No low stock alerts at the moment!</p>
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
                <span className="font-semibold">${analyticsData.averagePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Quantity</span>
                <span className="font-semibold">{analyticsData.totalQuantity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Stock Utilization</span>
                <span className="font-semibold">
                  {analyticsData.totalProducts > 0
                    ? ((analyticsData.totalProducts - analyticsData.outOfStockItems) / analyticsData.totalProducts * 100).toFixed(1)
                    : 0}%
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
                <Badge variant={analyticsData.lowStockItems > 5 ? "destructive" : "default"}>
                  {analyticsData.lowStockItems > 5 ? "Needs Attention" : "Healthy"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Stock Coverage</span>
                <span className="font-semibold">
                  {analyticsData.totalProducts > 0
                    ? (analyticsData.totalQuantity / analyticsData.totalProducts).toFixed(1)
                    : 0} units avg
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Value Density</span>
                <span className="font-semibold">
                  ${analyticsData.totalProducts > 0
                    ? (analyticsData.totalValue / analyticsData.totalProducts).toFixed(2)
                    : 0} per product
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
                data={`${window.location.origin}/analytics`}
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
