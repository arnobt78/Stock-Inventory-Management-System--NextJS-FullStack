"use client";

import React, { useState } from "react";
import { AiFillProduct } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ModeToggle";
import { useAuth } from "../authContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast"; // Import toast hook

export default function AppHeader() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast(); // Use toast hook
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Add loading state

  const handleLogout = async () => {
    setIsLoggingOut(true); // Start loading

    try {
      await logout();

      // Show success toast
      toast({
        title: "Logout Successful!",
        description: "You have been logged out successfully.",
      });

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      // Show error toast
      toast({
        title: "Logout Failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false); // Stop loading
    }
  };

  return (
    <div className="p-4 flex flex-col sm:flex-row justify-between items-center bg-primary text-primary-foreground rounded-lg shadow-md">
      {/* Logo and Welcome Section */}
      <div className="flex items-center gap-4">
        <div
          className={`flex aspect-square size-10 items-center justify-center rounded-lg bg-primary-dark text-primary-foreground`}
        >
          <AiFillProduct className="text-3xl" />
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
          <p className="text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Theme Toggle and Logout Button */}
      <div className="flex items-center space-x-4 mt-4 sm:mt-0">
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
