// Database types for the Minh Phát e-commerce application

export interface Product {
  id: string;
  name: { en: string; vi: string };
  description: { en: string; vi: string };
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  weight?: string;
  origin?: string;
  harvestDate?: string;
  shelfLife?: string;
  nutrition?: any;
  organic: boolean;
  seasonal: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: { en: string; vi: string };
  description?: { en: string; vi: string };
  slug: string;
  image?: string;
  count: number;
  parentId?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Content {
  id: string;
  key: string;
  value: { en: string; vi: string };
  type: "text" | "html" | "markdown" | "json";
  section?: string;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Newsletter {
  id: string;
  email: string;
  name?: string;
  status: string;
  preferences?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  email: string;
  role: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminSession {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

// Request/Response types for API
export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface ContentResponse {
  content: Content[];
}

export interface CreateProductRequest {
  name: { en: string; vi: string };
  description: { en: string; vi: string };
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  inStock?: boolean;
  weight?: string;
  origin?: string;
  harvestDate?: string;
  shelfLife?: string;
  nutrition?: any;
  organic?: boolean;
  seasonal?: boolean;
  featured?: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface CreateCategoryRequest {
  name: { en: string; vi: string };
  description?: { en: string; vi: string };
  slug: string;
  image?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export interface CreateContentRequest {
  key: string;
  value: { en: string; vi: string };
  type: "text" | "html" | "markdown" | "json";
  section?: string;
  sortOrder?: number;
}

export interface UpdateContentRequest extends Partial<CreateContentRequest> {}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    username: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface AuthVerifyResponse {
  authenticated: boolean;
  user?: {
    id: string;
    username: string;
    name: string;
    email: string;
    role: string;
  };
}

// Store settings types
export interface StoreSettings {
  storeName: { en: string; vi: string };
  contactEmail: string;
  contactPhone: string;
  address: string;
  defaultLanguage: "en" | "vi";
  enableVietnamese: boolean;
  currencySymbol: string;
  currencyCode: string;
  darkMode: boolean;
  primaryColor: string;
  autoBackup: boolean;
}

export interface SettingsResponse {
  settings: StoreSettings | null;
}

export interface CheckoutItem {
  id: string;
  quantity: number;
}

export interface CheckoutRequest {
  items: CheckoutItem[];
  paymentMethod: "cod";
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address: string;
  };
}

export interface CheckoutResponse {
  orderId: string;
  status: "pending" | "confirmed";
}
