"use client";

import React, { type ReactNode } from "react";

/**
 * Wrapper for pages that need a left sidebar + scrollable right content.
 * Use inside Navbar children. Sidebar stays visible (sticky); only the right content scrolls with main.
 */
export interface PageWithSidebarProps {
  sidebarContent: ReactNode;
  children: ReactNode;
}

export default function PageWithSidebar({
  sidebarContent,
  children,
}: PageWithSidebarProps) {
  return (
    <div className="flex w-full gap-4 min-h-0">
      <aside
        className="sticky top-0 z-10 flex h-[calc(100vh-4.5rem)] w-64 flex-shrink-0 flex-col overflow-y-auto rounded-lg border border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl"
        aria-label="Page navigation"
      >
        {sidebarContent}
      </aside>
      <div className="min-w-0 flex-1 sm:py-6">{children}</div>
    </div>
  );
}
