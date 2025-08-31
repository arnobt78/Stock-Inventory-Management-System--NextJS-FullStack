"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Loading from "@/components/Loading";

export default function GlobalLoading() {
  const [isPageLoading, setIsPageLoading] = useState(false);
  const pathname = usePathname(); // Get the current pathname
  const searchParams = useSearchParams(); // Get the current search params

  // Debug logs - only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log("GlobalLoading: pathname =", pathname);
    console.log("GlobalLoading: searchParams =", searchParams);
  }

  useEffect(() => {
    // Trigger loading state when pathname or search params change
    setIsPageLoading(true);

    const timeout = setTimeout(() => {
      setIsPageLoading(false); // Simulate loading completion
    }, 500); // Adjust the timeout duration as needed

    return () => clearTimeout(timeout); // Cleanup timeout on unmount
  }, [pathname, searchParams]);

  // Only render if we're actually loading
  if (!isPageLoading) {
    return null;
  }

  return <Loading />; // Show loading animation if loading
}
