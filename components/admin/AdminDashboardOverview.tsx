"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  BarChart3,
  Search,
  Eye,
  Truck,
  Warehouse,
} from "lucide-react";
import {
  useOrders,
  useProducts,
  useSuppliers,
  useWarehouses,
} from "@/hooks/queries";
import { PageContentWrapper } from "@/components/shared";
import { format } from "date-fns";
import type { Order } from "@/types";

/** Shipping address may include name/email in stored JSON */
function getCustomerDisplay(order: Order): string {
  const addr = order.shippingAddress as
    | { name?: string; email?: string }
    | null
    | undefined;
  if (addr?.name) return addr.name;
  if (addr?.email) return addr.email;
  return "—";
}

export type AdminDashboardOverviewProps = {
  /** Base path for "View" link on recent orders (e.g. /admin/personal-orders). Default /admin/orders */
  orderDetailHrefBase?: string;
  /** Page title (e.g. "Store Dashboard & Analytics"). Default "Dashboard" */
  title?: string;
  /** Page subtitle (e.g. "Store-wide metrics, trends, and AI insights"). Default "Key metrics and recent activity" */
  subtitle?: string;
};

/**
 * Admin Dashboard Overview — key metrics and recent orders.
 * Matches codebook-ecommerce style: KPI cards + Orders by Status + Recent Orders table.
 */
export default function AdminDashboardOverview({
  orderDetailHrefBase = "/admin/orders",
  title = "Dashboard",
  subtitle = "Key metrics and recent activity",
}: AdminDashboardOverviewProps = {}) {
  const isMountedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const ordersQuery = useOrders();
  const productsQuery = useProducts();
  const suppliersQuery = useSuppliers();
  const warehousesQuery = useWarehouses();

  const orders = ordersQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const suppliers = suppliersQuery.data ?? [];
  const warehouses = warehousesQuery.data ?? [];

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      queueMicrotask(() => setIsMounted(true));
    }
  }, []);

  const anyPending =
    ordersQuery.isPending ||
    productsQuery.isPending ||
    suppliersQuery.isPending ||
    warehousesQuery.isPending;
  const showSkeleton = !isMounted || anyPending;

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalProducts = products.length;
    const uniqueUserIds = new Set(orders.map((o) => o.userId));
    const totalUsers = uniqueUserIds.size;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const ordersByStatus: Record<string, number> = {};
    orders.forEach((o) => {
      ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
    });
    return {
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      totalSuppliers: suppliers.length,
      totalWarehouses: warehouses.length,
      avgOrderValue,
      ordersByStatus,
    };
  }, [orders, products, suppliers, warehouses]);

  const recentOrders = useMemo(() => {
    const sorted = [...orders].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const filtered = searchTerm.trim()
      ? sorted.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getCustomerDisplay(o)
              .toLowerCase()
              .includes(searchTerm.toLowerCase()),
        )
      : sorted;
    return filtered.slice(0, 5);
  }, [orders, searchTerm]);

  if (showSkeleton) {
    return (
      <PageContentWrapper>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-primary">{title}</h1>
            <p className="text-base text-muted-foreground">{subtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-5 w-24 bg-muted rounded" />
                  <div className="h-4 w-32 bg-muted rounded mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest 5 orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </PageContentWrapper>
    );
  }

  return (
    <PageContentWrapper>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {/* KPI cards — same style as codebook-ecommerce dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          <Card className="border border-white/10 dark:border-white/10 bg-gradient-to-br from-white/80 to-white/60 dark:from-white/10 dark:to-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>
          <Card className="border border-white/10 dark:border-white/10 bg-gradient-to-br from-white/80 to-white/60 dark:from-white/10 dark:to-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                $
                {stats.totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground">Total sales</p>
            </CardContent>
          </Card>
          <Card className="border border-white/10 dark:border-white/10 bg-gradient-to-br from-white/80 to-white/60 dark:from-white/10 dark:to-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {stats.totalProducts}
              </div>
              <p className="text-xs text-muted-foreground">Active products</p>
            </CardContent>
          </Card>
          <Card className="border border-white/10 dark:border-white/10 bg-gradient-to-br from-white/80 to-white/60 dark:from-white/10 dark:to-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">From orders</p>
            </CardContent>
          </Card>
          <Card className="border border-white/10 dark:border-white/10 bg-gradient-to-br from-white/80 to-white/60 dark:from-white/10 dark:to-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Suppliers
              </CardTitle>
              <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {stats.totalSuppliers}
              </div>
              <p className="text-xs text-muted-foreground">Suppliers</p>
            </CardContent>
          </Card>
          <Card className="border border-white/10 dark:border-white/10 bg-gradient-to-br from-white/80 to-white/60 dark:from-white/10 dark:to-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Warehouses
              </CardTitle>
              <Warehouse className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {stats.totalWarehouses}
              </div>
              <p className="text-xs text-muted-foreground">Warehouses</p>
            </CardContent>
          </Card>
        </div>

        {/* Second row: Average Order Value + Orders by Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border border-white/10 dark:border-white/10 bg-gradient-to-br from-white/80 to-white/60 dark:from-white/10 dark:to-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Order Value
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                $
                {stats.avgOrderValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground">Per order average</p>
            </CardContent>
          </Card>
          <Card className="border border-white/10 dark:border-white/10 bg-gradient-to-br from-white/80 to-white/60 dark:from-white/10 dark:to-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Orders by Status
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                  <li key={status} className="flex justify-between">
                    <span className="capitalize text-muted-foreground">
                      {status}
                    </span>
                    <span className="font-medium">{count}</span>
                  </li>
                ))}
                {Object.keys(stats.ordersByStatus).length === 0 && (
                  <li className="text-muted-foreground">No orders yet</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest 5 orders</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.id.slice(0, 8)}…
                      </TableCell>
                      <TableCell>{getCustomerDisplay(order)}</TableCell>
                      <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                      <TableCell>{order.items?.length ?? 0}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(
                          new Date(order.createdAt),
                          "MMMM d, yyyy 'at' h:mm a",
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`${orderDetailHrefBase}/${order.id}`}
                          className="inline-flex items-center gap-1 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageContentWrapper>
  );
}
