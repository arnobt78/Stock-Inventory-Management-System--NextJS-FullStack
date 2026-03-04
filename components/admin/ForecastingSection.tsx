"use client";

/**
 * Forecasting Section Component
 * Displays demand forecasting, stock predictions, and anomalies.
 * Uses mount guard so server and client render the same placeholder first (avoids hydration mismatch).
 */

import React, { useState, useLayoutEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useForecastingSummary } from "@/hooks/queries";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import type { ProductDemandForecast, SalesAnomaly } from "@/types";

/**
 * Badge variant for reorder recommendation (Status column)
 */
function getReorderBadgeVariant(
  recommendation: ProductDemandForecast["reorderRecommendation"],
): "destructive" | "secondary" | "default" | "outline" {
  switch (recommendation) {
    case "urgent":
      return "destructive";
    case "soon":
      return "secondary";
    case "overstocked":
      return "outline";
    default:
      return "default";
  }
}

/**
 * Distinct colors for Status badges: normal=green, urgent=red, soon=amber, overstocked=slate
 */
function getStatusBadgeClassName(
  recommendation: ProductDemandForecast["reorderRecommendation"],
): string {
  switch (recommendation) {
    case "urgent":
      return "border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-300 dark:bg-red-500/20 dark:border-red-400/40";
    case "soon":
      return "border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-300 dark:bg-amber-500/20 dark:border-amber-400/40";
    case "overstocked":
      return "border-slate-400/40 bg-slate-500/15 text-slate-700 dark:text-slate-300 dark:bg-slate-500/20 dark:border-slate-400/40";
    case "normal":
    default:
      return "border-emerald-500/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 dark:bg-emerald-500/20 dark:border-emerald-400/40";
  }
}

/**
 * Distinct colors for anomaly type: spike=red, dip=amber
 */
function getAnomalyTypeBadgeClassName(anomalyType: string): string {
  if (anomalyType === "spike") {
    return "border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-300 dark:bg-red-500/20 dark:border-red-400/40";
  }
  return "border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-300 dark:bg-amber-500/20 dark:border-amber-400/40";
}

/**
 * Get anomaly severity color
 */
function getAnomalySeverityColor(severity: SalesAnomaly["severity"]): string {
  switch (severity) {
    case "high":
      return "text-red-600 dark:text-red-400";
    case "medium":
      return "text-orange-600 dark:text-orange-400";
    default:
      return "text-yellow-600 dark:text-yellow-400";
  }
}

/** Same skeleton structure for loading and for initial SSR/client match (avoids hydration mismatch). */
function ForecastingSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ForecastingSection() {
  const [mounted, setMounted] = useState(false);
  const { data: summary, isLoading, isError } = useForecastingSummary();

  useLayoutEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  // Server and initial client render: same placeholder so hydration matches.
  if (!mounted) {
    return <ForecastingSkeleton />;
  }

  if (isLoading) {
    return <ForecastingSkeleton />;
  }

  if (isError || !summary) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Failed to load forecasting data
          </p>
        </CardContent>
      </Card>
    );
  }

  const urgentProducts = summary.forecasts.filter(
    (f) => f.reorderRecommendation === "urgent",
  );
  const soonProducts = summary.forecasts.filter(
    (f) => f.reorderRecommendation === "soon",
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products Analyzed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-semibold">
                {summary.totalProducts}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              At Risk of Stockout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-semibold">
                {summary.productsAtRisk}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overstocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-semibold">
                {summary.productsOverstocked}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Anomalies Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-semibold">
                {summary.anomaliesDetected}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {summary.aiInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {summary.aiInsights}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Urgent Reorder Products */}
      {(urgentProducts.length > 0 || soonProducts.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-500" />
              Reorder Recommendations
            </CardTitle>
            <CardDescription>
              Products that need attention based on predicted stockout dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead className="text-right">Daily Sales</TableHead>
                    <TableHead className="text-right">Days Left</TableHead>
                    <TableHead className="text-right">
                      Suggested Order
                    </TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...urgentProducts, ...soonProducts]
                    .slice(0, 10)
                    .map((forecast) => (
                      <TableRow key={forecast.productId}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {forecast.productName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {forecast.sku}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {forecast.availableStock}
                        </TableCell>
                        <TableCell className="text-right">
                          {forecast.predictedDailySales.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right">
                          {forecast.daysUntilStockout ?? "∞"}
                        </TableCell>
                        <TableCell className="text-right">
                          {forecast.suggestedReorderQuantity}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusBadgeClassName(
                              forecast.reorderRecommendation,
                            )}
                          >
                            {forecast.reorderRecommendation}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales Anomalies */}
      {summary.anomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              Sales Anomalies
            </CardTitle>
            <CardDescription>
              Unusual sales patterns detected in the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Expected</TableHead>
                    <TableHead className="text-right">Actual</TableHead>
                    <TableHead className="text-right">Deviation</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.anomalies.slice(0, 10).map((anomaly, idx) => (
                    <TableRow
                      key={`${anomaly.productId}-${anomaly.date}-${idx}`}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{anomaly.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {anomaly.sku}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{anomaly.date}</TableCell>
                      <TableCell className="text-right">
                        {anomaly.expectedQuantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {anomaly.actualQuantity}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={getAnomalySeverityColor(anomaly.severity)}
                        >
                          {anomaly.deviation > 0 ? "+" : ""}
                          {anomaly.deviation}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getAnomalyTypeBadgeClassName(
                            anomaly.anomalyType,
                          )}
                        >
                          {anomaly.anomalyType}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Product Forecasts */}
      <Card>
        <CardHeader>
          <CardTitle>All Product Forecasts</CardTitle>
          <CardDescription>
            Demand predictions and stock levels for all products (sorted by
            urgency)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">Avg Daily</TableHead>
                  <TableHead className="text-right">Predicted</TableHead>
                  <TableHead className="text-right">Days Left</TableHead>
                  <TableHead className="text-right">Confidence</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.forecasts.slice(0, 20).map((forecast) => (
                  <TableRow key={forecast.productId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{forecast.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {forecast.sku}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {forecast.currentStock}
                    </TableCell>
                    <TableCell className="text-right">
                      {forecast.availableStock}
                    </TableCell>
                    <TableCell className="text-right">
                      {forecast.averageDailySales.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">
                      {forecast.predictedDailySales.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">
                      {forecast.daysUntilStockout ?? "∞"}
                    </TableCell>
                    <TableCell className="text-right">
                      {forecast.confidenceScore}%
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeClassName(
                          forecast.reorderRecommendation,
                        )}
                      >
                        {forecast.reorderRecommendation}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
