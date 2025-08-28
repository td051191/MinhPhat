import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
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
import {
  getStoreSettings,
  updateStoreSettings,
  getPublicSettings,
} from "./routes/settings";
import { checkout } from "./routes/checkout";

export function createServer() {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS: restrict in production
  const corsOrigin = process.env.CORS_ORIGIN || true;
  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // Basic rate limiting for auth and checkout
  const loginLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 20 });
  const checkoutLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 100 });

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
  app.post("/api/auth/login", loginLimiter, login);
  app.post("/api/auth/logout", logout);
  app.get("/api/auth/verify", verify);

  // Export API
  app.get("/api/export", requireAuth, exportData);

  // Settings API
  app.get("/api/settings", requireAuth, getStoreSettings);
  app.put("/api/settings", requireAuth, updateStoreSettings);
  app.get("/api/public-settings", getPublicSettings);

  // Checkout API (public)
  app.post("/api/checkout", checkoutLimiter, checkout);

  return app;
}
