"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axiosInstance"; // Import axiosInstance
import Link from "next/link"; // Import Link from next/link
import Loading from "@/components/Loading"; // Import Loading component
import { useToast } from "@/hooks/use-toast"; // Import toast hook

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const router = useRouter();
  const { toast } = useToast(); // Use toast hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    try {
      const response = await axiosInstance.post("/auth/register", {
        name,
        email,
        password,
      });

      if (response.status === 201) {
        // Show success toast
        toast({
          title: "Account Created Successfully!",
          description: "Your account has been created. Redirecting to login page...",
        });

        // Clear form
        setName("");
        setEmail("");
        setPassword("");

        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      // Show error toast
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Stop loading
    }
  };



  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 space-y-4">
        <h2 className="text-2xl font-bold">Register</h2>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
        />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Register"}
        </Button>
        <div className="text-center">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500">
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
