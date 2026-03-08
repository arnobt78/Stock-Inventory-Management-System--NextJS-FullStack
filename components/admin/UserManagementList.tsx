/**
 * User Management List
 */

"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/contexts";
import { useUsers } from "@/hooks/queries";
import { PaginationType } from "@/components/shared/PaginationSelector";
import { createUserManagementColumns } from "./UserManagementTableColumns";
import UserManagementFilters from "./UserManagementFilters";
import { UserManagementTable } from "./UserManagementTable";
import CreateUserDialog from "./CreateUserDialog";
import { AnalyticsCard } from "@/components/ui/analytics-card";
import { AnalyticsCardSkeleton } from "@/components/ui/analytics-card-skeleton";
import { Users, Shield, Truck, UserCircle } from "lucide-react";

export type UserManagementListProps = {
  detailHrefBase?: string;
};

export default function UserManagementList({
  detailHrefBase,
}: UserManagementListProps = {}) {
  const isMountedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);
  const usersQuery = useUsers();
  const { user, isCheckingAuth } = useAuth();

  const allUsers = usersQuery.data ?? [];

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      queueMicrotask(() => setIsMounted(true));
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<PaginationType>({
    pageIndex: 0,
    pageSize: 8,
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const columns = useMemo(
    () =>
      createUserManagementColumns(
        detailHrefBase ?? "/admin/user-management",
        user?.id ?? null,
      ),
    [detailHrefBase, user?.id],
  );

  const showSkeleton = !isMounted || isCheckingAuth || usersQuery.isPending;

  const roleCounts = useMemo(() => {
    const total = allUsers.length;
    const admin = allUsers.filter((u) => u.role === "admin").length;
    const supplier = allUsers.filter((u) => u.role === "supplier").length;
    const client = allUsers.filter((u) => u.role === "client").length;
    return { total, admin, supplier, client };
  }, [allUsers]);

  return (
    <div className="flex flex-col poppins">
      <div className="pb-6 flex flex-col items-start text-left">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white pb-2">
          User Management
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Manage users and roles. View and update name, role, and profile.
        </p>
      </div>

      {/* Role count cards — same data as table, updates on user CRUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 pb-6 items-stretch">
        {showSkeleton ? (
          <>
            <AnalyticsCardSkeleton />
            <AnalyticsCardSkeleton />
            <AnalyticsCardSkeleton />
            <AnalyticsCardSkeleton />
          </>
        ) : (
          <>
            <AnalyticsCard
              title="Total Users"
              value={roleCounts.total}
              description="All registered users"
              icon={Users}
              variant="violet"
            />
            <AnalyticsCard
              title="Admins"
              value={roleCounts.admin}
              description="Users with role admin"
              icon={Shield}
              variant="blue"
            />
            <AnalyticsCard
              title="Suppliers"
              value={roleCounts.supplier}
              description="Users with role supplier"
              icon={Truck}
              variant="emerald"
            />
            <AnalyticsCard
              title="Clients"
              value={roleCounts.client}
              description="Users with role client"
              icon={UserCircle}
              variant="amber"
            />
          </>
        )}
      </div>

      <div className="pb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex-1">
          <UserManagementFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedRoles={selectedRoles}
            setSelectedRoles={setSelectedRoles}
          />
        </div>
        {isMounted && (
          <div className="shrink-0">
            <CreateUserDialog />
          </div>
        )}
      </div>

      <UserManagementTable
        data={allUsers}
        columns={columns}
        isLoading={showSkeleton}
        searchTerm={searchTerm}
        pagination={pagination}
        setPagination={setPagination}
        selectedRoles={selectedRoles}
      />
    </div>
  );
}
