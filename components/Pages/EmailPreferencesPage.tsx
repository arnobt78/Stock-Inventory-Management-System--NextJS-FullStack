"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts";
import Navbar from "@/components/layouts/Navbar";
import { PageContentWrapper } from "@/components/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useEmailPreferences,
  useUpdateEmailPreferences,
} from "@/hooks/queries";
import type { EmailPreferences } from "@/types";
import {
  Mail,
  Bell,
  Package,
  FileText,
  Truck,
  ShoppingCart,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { HelpTooltip } from "@/components/shared";

export type EmailPreferencesPageProps = {
  /** When true, render only content (no Navbar) for use inside admin layout */
  embedded?: boolean;
};

/**
 * Email Preferences Settings Page
 * Allows users to manage their email notification preferences
 */
export default function EmailPreferencesPage({
  embedded,
}: EmailPreferencesPageProps = {}) {
  const { user, isCheckingAuth } = useAuth();
  const { toast } = useToast();
  const isMountedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  // Fetch email preferences
  const { data: preferences, isLoading, isPending } = useEmailPreferences();
  const updateMutation = useUpdateEmailPreferences();

  // Local state for preferences (for optimistic updates)
  const [localPreferences, setLocalPreferences] =
    useState<EmailPreferences | null>(null);

  // Initialize local preferences when data loads
  useEffect(() => {
    if (preferences) {
      queueMicrotask(() => setLocalPreferences(preferences));
    }
  }, [preferences]);

  // Track component mount to prevent hydration issues
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      queueMicrotask(() => setIsMounted(true));
    }
  }, []);

  // Show skeleton while loading or not mounted
  const showSkeleton = !isMounted || isCheckingAuth || isLoading || isPending;

  /**
   * Handle preference toggle
   */
  const handleToggle = (key: keyof EmailPreferences) => {
    if (!localPreferences) return;

    // Optimistic update
    const updated = {
      ...localPreferences,
      [key]: !localPreferences[key],
    };
    setLocalPreferences(updated);

    // Update via API
    updateMutation.mutate({
      preferences: {
        [key]: updated[key],
      },
    });
  };

  /**
   * Handle save all preferences
   */
  const handleSaveAll = () => {
    if (!localPreferences) return;

    updateMutation.mutate({
      preferences: localPreferences,
    });
  };

  /**
   * Reset to defaults
   */
  const handleReset = () => {
    const defaults: EmailPreferences = {
      lowStockAlerts: true,
      stockOutNotifications: true,
      inventoryReports: true,
      productExpirationWarnings: true,
      orderConfirmations: true,
      invoiceEmails: true,
      shippingNotifications: true,
      orderStatusUpdates: true,
    };
    setLocalPreferences(defaults);
    updateMutation.mutate({
      preferences: defaults,
    });
  };

  // Preference items configuration
  const preferenceItems: Array<{
    key: keyof EmailPreferences;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      key: "lowStockAlerts",
      label: "Low Stock Alerts",
      description: "Get notified when product stock falls below threshold",
      icon: AlertTriangle,
    },
    {
      key: "stockOutNotifications",
      label: "Stock Out Notifications",
      description: "Receive alerts when products are completely out of stock",
      icon: Package,
    },
    {
      key: "inventoryReports",
      label: "Inventory Reports",
      description: "Daily, weekly, or monthly inventory summary reports",
      icon: BarChart3,
    },
    {
      key: "productExpirationWarnings",
      label: "Product Expiration Warnings",
      description: "Alerts for products approaching expiration dates",
      icon: Bell,
    },
    {
      key: "orderConfirmations",
      label: "Order Confirmations",
      description: "Email confirmations when orders are placed",
      icon: ShoppingCart,
    },
    {
      key: "invoiceEmails",
      label: "Invoice Emails",
      description: "Receive invoices and payment reminders via email",
      icon: FileText,
    },
    {
      key: "shippingNotifications",
      label: "Shipping Notifications",
      description: "Get tracking information when orders are shipped",
      icon: Truck,
    },
    {
      key: "orderStatusUpdates",
      label: "Order Status Updates",
      description: "Notifications when order status changes",
      icon: Mail,
    },
  ];

  const content = (
    <PageContentWrapper>
      <div className="mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
              Email Preferences
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Manage your email notification preferences. Choose which types of
              emails you want to receive.
            </p>
          </div>

          {/* Preferences Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md sm:text-lg flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Notification Settings
                <HelpTooltip
                  content="Toggle each type of email on or off. Changes are saved automatically."
                  side="top"
                  ariaLabel="Notification settings help"
                />
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Toggle email notifications on or off. Changes are saved
                automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showSkeleton ? (
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                      <Skeleton className="h-5 w-9" />
                    </div>
                  ))}
                </div>
              ) : localPreferences ? (
                <div className="space-y-4">
                  {preferenceItems.map((item) => {
                    const Icon = item.icon;
                    const isEnabled = localPreferences[item.key];

                    return (
                      <div
                        key={item.key}
                        className="flex items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                      >
                        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="mt-0.5 shrink-0">
                            <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Label
                              htmlFor={item.key}
                              className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white cursor-pointer"
                            >
                              {item.label}
                            </Label>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id={item.key}
                          checked={isEnabled}
                          onCheckedChange={() => handleToggle(item.key)}
                          disabled={updateMutation.isPending}
                          className="shrink-0"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {/* Action Buttons */}
              {!showSkeleton && localPreferences && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={updateMutation.isPending}
                  >
                    Reset to Defaults
                  </Button>
                  <Button
                    onClick={handleSaveAll}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending
                      ? "Saving..."
                      : "Save All Changes"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                About Email Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  • All preferences are saved automatically when you toggle
                  them.
                </p>
                <p>• You can always change these settings later.</p>
                <p>
                  • Critical system alerts may still be sent regardless of
                  preferences.
                </p>
                <p>
                  • Email notifications are sent to:{" "}
                  <strong className="text-gray-900 dark:text-white">
                    {user?.email}
                  </strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContentWrapper>
  );

  if (embedded) return content;
  return <Navbar>{content}</Navbar>;
}
