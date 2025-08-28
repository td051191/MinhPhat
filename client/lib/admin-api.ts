import {
  Product,
  Category,
  Content,
  ProductsResponse,
  CategoriesResponse,
  ContentResponse,
  CreateProductRequest,
  UpdateProductRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateContentRequest,
  UpdateContentRequest,
} from "@shared/api";

const API_BASE = "/api";

// Admin API headers
const adminHeaders = {
  "Content-Type": "application/json",
  "x-admin": "true",
};

const adminFetchOptions = {
  credentials: "include" as RequestCredentials,
};

// Admin Products API
export const adminProductsApi = {
  getAll: async (params?: {
    category?: string;
    featured?: boolean;
    organic?: boolean;
    seasonal?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ProductsResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.category) searchParams.set("category", params.category);
    if (params?.featured) searchParams.set("featured", "true");
    if (params?.organic) searchParams.set("organic", "true");
    if (params?.seasonal) searchParams.set("seasonal", "true");
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);

    const response = await fetch(`${API_BASE}/products?${searchParams}`, {
      headers: { "x-admin": "true" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch products");
    return response.json();
  },

  getById: async (id: string): Promise<Product> => {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      headers: { "x-admin": "true" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch product");
    return response.json();
  },

  create: async (data: CreateProductRequest): Promise<Product> => {
    const response = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: adminHeaders,
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create product");
    }
    return response.json();
  },

  update: async (
    id: string,
    data: Partial<UpdateProductRequest>,
  ): Promise<Product> => {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: "PUT",
      headers: adminHeaders,
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update product");
    }
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: "DELETE",
      headers: { "x-admin": "true" },
      credentials: "include",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete product");
    }
  },
};

// Admin Categories API
export const adminCategoriesApi = {
  getAll: async (): Promise<CategoriesResponse> => {
    const response = await fetch(`${API_BASE}/categories`, {
      headers: { "x-admin": "true" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch categories");
    return response.json();
  },

  getById: async (id: string): Promise<Category> => {
    const response = await fetch(`${API_BASE}/categories/${id}`, {
      headers: { "x-admin": "true" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch category");
    return response.json();
  },

  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await fetch(`${API_BASE}/categories`, {
      method: "POST",
      headers: adminHeaders,
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create category");
    }
    return response.json();
  },

  update: async (
    id: string,
    data: Partial<UpdateCategoryRequest>,
  ): Promise<Category> => {
    const response = await fetch(`${API_BASE}/categories/${id}`, {
      method: "PUT",
      headers: adminHeaders,
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update category");
    }
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/categories/${id}`, {
      method: "DELETE",
      headers: { "x-admin": "true" },
      credentials: "include",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete category");
    }
  },
};

// Admin Content API
export const adminContentApi = {
  getAll: async (params?: {
    section?: string;
    key?: string;
  }): Promise<ContentResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.section) searchParams.set("section", params.section);
    if (params?.key) searchParams.set("key", params.key);

    const response = await fetch(`${API_BASE}/content?${searchParams}`, {
      headers: { "x-admin": "true" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch content");
    return response.json();
  },

  getById: async (id: string): Promise<Content> => {
    const response = await fetch(`${API_BASE}/content/${id}`, {
      headers: { "x-admin": "true" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch content");
    return response.json();
  },

  create: async (data: CreateContentRequest): Promise<Content> => {
    const response = await fetch(`${API_BASE}/content`, {
      method: "POST",
      headers: adminHeaders,
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create content");
    }
    return response.json();
  },

  update: async (
    id: string,
    data: Partial<UpdateContentRequest>,
  ): Promise<Content> => {
    const response = await fetch(`${API_BASE}/content/${id}`, {
      method: "PUT",
      headers: adminHeaders,
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update content");
    }
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/content/${id}`, {
      method: "DELETE",
      headers: { "x-admin": "true" },
      credentials: "include",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete content");
    }
  },
};

// Admin Export API
export const adminExportApi = {
  exportData: async (): Promise<Blob> => {
    const response = await fetch(`${API_BASE}/export`, {
      headers: { "x-admin": "true" },
      credentials: "include",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to export data");
    }
    return response.blob();
  },
};

// Admin Settings API
export const adminSettingsApi = {
  get: async () => {
    const response = await fetch(`${API_BASE}/settings`, {
      headers: { "x-admin": "true" },
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  },
  update: async (settings: import("@shared/database").StoreSettings) => {
    const response = await fetch(`${API_BASE}/settings`, {
      method: "PUT",
      headers: adminHeaders,
      credentials: "include",
      body: JSON.stringify({ settings }),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  },
};
