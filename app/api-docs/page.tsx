"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FiCode, FiDatabase, FiKey, FiPackage, FiUsers } from "react-icons/fi";
import AuthenticatedLayout from "../components/AuthenticatedLayout";

export default function ApiDocsPage() {
  const endpoints = [
    {
      name: "Authentication",
      icon: FiKey,
      endpoints: [
        {
          method: "POST",
          path: "/api/auth/register",
          description: "Register a new user",
          parameters: [
            { name: "name", type: "string", required: true, description: "User's full name" },
            { name: "email", type: "string", required: true, description: "User's email address" },
            { name: "password", type: "string", required: true, description: "User's password (min 6 characters)" }
          ],
          response: {
            success: { status: 201, data: "{ id: string, name: string, email: string }" },
            error: { status: 400, data: "{ error: string }" }
          }
        },
        {
          method: "POST",
          path: "/api/auth/login",
          description: "Authenticate user and get session token",
          parameters: [
            { name: "email", type: "string", required: true, description: "User's email address" },
            { name: "password", type: "string", required: true, description: "User's password" }
          ],
          response: {
            success: { status: 200, data: "{ token: string, user: { id: string, name: string, email: string } }" },
            error: { status: 401, data: "{ error: string }" }
          }
        },
        {
          method: "POST",
          path: "/api/auth/logout",
          description: "Logout user and clear session",
          parameters: [],
          response: {
            success: { status: 200, data: "{ message: string }" },
            error: { status: 500, data: "{ error: string }" }
          }
        },
        {
          method: "GET",
          path: "/api/auth/session",
          description: "Get current user session",
          parameters: [],
          response: {
            success: { status: 200, data: "{ id: string, name: string, email: string }" },
            error: { status: 401, data: "{ error: string }" }
          }
        }
      ]
    },
    {
      name: "Products",
      icon: FiPackage,
      endpoints: [
        {
          method: "GET",
          path: "/api/products",
          description: "Get all products for the authenticated user",
          parameters: [],
          response: {
            success: { status: 200, data: "Product[]" },
            error: { status: 401, data: "{ error: string }" }
          }
        },
        {
          method: "POST",
          path: "/api/products",
          description: "Create a new product",
          parameters: [
            { name: "name", type: "string", required: true, description: "Product name" },
            { name: "sku", type: "string", required: true, description: "Unique SKU" },
            { name: "price", type: "number", required: true, description: "Product price" },
            { name: "quantity", type: "number", required: true, description: "Product quantity" },
            { name: "status", type: "string", required: true, description: "Product status" },
            { name: "categoryId", type: "string", required: true, description: "Category ID" },
            { name: "supplierId", type: "string", required: true, description: "Supplier ID" }
          ],
          response: {
            success: { status: 201, data: "Product" },
            error: { status: 400, data: "{ error: string }" }
          }
        },
        {
          method: "PUT",
          path: "/api/products",
          description: "Update an existing product",
          parameters: [
            { name: "id", type: "string", required: true, description: "Product ID" },
            { name: "name", type: "string", required: true, description: "Product name" },
            { name: "sku", type: "string", required: true, description: "Unique SKU" },
            { name: "price", type: "number", required: true, description: "Product price" },
            { name: "quantity", type: "number", required: true, description: "Product quantity" },
            { name: "status", type: "string", required: true, description: "Product status" },
            { name: "categoryId", type: "string", required: true, description: "Category ID" },
            { name: "supplierId", type: "string", required: true, description: "Supplier ID" }
          ],
          response: {
            success: { status: 200, data: "Product" },
            error: { status: 400, data: "{ error: string }" }
          }
        },
        {
          method: "DELETE",
          path: "/api/products",
          description: "Delete a product",
          parameters: [
            { name: "id", type: "string", required: true, description: "Product ID" }
          ],
          response: {
            success: { status: 200, data: "{ message: string }" },
            error: { status: 400, data: "{ error: string }" }
          }
        }
      ]
    },
    {
      name: "Categories",
      icon: FiDatabase,
      endpoints: [
        {
          method: "GET",
          path: "/api/categories",
          description: "Get all categories for the authenticated user",
          parameters: [],
          response: {
            success: { status: 200, data: "Category[]" },
            error: { status: 401, data: "{ error: string }" }
          }
        },
        {
          method: "POST",
          path: "/api/categories",
          description: "Create a new category",
          parameters: [
            { name: "name", type: "string", required: true, description: "Category name" }
          ],
          response: {
            success: { status: 201, data: "Category" },
            error: { status: 400, data: "{ error: string }" }
          }
        },
        {
          method: "PUT",
          path: "/api/categories",
          description: "Update an existing category",
          parameters: [
            { name: "id", type: "string", required: true, description: "Category ID" },
            { name: "name", type: "string", required: true, description: "Category name" }
          ],
          response: {
            success: { status: 200, data: "Category" },
            error: { status: 400, data: "{ error: string }" }
          }
        },
        {
          method: "DELETE",
          path: "/api/categories",
          description: "Delete a category",
          parameters: [
            { name: "id", type: "string", required: true, description: "Category ID" }
          ],
          response: {
            success: { status: 200, data: "{ message: string }" },
            error: { status: 400, data: "{ error: string }" }
          }
        }
      ]
    },
    {
      name: "Suppliers",
      icon: FiUsers,
      endpoints: [
        {
          method: "GET",
          path: "/api/suppliers",
          description: "Get all suppliers for the authenticated user",
          parameters: [],
          response: {
            success: { status: 200, data: "Supplier[]" },
            error: { status: 401, data: "{ error: string }" }
          }
        },
        {
          method: "POST",
          path: "/api/suppliers",
          description: "Create a new supplier",
          parameters: [
            { name: "name", type: "string", required: true, description: "Supplier name" },
            { name: "email", type: "string", required: false, description: "Supplier email" },
            { name: "phone", type: "string", required: false, description: "Supplier phone" }
          ],
          response: {
            success: { status: 201, data: "Supplier" },
            error: { status: 400, data: "{ error: string }" }
          }
        },
        {
          method: "PUT",
          path: "/api/suppliers",
          description: "Update an existing supplier",
          parameters: [
            { name: "id", type: "string", required: true, description: "Supplier ID" },
            { name: "name", type: "string", required: true, description: "Supplier name" },
            { name: "email", type: "string", required: false, description: "Supplier email" },
            { name: "phone", type: "string", required: false, description: "Supplier phone" }
          ],
          response: {
            success: { status: 200, data: "Supplier" },
            error: { status: 400, data: "{ error: string }" }
          }
        },
        {
          method: "DELETE",
          path: "/api/suppliers",
          description: "Delete a supplier",
          parameters: [
            { name: "id", type: "string", required: true, description: "Supplier ID" }
          ],
          response: {
            success: { status: 200, data: "{ message: string }" },
            error: { status: 400, data: "{ error: string }" }
          }
        }
      ]
    }
  ];

  const dataTypes = [
    {
      name: "Product",
      fields: [
        { name: "id", type: "string", description: "Unique identifier" },
        { name: "name", type: "string", description: "Product name" },
        { name: "sku", type: "string", description: "Stock Keeping Unit" },
        { name: "price", type: "number", description: "Product price" },
        { name: "quantity", type: "number", description: "Available quantity" },
        { name: "status", type: "string", description: "Product status" },
        { name: "categoryId", type: "string", description: "Category reference" },
        { name: "supplierId", type: "string", description: "Supplier reference" },
        { name: "userId", type: "string", description: "Owner user ID" },
        { name: "createdAt", type: "Date", description: "Creation timestamp" },
        { name: "category", type: "string", description: "Category name" },
        { name: "supplier", type: "string", description: "Supplier name" }
      ]
    },
    {
      name: "Category",
      fields: [
        { name: "id", type: "string", description: "Unique identifier" },
        { name: "name", type: "string", description: "Category name" },
        { name: "userId", type: "string", description: "Owner user ID" },
        { name: "createdAt", type: "Date", description: "Creation timestamp" }
      ]
    },
    {
      name: "Supplier",
      fields: [
        { name: "id", type: "string", description: "Unique identifier" },
        { name: "name", type: "string", description: "Supplier name" },
        { name: "email", type: "string", description: "Supplier email" },
        { name: "phone", type: "string", description: "Supplier phone" },
        { name: "userId", type: "string", description: "Owner user ID" },
        { name: "createdAt", type: "Date", description: "Creation timestamp" }
      ]
    },
    {
      name: "User",
      fields: [
        { name: "id", type: "string", description: "Unique identifier" },
        { name: "name", type: "string", description: "User's full name" },
        { name: "email", type: "string", description: "User's email address" },
        { name: "username", type: "string", description: "Unique username" },
        { name: "createdAt", type: "Date", description: "Account creation timestamp" }
      ]
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-green-100 text-green-800";
      case "POST": return "bg-blue-100 text-blue-800";
      case "PUT": return "bg-yellow-100 text-yellow-800";
      case "DELETE": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">Stockly API Documentation</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive API documentation for the Stockly inventory management system.
            All endpoints require authentication via JWT token.
          </p>
        </div>

        {/* Base URL */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiCode className="h-5 w-5" />
              Base URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <code className="bg-muted px-3 py-2 rounded text-sm font-mono">
              {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}
            </code>
          </CardContent>
        </Card>

        {/* Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiKey className="h-5 w-5" />
              Authentication
            </CardTitle>
            <CardDescription>
              All API endpoints require authentication. Include the session token in cookies or use the login endpoint to obtain a token.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">JWT Token Authentication</h4>
                <p className="text-sm text-muted-foreground">
                  Tokens are automatically handled via HTTP-only cookies. No manual token management required.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <div className="space-y-6">
          {endpoints.map((section) => (
            <Card key={section.name}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <section.icon className="h-5 w-5" />
                  {section.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {section.endpoints.map((endpoint, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                          {endpoint.path}
                        </code>
                      </div>
                      <p className="text-sm text-muted-foreground">{endpoint.description}</p>

                      {endpoint.parameters.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-sm mb-2">Parameters:</h5>
                          <div className="space-y-1">
                            {endpoint.parameters.map((param, paramIndex) => (
                              <div key={paramIndex} className="flex items-center gap-2 text-sm">
                                <code className="bg-muted px-2 py-1 rounded text-xs">
                                  {param.name}
                                </code>
                                <span className="text-muted-foreground">({param.type})</span>
                                {param.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                                <span className="text-muted-foreground">- {param.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h5 className="font-semibold text-sm mb-2">Response:</h5>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800">Success</Badge>
                            <span className="text-sm">Status: {endpoint.response.success.status}</span>
                          </div>
                          <code className="bg-muted px-2 py-1 rounded text-xs font-mono block">
                            {endpoint.response.success.data}
                          </code>

                          <div className="flex items-center gap-2">
                            <Badge className="bg-red-100 text-red-800">Error</Badge>
                            <span className="text-sm">Status: {endpoint.response.error.status}</span>
                          </div>
                          <code className="bg-muted px-2 py-1 rounded text-xs font-mono block">
                            {endpoint.response.error.data}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Data Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiDatabase className="h-5 w-5" />
              Data Types
            </CardTitle>
            <CardDescription>
              Common data structures used throughout the API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dataTypes.map((type) => (
                <div key={type.name} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">{type.name}</h4>
                  <div className="space-y-2">
                    {type.fields.map((field, fieldIndex) => (
                      <div key={fieldIndex} className="flex items-center gap-3 text-sm">
                        <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                          {field.name}
                        </code>
                        <span className="text-muted-foreground">({field.type})</span>
                        <span className="text-muted-foreground">- {field.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error Codes */}
        <Card>
          <CardHeader>
            <CardTitle>Error Codes</CardTitle>
            <CardDescription>
              Common HTTP status codes and their meanings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">200</Badge>
                  <span className="text-sm">OK - Request successful</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">201</Badge>
                  <span className="text-sm">Created - Resource created successfully</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800">400</Badge>
                  <span className="text-sm">Bad Request - Invalid input</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800">401</Badge>
                  <span className="text-sm">Unauthorized - Authentication required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800">500</Badge>
                  <span className="text-sm">Internal Server Error</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
