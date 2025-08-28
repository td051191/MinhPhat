import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { handleDemo } from "./routes/demo";

// Import new database API routes
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
} from "./routes/products";

import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./routes/categories";

import {
  getContent,
  getContentById,
  getContentByKey,
  getContentBySection,
  createContent,
  updateContent,
  deleteContent,
  subscribeNewsletter,
} from "./routes/content";

import { login, logout, verify, requireAuth } from "./routes/auth";
import { exportData } from "./routes/export";
import { getStoreSettings, updateStoreSettings } from "./routes/settings";

export function createServer() {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Legacy API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Products API routes (specific routes before parameterized ones)
  app.get("/api/products/category/:categoryId", getProductsByCategory);
  app.get("/api/products", getProducts);
  app.get("/api/products/:id", getProductById);
  app.post("/api/products", requireAuth, createProduct);
  app.put("/api/products/:id", requireAuth, updateProduct);
  app.delete("/api/products/:id", requireAuth, deleteProduct);

  // Categories API routes (specific routes before parameterized ones)
  app.get("/api/categories/slug/:slug", getCategoryBySlug);
  app.get("/api/categories", getCategories);
  app.get("/api/categories/:id", getCategoryById);
  app.post("/api/categories", requireAuth, createCategory);
  app.put("/api/categories/:id", requireAuth, updateCategory);
  app.delete("/api/categories/:id", requireAuth, deleteCategory);

  // Content API routes (specific routes before parameterized ones)
  app.get("/api/content/key/:key", getContentByKey);
  app.get("/api/content/section/:section", getContentBySection);
  app.get("/api/content", getContent);
  app.get("/api/content/:id", getContentById);
  app.post("/api/content", requireAuth, createContent);
  app.put("/api/content/:id", requireAuth, updateContent);
  app.delete("/api/content/:id", requireAuth, deleteContent);

  // Newsletter API
  app.post("/api/newsletter/subscribe", subscribeNewsletter);

  // Authentication API
  app.post("/api/auth/login", login);
  app.post("/api/auth/logout", logout);
  app.get("/api/auth/verify", verify);

  // Export API
  app.get("/api/export", requireAuth, exportData);

  // Settings API
  app.get("/api/settings", requireAuth, getStoreSettings);
  app.put("/api/settings", requireAuth, updateStoreSettings);

  return app;
}
