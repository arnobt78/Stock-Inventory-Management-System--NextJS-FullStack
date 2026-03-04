import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true, // Enable React Strict Mode for better development debugging

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "robohash.org",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    formats: ["image/avif", "image/webp"], // Modern image formats for better performance
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production", // Remove console logs in production
  },

  // Production optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security

  // Experimental features
  experimental: {
    optimizePackageImports: ["@/components", "@/lib"], // Tree-shake large imports
    // instrumentationHook is no longer needed in Next.js 15+
    // instrumentation.ts is available by default
  },

  // Sentry webpack plugin configuration (if Sentry is configured)
  ...(process.env.SENTRY_DSN &&
    {
      // Sentry will auto-inject its webpack plugin during build
      // This is handled by @sentry/nextjs package
    }),
};

export default nextConfig;
