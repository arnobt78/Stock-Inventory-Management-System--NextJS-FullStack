# Stockly Inventory Management System - Next.js, Prisma, MongoDB Project

<img width="870" height="524" alt="Screenshot 2025-09-01 at 16 22 30" src="https://github.com/user-attachments/assets/98e1bde0-f655-4d51-865e-a53bf79b227d" /> <img width="832" height="483" alt="Screenshot 2025-09-01 at 16 22 53" src="https://github.com/user-attachments/assets/d3ce05ba-8b69-4cf2-a43c-c83440145168" /> <img width="1823" height="826" alt="Screenshot 2025-09-01 at 16 26 05" src="https://github.com/user-attachments/assets/648495c3-5c84-45fa-acc7-3b6d81c6d1e8" /> <img width="1821" height="762" alt="Screenshot 2025-09-01 at 16 26 33" src="https://github.com/user-attachments/assets/8e3843cf-b7f2-4616-a5b0-e4863a3713db" /> <img width="1815" height="690" alt="Screenshot 2025-09-01 at 16 26 54" src="https://github.com/user-attachments/assets/c0119f93-e830-45ba-b6d7-6677fe8ec9d6" /> <img width="1823" height="667" alt="Screenshot 2025-09-01 at 16 27 07" src="https://github.com/user-attachments/assets/74478903-6be5-48f5-b163-dda28957ba1d" /> <img width="883" height="485" alt="Screenshot 2025-09-01 at 16 27 22" src="https://github.com/user-attachments/assets/0aa8e751-5672-4486-bca1-fe240f0531d3" /> <img width="882" height="469" alt="Screenshot 2025-09-01 at 16 27 32" src="https://github.com/user-attachments/assets/28932e68-6e8d-4b0c-8706-a5ac3f050e1b" /> <img width="882" height="467" alt="Screenshot 2025-09-01 at 16 27 41" src="https://github.com/user-attachments/assets/0b4d86f9-39e0-435d-b14e-8385d377c262" /> <img width="885" height="449" alt="Screenshot 2025-09-01 at 16 27 56" src="https://github.com/user-attachments/assets/3ee2c580-e478-4c72-9d04-b180e78964d0" /> <img width="1866" height="622" alt="Screenshot 2025-09-01 at 16 29 00" src="https://github.com/user-attachments/assets/12fe0408-1b90-4f3c-8c46-422615ca7c4c" /> <img width="1822" height="873" alt="Screenshot 2025-09-01 at 16 29 59" src="https://github.com/user-attachments/assets/3b94e1f9-3bba-4fe8-a736-c3d69e508bf3" /> <img width="1568" height="853" alt="Screenshot 2025-09-01 at 16 30 16" src="https://github.com/user-attachments/assets/a071a03c-a095-48d9-8c02-b8a07fb64cf1" /> <img width="1549" height="854" alt="Screenshot 2025-09-01 at 16 30 28" src="https://github.com/user-attachments/assets/0ede9db7-f390-4a4d-a7a5-6d681bd532b4" /> <img width="1822" height="876" alt="Screenshot 2025-09-01 at 16 31 17" src="https://github.com/user-attachments/assets/8996a920-d398-4618-989c-71ebe42e059d" /> <img width="1808" height="879" alt="Screenshot 2025-09-01 at 16 31 39" src="https://github.com/user-attachments/assets/24017eaf-4054-4334-b002-6c40103974ad" /> <img width="1524" height="845" alt="Screenshot 2025-09-01 at 16 31 58" src="https://github.com/user-attachments/assets/7c476153-27b1-47c1-8601-ec027dadcb9c" />

---

Efficiently manage your product inventory with Stockly—a modern, secure, and responsive inventory management web application built with Next.js, React, Prisma, and MongoDB.

