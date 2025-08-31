"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiFillProduct } from "react-icons/ai";
import { FiActivity, FiFileText, FiHome } from "react-icons/fi"; // Import icons for new nav items
import { useAuth } from "../authContext";
import { ModeToggle } from "./ModeToggle";

export default function AppHeader() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();

      toast({
        title: "Logout Successful!",
        description: "You have been logged out successfully.",
      });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="p-4 flex flex-col sm:flex-row justify-between items-center bg-primary text-primary-foreground rounded-lg shadow-md">
      {/* Logo and Welcome Section */}
      <div className="flex items-center gap-4">
        <div
          className={`flex aspect-square size-10 items-center justify-center rounded-lg bg-primary-dark text-primary-foreground cursor-pointer`}
          onClick={() => handleNavigation("/")}
        >
          <AiFillProduct className="text-3xl" />
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
          <p className="text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center space-x-2 mt-4 sm:mt-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleNavigation("/")}
          className="text-primary-foreground hover:bg-primary-dark"
        >
          <FiHome className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleNavigation("/api-docs")}
          className="text-primary-foreground hover:bg-primary-dark"
        >
          <FiFileText className="mr-2 h-4 w-4" />
          API Docs
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleNavigation("/api-status")}
          className="text-primary-foreground hover:bg-primary-dark"
        >
          <FiActivity className="mr-2 h-4 w-4" />
          API Status
        </Button>
        <ModeToggle />
        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="h-10 px-6 bg-secondary text-secondary-foreground shadow-lg hover:shadow-xl hover:bg-secondary-dark transition-all"
        >
          {isLoggingOut ? "Logging Out..." : "Logout"}
        </Button>
      </div>
    </div>
  );
}
