"use client";

import React from "react";
import AppTable from "./AppTable/AppTable";
import AuthenticatedLayout from "./components/AuthenticatedLayout";

const Home = React.memo(() => {
  return (
    <AuthenticatedLayout>
      <AppTable />
    </AuthenticatedLayout>
  );
});

Home.displayName = 'Home';

export default Home;
