"use client";

import { useRouter } from "next/navigation";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import Loading from "../components/Loading";
import { useAuth } from "./authContext";
import Home from "./Home";
import Login from "./login/page";

interface PageProps {
  params: Promise<{ [key: string]: any }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const PageContent: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  // Memoize the component to prevent unnecessary re-renders
  const content = useMemo(() => {
    if (isLoggedIn) {
      return <Home />;
    }
    return <Login />;
  }, [isLoggedIn]);

  return content;
};

const Page: React.FC<PageProps> = ({ params, searchParams }) => {
  const [resolvedParams, setResolvedParams] = useState<{
    [key: string]: any;
  } | null>(null);
  const [resolvedSearchParams, setResolvedSearchParams] = useState<{
    [key: string]: string | string[] | undefined;
  } | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParamsData = await params;
        const resolvedSearchParamsData = await searchParams;
        setResolvedParams(resolvedParamsData);
        setResolvedSearchParams(resolvedSearchParamsData);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error resolving params:", error);
        }
        setResolvedParams({});
        setResolvedSearchParams({});
      }
    };
    resolveParams();
  }, [params, searchParams]);

  // Memoize the loading state check
  const isLoading = useMemo(() => {
    return !resolvedParams || !resolvedSearchParams;
  }, [resolvedParams, resolvedSearchParams]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <PageContent />
    </Suspense>
  );
};

export default Page;
