"use client";

import React, { useLayoutEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import UserManagementList from "./UserManagementList";
import { PageContentWrapper } from "@/components/shared";
import { queryKeys } from "@/lib/react-query";
import type { UserForAdmin } from "@/types";

export type AdminUserManagementContentProps = {
  initialUsers?: UserForAdmin[];
};

export default function AdminUserManagementContent({
  initialUsers,
}: AdminUserManagementContentProps = {}) {
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    if (initialUsers != null) {
      queryClient.setQueryData(queryKeys.userManagement.lists(), initialUsers);
    }
  }, [queryClient, initialUsers]);

  return (
    <PageContentWrapper>
      <UserManagementList detailHrefBase="/admin/user-management" />
    </PageContentWrapper>
  );
}
