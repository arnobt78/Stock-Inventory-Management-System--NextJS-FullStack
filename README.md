# Stockly Inventory Management System - Next.js, Prisma, MongoDB Project

![Screenshot 2025-04-12 at 02 20 06](https://github.com/user-attachments/assets/7495dcfb-c7cb-44e6-a1ef-d82930a8ada7)
![Screenshot 2025-04-12 at 02 20 13](https://github.com/user-attachments/assets/02410f03-c85e-404d-a0fb-f30920d18a58)
![Screenshot 2025-04-12 at 02 21 23](https://github.com/user-attachments/assets/df56b22e-ebd6-4cd3-a1e7-4b960120d659)
![Screenshot 2025-04-12 at 02 21 52](https://github.com/user-attachments/assets/1875a91f-afa5-4dbe-a94d-2471de11cc19)
![Screenshot 2025-04-12 at 02 22 11](https://github.com/user-attachments/assets/03bed7d2-bc82-4994-aea1-0ccfae3ab967)
![Screenshot 2025-04-12 at 02 22 30](https://github.com/user-attachments/assets/e75294a7-72f0-480f-932a-8e63bccbc89b)
![Screenshot 2025-04-12 at 02 23 19](https://github.com/user-attachments/assets/588a7017-8aca-417f-be6c-096f986c20e2)
![Screenshot 2025-04-12 at 02 23 28](https://github.com/user-attachments/assets/86addcb3-1fd6-48d9-9ed5-eb9d2cf5db96)
![Screenshot 2025-04-12 at 02 23 45](https://github.com/user-attachments/assets/090c832e-5456-4dd0-9c2f-dddb18f1dc9d)

---

Efficiently manage your product inventory with Stockly—a modern, secure, and responsive inventory management web application built with Next.js, React, Prisma, and MongoDB.

- **Live-Demo:** [https://stockly-inventory.vercel.app/](https://stockly-inventory.vercel.app/)

---

## Project Overview

Stockly is designed to help businesses and individuals efficiently manage their product inventory. It provides a robust, full-stack solution with secure authentication, CRUD operations, filtering, sorting, and a beautiful UI powered by shadcn/ui and Tailwind CSS. The project is open source and intended for learning, extension, and real-world use.

---

## Features

- **Product Management:** List, add, edit, and delete products with details (name, SKU, status, quantity, price, supplier, category).
- **Filtering & Sorting:** Filter by status, category, supplier; search by name/SKU; sort by name, price, quantity.
- **Category & Supplier Management:** Manage product categories and suppliers with CRUD operations.
- **Authentication:** Secure login/registration with JWT, password hashing (bcrypt), session management via cookies.
- **Responsive Design:** Works seamlessly on desktops, tablets, and mobile devices.
- **API Integration:** RESTful APIs for products, categories, suppliers, and authentication.
- **Database:** MongoDB with Prisma ORM for schema management and queries.
- **Security:** JWT-based authentication, password hashing, middleware for route protection.
- **Reusable Components:** Built with shadcn/ui and custom hooks for easy reuse and extension.

---

## Technology Stack

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API routes, Prisma ORM
- **Database:** MongoDB (via Prisma)
- **Authentication:** Custom JWT, bcrypt
- **State Management:** React Context, custom hooks
- **Other:** Axios, js-cookie

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/arnobt78/Stock-Inventory-Managment--NextJS.git
cd Stock-Inventory-Managment--NextJS
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

- **DATABASE_URL:** Get your MongoDB connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or your own MongoDB server.
- **JWT_SECRET:** Generate a strong random string (e.g., using [1Password password generator](https://1password.com/password-generator/)).

**Never commit your .env file or secrets to version control!**

---

## Project Structure

```bash
├── app/
│   ├── layout.tsx           # Root layout and metadata
│   ├── page.tsx             # Home page
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   ├── Products/            # Product table, columns, dropdowns
│   ├── AppHeader/           # Header and theme toggle
│   ├── AppTable/            # Main product table and dialogs
│   ├── fonts/               # Custom fonts
│   └── ...
├── components/
│   ├── ui/                  # shadcn/ui components (button, card, dialog, etc.)
│   ├── GlobalLoading.tsx    # Global loading indicator
│   └── ...
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions
├── middleware/              # Custom API middleware
├── pages/
│   └── api/                 # API routes (auth, products, categories, suppliers)
├── prisma/
│   ├── schema.prisma        # Prisma schema
│   ├── client.ts            # Prisma client
│   └── ...
├── public/                  # Static assets (icons, images)
├── types/                   # TypeScript type definitions
├── utils/                   # Auth, axios instance, etc.
├── .env                     # Environment variables (not committed)
├── README.md                # Project documentation
└── ...
```

---

## API Endpoints

All API endpoints are under `/api/` and require authentication (except login/register).

### Auth

- `POST /api/auth/login` — Login with email and password
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/logout` — Logout (clears session)
- `GET /api/auth/session` — Get current user session

### Products

- `GET /api/products` — List all products for the user
- `POST /api/products` — Add a new product
- `PUT /api/products` — Update a product
- `DELETE /api/products` — Delete a product

### Categories

- `GET /api/categories` — List all categories
- `POST /api/categories` — Add a new category
- `PUT /api/categories` — Update a category
- `DELETE /api/categories` — Delete a category

### Suppliers

- `GET /api/suppliers` — List all suppliers
- `POST /api/suppliers` — Add a new supplier
- `PUT /api/suppliers` — Update a supplier
- `DELETE /api/suppliers` — Delete a supplier

---

## How It Works

1. **Authentication:**

- Users register and login with email/password.
- Passwords are hashed with bcrypt.
- On login, a JWT is issued and stored in a secure cookie (`session_id`).
- All protected API routes check the JWT for authentication.

2. **Product Management:**

- Authenticated users can add, edit, delete, and view products.
- Products are linked to categories and suppliers.
- Filtering, searching, and sorting are available in the UI.

3. **Category & Supplier Management:**

- Users can manage categories and suppliers for their products.

4. **UI & Components:**

- Built with shadcn/ui and Tailwind CSS for a modern, responsive look.
- All UI elements are reusable and customizable.

---

## Reusable Components & Usage

### Example: Using a Button from shadcn/ui

```tsx
import { Button } from "@/components/ui/button";

export default function MyComponent() {
  return <Button variant="primary">Click Me</Button>;
}
```

### Example: Product Table

```tsx
import { ProductTable } from "@/app/Products/ProductTable";

export default function ProductsPage() {
  return <ProductTable />;
}
```

### Custom Hooks

Use `useProductStore`, `useAuth`, and other hooks for state management and authentication.

---

## Keywords

Stockly, Inventory Management, Next.js, React, Prisma, MongoDB, Product Management, JWT, Authentication, CRUD, Responsive Web App, shadcn/ui, Tailwind CSS, Arnob Mahmud

---

## Conclusion

Stockly is a full-featured, modern inventory management system built for learning, extension, and real-world use. Its modular architecture, secure authentication, and beautiful UI make it a great starting point for your own projects or for contributing to open source.

---

## Happy Coding! 🎉

Feel free to use this project repository and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://arnob-mahmud.vercel.app/](https://arnob-mahmud.vercel.app/).

**Enjoy building and learning!** 🚀

Thank you! 😊

---
