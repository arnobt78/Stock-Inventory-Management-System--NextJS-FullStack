import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/_next/",
          "/api/",
          "/dashboard/",
          "/settings/",
          "/inventory/",
          "/orders/",
          "/invoices/",
          "/products/",
          "/categories/",
          "/suppliers/",
          "/support-tickets/",
          "/business-insights/",
          "/admin/",
        ],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "anthropic-ai",
          "Claude-Web",
        ],
        disallow: "/",
      },
    ],
  };
}
