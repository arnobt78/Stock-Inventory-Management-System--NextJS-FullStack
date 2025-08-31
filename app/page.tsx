"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Home from "./Home";
import Login from "./login/page";
import { useAuth } from "./authContext";
import Loading from "../components/Loading";

interface PageProps {
  params: Promise<{ [key: string]: any }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const PageContent: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth(); // Use isLoggedIn from useAuth

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn) {
    return <Home />;
  }

  return <Login />;
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
        console.error("Error resolving params:", error);
        setResolvedParams({});
        setResolvedSearchParams({});
      }
    };
    resolveParams();
  }, [params, searchParams]);

  if (!resolvedParams || !resolvedSearchParams) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <PageContent />
    </Suspense>
  );
};

export default Page;
