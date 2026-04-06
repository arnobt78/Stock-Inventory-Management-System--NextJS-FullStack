/**
 * OpenAPI 3.0 specification for Stockly API
 * Single source of truth for API documentation; consumed by GET /api/openapi and API docs page.
 */

export interface OpenApiSpecOptions {
  baseUrl: string;
}

/**
 * Build OpenAPI 3.0 spec object for the Stockly inventory API
 */
export function getOpenApiSpec(options: OpenApiSpecOptions): Record<string, unknown> {
  const { baseUrl } = options;

  return {
    openapi: "3.0.3",
    info: {
      title: "Stockly Inventory API",
      description: "API for the Stockly inventory management system. All endpoints require authentication via session cookie.",
      version: "1.0.0",
    },
    servers: [{ url: baseUrl }],
    security: [{ sessionCookie: [] }],
    components: {
      securitySchemes: {
        sessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "session_id",
          description: "Session cookie set after login. Send credentials: 'include' with same-origin requests.",
        },
      },
    },
    paths: {
      "/api/auth/register": {
        post: {
          summary: "Register a new user",
          tags: ["Authentication"],
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 6 },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "User created" },
            "400": { description: "Bad request" },
          },
        },
      },
      "/api/auth/login": {
        post: {
          summary: "Authenticate and get session",
          tags: ["Authentication"],
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Session cookie set" },
            "401": { description: "Invalid credentials" },
          },
        },
      },
      "/api/auth/logout": {
        post: {
          summary: "Logout and clear session",
          tags: ["Authentication"],
          responses: { "200": { description: "Logged out" } },
        },
      },
      "/api/auth/session": {
        get: {
          summary: "Get current user session",
          tags: ["Authentication"],
          responses: {
            "200": { description: "User session" },
            "401": { description: "Unauthorized" },
          },
        },
      },
      "/api/products": {
        get: {
          summary: "List products",
          tags: ["Products"],
          responses: { "200": { description: "List of products" } },
        },
        post: {
          summary: "Create product",
          tags: ["Products"],
          requestBody: { content: { "application/json": { schema: { type: "object" } } } },
          responses: { "201": { description: "Product created" } },
        },
      },
      "/api/products/{id}": {
        get: { summary: "Get product by ID", tags: ["Products"], responses: { "200": { description: "Product" } } },
        put: { summary: "Update product", tags: ["Products"], responses: { "200": { description: "Updated" } } },
        delete: { summary: "Delete product", tags: ["Products"], responses: { "200": { description: "Deleted" } } },
      },
      "/api/categories": {
        get: { summary: "List categories", tags: ["Categories"], responses: { "200": { description: "List of categories" } } },
        post: { summary: "Create category", tags: ["Categories"], responses: { "201": { description: "Category created" } } },
      },
      "/api/categories/{id}": {
        put: { summary: "Update category", tags: ["Categories"], responses: { "200": { description: "Updated" } } },
        delete: { summary: "Delete category", tags: ["Categories"], responses: { "200": { description: "Deleted" } } },
      },
      "/api/suppliers": {
        get: { summary: "List suppliers", tags: ["Suppliers"], responses: { "200": { description: "List of suppliers" } } },
        post: { summary: "Create supplier", tags: ["Suppliers"], responses: { "201": { description: "Supplier created" } } },
      },
      "/api/suppliers/{id}": {
        put: { summary: "Update supplier", tags: ["Suppliers"], responses: { "200": { description: "Updated" } } },
        delete: { summary: "Delete supplier", tags: ["Suppliers"], responses: { "200": { description: "Deleted" } } },
      },
      "/api/orders": {
        get: { summary: "List orders", tags: ["Orders"], responses: { "200": { description: "List of orders" } } },
        post: { summary: "Create order", tags: ["Orders"], responses: { "201": { description: "Order created" } } },
      },
      "/api/orders/{id}": {
        get: { summary: "Get order by ID", tags: ["Orders"], responses: { "200": { description: "Order" } } },
        put: { summary: "Update order", tags: ["Orders"], responses: { "200": { description: "Updated" } } },
        delete: { summary: "Cancel order", tags: ["Orders"], responses: { "200": { description: "Cancelled" } } },
      },
      "/api/invoices": {
        get: { summary: "List invoices", tags: ["Invoices"], responses: { "200": { description: "List of invoices" } } },
        post: { summary: "Create invoice", tags: ["Invoices"], responses: { "201": { description: "Invoice created" } } },
      },
      "/api/invoices/{id}": {
        get: { summary: "Get invoice by ID", tags: ["Invoices"], responses: { "200": { description: "Invoice" } } },
        put: { summary: "Update invoice", tags: ["Invoices"], responses: { "200": { description: "Updated" } } },
        delete: { summary: "Delete invoice", tags: ["Invoices"], responses: { "200": { description: "Deleted" } } },
      },
      "/api/health": {
        get: {
          summary: "Health check",
          tags: ["System"],
          security: [],
          responses: { "200": { description: "Database, Redis, ImageKit, Brevo status and uptime" } },
        },
      },
    },
  };
}
