"use client";

import { Card } from "@/components/ui/card";
import React from "react";
import AppHeader from "./AppHeader/AppHeader";
import AppTable from "./AppTable/AppTable";

const Home = React.memo(() => {
  return (
    <div className="poppins w-full min-h-screen bg-gray-50 dark:bg-[#121212]">
      {/* Responsive Card */}
      <Card className="flex flex-col shadow-none space-y-4 lg:space-y-6 lg:mx-8 lg:my-6 lg:rounded-lg lg:border lg:shadow-md">
        {/* Header Section */}
        <AppHeader />

        {/* Main Content */}
        <div className="p-0 lg:p-4">
          <AppTable />
        </div>
      </Card>
    </div>
  );
});

Home.displayName = 'Home';

export default Home;