- **Live-Demo:** [https://stockly-inventory.vercel.app/](https://stockly-inventory.vercel.app/)

---

## Project Overview

Stockly is designed to help businesses and individuals efficiently manage their product inventory. It provides a robust, full-stack solution with secure authentication, CRUD operations, filtering, sorting, analytics dashboard, QR code generation, data export capabilities, and a beautiful UI powered by shadcn/ui and Tailwind CSS. The project is open source and intended for learning, extension, and real-world use.

---

## 🚀 Features

### Core Functionality

- **Product Management**: Complete CRUD operations for products with SKU tracking
- **Category Management**: Organize products with custom categories
- **Supplier Management**: Track and manage product suppliers
- **Real-time Search**: Instant filtering by product name or SKU
- **Advanced Filtering**: Filter by category, supplier, and status
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes with system preference detection

### Advanced Features

- **📊 Analytics Dashboard**: Comprehensive business insights with charts and metrics
- **📈 Data Visualization**: Interactive charts showing inventory trends and statistics
- **🔍 Advanced Search**: Enhanced search with multiple filter options
- **📱 QR Code Generation**: Generate QR codes for products with click-to-view functionality
- **📄 Data Export**: Export product data to CSV and Excel formats
- **📚 API Documentation**: Built-in API documentation page with endpoint details
- **🔧 API Status Monitor**: Real-time API health monitoring and status dashboard
- **⚠️ Low Stock Alerts**: Visual alerts for products with low inventory
- **📊 Performance Optimizations**: React memoization, lazy loading, and caching

### Authentication & Security

- **JWT Authentication**: Secure token-based authentication
- **User Registration**: Secure account creation with password hashing
- **Session Management**: Persistent login sessions with automatic token refresh
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Password Security**: bcryptjs hashing for secure password storage

### User Experience

- **Loading States**: Visual feedback during all operations
- **Toast Notifications**: Success/error messages for all user actions
- **Form Validation**: Client-side validation with error handling
- **Accessibility**: ARIA-compliant components for screen readers
- **Keyboard Navigation**: Full keyboard accessibility support
- **Consistent Navigation**: AppHeader displayed on all authenticated pages

---

## 🛠️ Technology Stack

### Frontend

- **Next.js 15.0.3**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Modern component library
- **Zustand**: Lightweight state management
- **React Hook Form**: Form handling with validation
- **React Table**: Advanced table functionality
- **Recharts**: Data visualization and charting library
- **QRCode**: QR code generation library
- **Papaparse**: CSV parsing and generation
- **XLSX**: Excel file generation

### Backend

- **Next.js API Routes**: Server-side API endpoints
- **Prisma ORM**: Type-safe database operations
- **MongoDB**: NoSQL database
- **JWT**: JSON Web Token authentication
- **bcryptjs**: Password hashing
- **Axios**: HTTP client for API requests

### Development Tools

- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing
- **TypeScript**: Static type checking

---

## 📁 Project Structure

```bash
stockly/
├── app/                          # Next.js App Router
│   ├── AppHeader/                # Application header component
│   │   ├── AppHeader.tsx         # Main header with theme toggle
│   │   └── ModeToggle.tsx       # Dark/light theme toggle
│   ├── AppTable/                 # Main table component
│   │   ├── AppTable.tsx          # Main table wrapper
│   │   ├── dropdowns/            # Filter dropdowns
│   │   │   ├── CategoryDropDown.tsx
│   │   │   ├── StatusDropDown.tsx
│   │   │   └── SupplierDropDown.tsx
│   │   └── ProductDialog/        # Product management dialogs
│   │       ├── AddProductDialog.tsx
│   │       ├── AddCategoryDialog.tsx
│   │       ├── AddSupplierDialog.tsx
│   │       └── _components/      # Dialog sub-components
│   ├── Products/                 # Product-related components
│   │   ├── ProductTable.tsx      # Main product table
│   │   ├── columns.tsx           # Table column definitions
│   │   ├── ProductsDropDown.tsx  # Product action dropdown
│   │   └── PaginationSelection.tsx
│   ├── analytics/                # Analytics dashboard
│   │   └── page.tsx              # Analytics page with charts
│   ├── api-docs/                 # API documentation
│   │   └── page.tsx              # API docs page
│   ├── api-status/               # API status monitoring
│   │   └── page.tsx              # API status page
│   ├── login/                    # Authentication pages
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── logout/
│   │   └── page.tsx
│   ├── authContext.tsx           # Authentication context
│   ├── useProductStore.ts        # Zustand store for state management
│   ├── types.ts                  # TypeScript type definitions
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main page
│   └── Home.tsx                  # Home component
├── components/                   # Reusable UI components
│   ├── ui/                       # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── toast.tsx
│   │   ├── qr-code.tsx           # QR code component
│   │   ├── qr-code-hover.tsx     # QR code hover component
│   │   ├── analytics-card.tsx    # Analytics metrics card
│   │   ├── chart-card.tsx        # Chart wrapper component
│   │   ├── advanced-search.tsx  # Advanced search component
│   │   ├── forecasting-card.tsx  # Forecasting insights card
│   │   └── progress.tsx          # Progress bar component
│   ├── GlobalLoading.tsx         # Global loading component
│   ├── Loading.tsx               # Loading spinner
│   └── Skeleton.tsx              # Skeleton loading
├── pages/                        # API routes
│   └── api/
│       ├── auth/                 # Authentication endpoints
│       │   ├── login.ts
│       │   ├── register.ts
│       │   ├── logout.ts
│       │   └── session.ts
│       ├── products/             # Product management
│       │   └── index.ts
│       ├── categories/           # Category management
│       │   └── index.ts
│       └── suppliers/            # Supplier management
│           └── index.ts
├── prisma/                       # Database schema and client
│   ├── schema.prisma             # Database schema
│   ├── client.ts                 # Prisma client
│   ├── product.ts                # Product operations
│   ├── category.ts               # Category operations
│   └── supplier.ts               # Supplier operations
├── utils/                        # Utility functions
│   ├── auth.ts                   # Authentication utilities
│   └── axiosInstance.ts          # Axios configuration
├── hooks/                        # Custom React hooks
│   └── use-toast.ts              # Toast hook
├── middleware/                   # Next.js middleware
│   └── authMiddleware.ts         # Authentication middleware
├── middleware.ts                 # Route protection middleware
└── public/                       # Static assets
    ├── favicon.ico
    └── ...                       # Other static files
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm** or **yarn**: Package manager
- **MongoDB**: Database (local or cloud instance)
- **Git**: Version control

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/stockly.git
   cd stockly
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**

   Create a `.env` file in the root directory:

   ```env
   # Database Configuration
   # DATABASE_URL="mongodb://localhost:27017/stockly"
   # or for MongoDB Atlas:
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/stockly?retryWrites=true&w=majority"

   # JWT Configuration
   JWT_SECRET="your-super-secret-jwt-key-here"
   # JWT_EXPIRES_IN="1h"

   # Application Configuration (Optional)
   # NEXTAUTH_URL="http://localhost:3000"
   # NEXTAUTH_SECRET="your-nextauth-secret"
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Push schema to database
   npx prisma db push

   # (Optional) View database in Prisma Studio
   npx prisma studio
   ```

5. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔧 Environment Variables

### Required Variables

| Variable         | Description               | Example                             |
| ---------------- | ------------------------- | ----------------------------------- |
| `DATABASE_URL`   | MongoDB connection string | `mongodb://localhost:27017/stockly` |
| `JWT_SECRET`     | Secret key for JWT tokens | `your-super-secret-jwt-key-here`    |
| `JWT_EXPIRES_IN` | JWT token expiration time | `1h`                                |

### Optional Variables

| Variable          | Description        | Default                 |
| ----------------- | ------------------ | ----------------------- |
| `NEXTAUTH_URL`    | NextAuth.js URL    | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth.js secret | Auto-generated          |

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Replace `username`, `password`, and `cluster` with your values
5. Add the connection string to your `.env` file

---

## 📊 Database Schema

### User Model

```prisma
model User {
  id        String    @id @default(auto()) @map("_id") @db.ObjectId
  createdAt DateTime  @db.Date
  email     String    @unique
  name      String
  password  String
  updatedAt DateTime? @db.Date
  username  String?   @unique
}
```

### Product Model

```prisma
model Product {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  categoryId String   @db.ObjectId
  createdAt  DateTime @db.Date
  name       String
  price      Float
  quantity   BigInt
  sku        String   @unique
  status     String
  supplierId String   @db.ObjectId
  userId     String   @db.ObjectId
}
```

### Category Model

```prisma
model Category {
  id     String @id @default(auto()) @map("_id") @db.ObjectId
  name   String
  userId String @db.ObjectId
}
```

### Supplier Model

```prisma
model Supplier {
  id     String @id @default(auto()) @map("_id") @db.ObjectId
  name   String
  userId String @db.ObjectId
}
```

---

## 🔌 API Endpoints

### Authentication Endpoints

#### POST `/api/auth/register`

Register a new user account.

```typescript
// Request Body
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

// Response
{
  "success": true,
  "message": "User registered successfully"
}
```

#### POST `/api/auth/login`

Authenticate user and get JWT token.

```typescript
// Request Body
{
  "email": "john@example.com",
  "password": "securepassword123"
}

// Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST `/api/auth/logout`

Logout user and invalidate session.

```typescript
// Response
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET `/api/auth/session`

Get current user session information.

```typescript
// Response
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Product Management Endpoints

#### GET `/api/products`

Get all products for the authenticated user.

```typescript
// Response
[
  {
    id: "507f1f77bcf86cd799439011",
    name: "Laptop",
    sku: "LAP001",
    price: 999.99,
    quantity: 10,
    status: "Available",
    category: "Electronics",
    supplier: "TechCorp",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];
```

#### POST `/api/products`

Create a new product.

```typescript
// Request Body
{
  "name": "Laptop",
  "sku": "LAP001",
  "price": 999.99,
  "quantity": 10,
  "status": "Available",
  "categoryId": "507f1f77bcf86cd799439011",
  "supplierId": "507f1f77bcf86cd799439012"
}

// Response
{
  "id": "507f1f77bcf86cd799439013",
  "name": "Laptop",
  "sku": "LAP001",
  "price": 999.99,
  "quantity": 10,
  "status": "Available",
  "category": "Electronics",
  "supplier": "TechCorp",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### PUT `/api/products`

Update an existing product.

```typescript
// Request Body
{
  "id": "507f1f77bcf86cd799439013",
  "name": "Updated Laptop",
  "sku": "LAP001",
  "price": 1099.99,
  "quantity": 15,
  "status": "Available",
  "categoryId": "507f1f77bcf86cd799439011",
  "supplierId": "507f1f77bcf86cd799439012"
}
```

#### DELETE `/api/products`

Delete a product.

```typescript
// Request Body
{
  "id": "507f1f77bcf86cd799439013"
}

// Response
204 No Content
```

### Category Management Endpoints

#### GET `/api/categories`

Get all categories for the authenticated user.

#### POST `/api/categories`

Create a new category.

#### PUT `/api/categories`

Update an existing category.

#### DELETE `/api/categories`

Delete a category.

### Supplier Management Endpoints

#### GET `/api/suppliers`

Get all suppliers for the authenticated user.

#### POST `/api/suppliers`

Create a new supplier.

#### PUT `/api/suppliers`

Update an existing supplier.

#### DELETE `/api/suppliers`

Delete a supplier.

---

## 🎨 Component Architecture

### State Management with Zustand

The application uses Zustand for state management, providing a simple and efficient way to manage global state.

```typescript
// Example: Product Store
interface ProductState {
  allProducts: Product[];
  categories: Category[];
  suppliers: Supplier[];
  isLoading: boolean;
  loadProducts: () => Promise<void>;
  addProduct: (product: Product) => Promise<{ success: boolean }>;
  updateProduct: (product: Product) => Promise<{ success: boolean }>;
  deleteProduct: (id: string) => Promise<{ success: boolean }>;
}

export const useProductStore = create<ProductState>((set) => ({
  allProducts: [],
  categories: [],
  suppliers: [],
  isLoading: false,

  loadProducts: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get("/products");
      set({ allProducts: response.data || [] });
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  // ... other methods
}));
```

### Authentication Context

The authentication context provides user state and authentication methods throughout the application.

```typescript
// Example: Auth Context Usage
const { isLoggedIn, user, login, logout } = useAuth();

// Protected route example
useEffect(() => {
  if (!isLoggedIn) {
    router.push("/login");
  }
}, [isLoggedIn, router]);
```

### Reusable Components

#### Dialog Components

All dialogs follow a consistent pattern with proper accessibility attributes:

```typescript
// Example: Product Dialog
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent aria-describedby="product-dialog-description">
    <DialogHeader>
      <DialogTitle>Add Product</DialogTitle>
    </DialogHeader>
    <DialogDescription id="product-dialog-description">
      Fill in the product details below.
    </DialogDescription>
    {/* Form content */}
  </DialogContent>
</Dialog>
```

#### Table Components

The product table uses React Table for advanced functionality:

```typescript
// Example: Table Column Definition
const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  // ... other columns
];
```

#### QR Code Component

QR code generation with click-to-view functionality:

```typescript
// Example: QR Code Usage
<QRCodeHover
  value={`Product: ${product.name}\nSKU: ${product.sku}\nPrice: $${product.price}`}
  title="View QR Code"
/>
```

#### Analytics Components

Reusable analytics cards and charts:

```typescript
// Example: Analytics Card
<AnalyticsCard
  title="Total Products"
  value={totalProducts}
  description="Total products in inventory"
  icon={<Package className="h-4 w-4" />}
/>
```

---

## 🔒 Security Features

### JWT Authentication

- Secure token-based authentication
- Automatic token refresh
- Protected API routes
- Session management

### Password Security

- bcryptjs hashing for passwords
- Secure password validation
- No plain text password storage

### API Security

- Request validation
- Error handling without sensitive data exposure
- CORS protection
- Rate limiting (can be implemented)

### Data Validation

- Client-side form validation
- Server-side data validation
- TypeScript type safety
- Prisma schema validation

---

## 🎯 Key Features Implementation

### Real-time Search

The search functionality filters products instantly as users type:

```typescript
// Search implementation in ProductTable.tsx
const filteredData = useMemo(() => {
  return data.filter((product) => {
    const searchMatch = searchTerm
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    return searchMatch && categoryFilter && supplierFilter && statusFilter;
  });
}, [data, searchTerm, categoryFilter, supplierFilter, statusFilter]);
```

### Toast Notifications

Consistent user feedback with toast notifications:

```typescript
// Example: Success toast
toast({
  title: "Success!",
  description: "Product created successfully.",
  variant: "default",
});

// Example: Error toast
toast({
  title: "Error",
  description: "Failed to create product. Please try again.",
  variant: "destructive",
});
```

### Loading States

Visual feedback during async operations:

```typescript
// Example: Button loading state
<Button disabled={isLoading}>
  {isLoading ? "Creating..." : "Create Product"}
</Button>
```

### Theme Toggle

Dark/light theme with system preference detection:

```typescript
// Theme toggle implementation
const { theme, setTheme } = useTheme();

const toggleTheme = () => {
  setTheme(theme === "dark" ? "light" : "dark");
};
```

### Data Export

CSV and Excel export functionality:

```typescript
// Example: Export to CSV
const exportToCSV = () => {
  const csv = Papa.unparse(filteredProducts);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "products.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

### Analytics Dashboard

Comprehensive business insights with charts:

```typescript
// Example: Analytics implementation
const analyticsData = useMemo(() => {
  return {
    totalProducts: products.length,
    totalValue: products.reduce(
      (sum, p) => sum + p.price * Number(p.quantity),
      0
    ),
    lowStockItems: products.filter((p) => Number(p.quantity) < 10).length,
    categories: categoryStats,
    monthlyTrends: monthlyData,
  };
}, [products]);
```

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect your GitHub repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

### Environment Variables for Production

```env
DATABASE_URL="your-production-mongodb-url"
JWT_SECRET="your-production-jwt-secret"
```

### Build Commands

```bash
# Build the application
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Product CRUD operations
- [ ] Category management
- [ ] Supplier management
- [ ] Search and filtering
- [ ] Theme toggle
- [ ] Responsive design
- [ ] Form validation
- [ ] Error handling
- [ ] Loading states
- [ ] Analytics dashboard
- [ ] QR code generation
- [ ] Data export (CSV/Excel)
- [ ] API documentation page
- [ ] API status monitoring

### Automated Testing (Future Enhancement)

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

---

## 🔧 Customization

### Adding New Features

1. **Create new API endpoints** in `pages/api/`
2. **Add new Prisma models** in `schema.prisma`
3. **Create new components** in `components/`
4. **Update state management** in `useProductStore.ts`
5. **Add new routes** in `app/`

### Styling Customization

The application uses Tailwind CSS with custom design tokens:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... other custom colors
      },
    },
  },
};
```

### Component Customization

All UI components are built with Shadcn/ui and can be customized:

```bash
# Add new Shadcn/ui components
npx shadcn@latest add [component-name]
```

---

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check database connection
npx prisma db pull

# Reset database (development only)
npx prisma db push --force-reset
```

#### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Authentication Issues

- Check JWT_SECRET environment variable
- Verify database connection
- Check user credentials in database

#### Performance Issues

- Enable Next.js production mode
- Optimize images and assets
- Use proper caching strategies

#### QR Code Issues

- Ensure QR code library is properly installed
- Check for hydration mismatches in development
- Verify client-side rendering for dynamic content

---

## 📚 Learning Resources

### Next.js

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [API Routes](https://nextjs.org/docs/api-routes/introduction)

### React

- [React Documentation](https://react.dev/)
- [React Hooks](https://react.dev/reference/react)
- [React Patterns](https://reactpatterns.com/)

### Prisma

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma with MongoDB](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)

### Zustand

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Zustand Best Practices](https://github.com/pmndrs/zustand#best-practices)

### Tailwind CSS

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS Components](https://tailwindui.com/)

### Data Visualization

- [Recharts Documentation](https://recharts.org/)
- [Chart.js](https://www.chartjs.org/)

### QR Code Generation

- [QRCode Library](https://github.com/zpao/qrcode.react)

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes**

   ```bash
   git commit -m "feat: add new feature"
   ```

6. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a pull request**

### Code Style Guidelines

- Use TypeScript for type safety
- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Vercel** for hosting and deployment
- **Prisma Team** for the excellent ORM
- **Shadcn/ui** for the beautiful components
- **Tailwind CSS** for the utility-first CSS framework
- **Recharts** for the data visualization library

---

## 📞 Support

If you encounter any issues or have questions:

1. **Check the troubleshooting section**
2. **Search existing issues**
3. **Create a new issue** with detailed information
4. **Contact the maintainer**

---

## 🎯 Roadmap

### Planned Features

- [ ] User roles and permissions
- [ ] Advanced reporting and analytics
- [ ] Bulk import/export functionality
- [ ] Email notifications
- [ ] Mobile app
- [ ] API rate limiting
- [ ] Advanced search filters
- [ ] Product images
- [ ] Inventory alerts
- [ ] Audit logs
- [ ] Real-time notifications
- [ ] Advanced forecasting algorithms
- [ ] Multi-language support
- [ ] Advanced user preferences

### Performance Improvements

- [ ] Database indexing optimization
- [ ] Caching strategies
- [ ] Code splitting
- [ ] Image optimization
- [ ] Bundle size optimization
- [ ] Server-side rendering improvements
- [ ] Progressive Web App (PWA) features

---

## 📊 Project Statistics

- **Lines of Code**: ~8,000+
- **Components**: 30+
- **API Endpoints**: 12+
- **Database Models**: 4
- **Dependencies**: 40+
- **Pages**: 8+
- **Features**: 20+

---

## 🏆 Features Summary

| Feature                   | Status      | Description                            |
| ------------------------- | ----------- | -------------------------------------- |
| User Authentication       | ✅ Complete | JWT-based auth with registration/login |
| Product Management        | ✅ Complete | Full CRUD with search and filtering    |
| Category Management       | ✅ Complete | Create, edit, delete categories        |
| Supplier Management       | ✅ Complete | Manage product suppliers               |
| Responsive Design         | ✅ Complete | Mobile-first design                    |
| Dark/Light Theme          | ✅ Complete | Theme toggle with system preference    |
| Real-time Search          | ✅ Complete | Instant product filtering              |
| Toast Notifications       | ✅ Complete | User feedback system                   |
| Loading States            | ✅ Complete | Visual feedback during operations      |
| Form Validation           | ✅ Complete | Client and server-side validation      |
| Accessibility             | ✅ Complete | ARIA-compliant components              |
| TypeScript                | ✅ Complete | Full type safety                       |
| Database Integration      | ✅ Complete | MongoDB with Prisma ORM                |
| API Security              | ✅ Complete | Protected routes and validation        |
| Analytics Dashboard       | ✅ Complete | Business insights with charts          |
| QR Code Generation        | ✅ Complete | Product QR codes with click-to-view    |
| Data Export               | ✅ Complete | CSV and Excel export functionality     |
| API Documentation         | ✅ Complete | Built-in API docs page                 |
| API Status Monitor        | ✅ Complete | Real-time API health monitoring        |
| Performance Optimizations | ✅ Complete | React memoization and caching          |
| Low Stock Alerts          | ✅ Complete | Visual alerts for low inventory        |
| Advanced Search           | ✅ Complete | Enhanced search with multiple filters  |

---

## 🎉 Happy Coding! 🎉

Feel free to use this project repository and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://arnob-mahmud.vercel.app/](https://arnob-mahmud.vercel.app/).

**Enjoy building and learning!** 🚀

Thank you! 😊
