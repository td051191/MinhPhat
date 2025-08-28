import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  Product,
  Category,
  Content,
  Newsletter,
  AdminUser,
  AdminSession,
} from "@shared/database";

class SQLiteDatabase {
  private db: sqlite3.Database;

  constructor(dbPath: string = "data/database.sqlite") {
    // Ensure the data directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Error opening database:", err);
      } else {
        console.log("Connected to SQLite database");
        this.initializeDatabase();
      }
    });
  }

  private async initializeDatabase() {
    try {
      // Create tables directly instead of reading schema file
      await this.createTables();
      await this.seedData();
    } catch (error) {
      console.error("Database initialization error:", error);
    }
  }

  private async createTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name_en TEXT NOT NULL,
          name_vi TEXT NOT NULL,
          description_en TEXT NOT NULL,
          description_vi TEXT NOT NULL,
          price REAL NOT NULL,
          original_price REAL,
          image TEXT NOT NULL,
          images TEXT,
          category TEXT NOT NULL,
          in_stock BOOLEAN DEFAULT TRUE,
          rating REAL DEFAULT 0,
          reviews_count INTEGER DEFAULT 0,
          weight TEXT,
          origin TEXT,
          harvest_date TEXT,
          shelf_life TEXT,
          nutrition TEXT,
          organic BOOLEAN DEFAULT FALSE,
          seasonal BOOLEAN DEFAULT FALSE,
          featured BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name_en TEXT NOT NULL,
          name_vi TEXT NOT NULL,
          description_en TEXT,
          description_vi TEXT,
          slug TEXT UNIQUE NOT NULL,
          image TEXT,
          count INTEGER DEFAULT 0,
          parent_id TEXT,
          sort_order INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS content (
          id TEXT PRIMARY KEY,
          key TEXT NOT NULL,
          value_en TEXT,
          value_vi TEXT,
          type TEXT NOT NULL DEFAULT 'text',
          section TEXT,
          sort_order INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS newsletters (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          status TEXT DEFAULT 'active',
          preferences TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS admin_users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          role TEXT DEFAULT 'admin',
          last_login DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS admin_sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    // Create tables one by one
    for (const tableSQL of tables) {
      await this.runAsync(tableSQL);
    }

    // Settings table for application-wide settings
    await this.runAsync(
      `CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
    );

    // Orders tables
    await this.runAsync(
      `CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          status TEXT NOT NULL,
          total_amount REAL NOT NULL,
          currency TEXT NOT NULL,
          customer_name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          address TEXT NOT NULL,
          payment_method TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
    );
    try {
      await this.runAsync(`ALTER TABLE orders ADD COLUMN payment_method TEXT`);
    } catch {}
    await this.runAsync(
      `CREATE TABLE IF NOT EXISTS order_items (
          id TEXT PRIMARY KEY,
          order_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          name_en TEXT NOT NULL,
          name_vi TEXT NOT NULL,
          price REAL NOT NULL,
          quantity INTEGER NOT NULL,
          FOREIGN KEY(order_id) REFERENCES orders(id)
      )`,
    );

    // Create indexes
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`,
      `CREATE INDEX IF NOT EXISTS idx_products_organic ON products(organic)`,
      `CREATE INDEX IF NOT EXISTS idx_products_seasonal ON products(seasonal)`,
      `CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured)`,
      `CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock)`,
      `CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)`,
      `CREATE INDEX IF NOT EXISTS idx_content_key ON content(key)`,
      `CREATE INDEX IF NOT EXISTS idx_content_section ON content(section)`,
      `CREATE INDEX IF NOT EXISTS idx_newsletters_email ON newsletters(email)`,
      `CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at)`,
    ];

    for (const indexSQL of indexes) {
      await this.runAsync(indexSQL);
    }
  }

  private runAsync(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private getAsync(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  private allAsync(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    const rows = await this.allAsync(`
      SELECT * FROM products 
      ORDER BY created_at DESC
    `);

    return rows.map(this.mapRowToProduct);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const row = await this.getAsync("SELECT * FROM products WHERE id = ?", [
      id,
    ]);

    return row ? this.mapRowToProduct(row) : undefined;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const rows = await this.allAsync(
      "SELECT * FROM products WHERE category = ? ORDER BY created_at DESC",
      [category],
    );

    return rows.map(this.mapRowToProduct);
  }

  async getFeaturedProducts(limit: number = 4): Promise<Product[]> {
    const rows = await this.allAsync(
      `
      SELECT * FROM products 
      WHERE in_stock = TRUE 
      ORDER BY rating DESC 
      LIMIT ?
    `,
      [limit],
    );

    return rows.map(this.mapRowToProduct);
  }

  async createProduct(
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ): Promise<Product> {
    const id = this.generateId();
    const now = new Date().toISOString();

    await this.runAsync(
      `
      INSERT INTO products (
        id, name_en, name_vi, description_en, description_vi, price, original_price,
        image, images, category, in_stock, rating, reviews_count, weight, origin,
        harvest_date, shelf_life, nutrition, organic, seasonal, featured, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id,
        productData.name.en,
        productData.name.vi,
        productData.description.en,
        productData.description.vi,
        productData.price,
        productData.originalPrice,
        productData.image,
        JSON.stringify(productData.images || []),
        productData.category,
        productData.inStock,
        productData.rating,
        productData.reviewsCount,
        productData.weight,
        productData.origin,
        productData.harvestDate,
        productData.shelfLife,
        JSON.stringify(productData.nutrition || {}),
        productData.organic,
        productData.seasonal,
        productData.featured,
        now,
        now,
      ],
    );

    const product = await this.getProductById(id);
    if (!product) throw new Error("Failed to create product");
    return product;
  }

  async updateProduct(
    id: string,
    productData: Partial<Product>,
  ): Promise<Product> {
    const updates = [];
    const values = [];

    if (productData.name) {
      updates.push("name_en = ?", "name_vi = ?");
      values.push(productData.name.en, productData.name.vi);
    }
    if (productData.description) {
      updates.push("description_en = ?", "description_vi = ?");
      values.push(productData.description.en, productData.description.vi);
    }
    if (productData.price !== undefined) {
      updates.push("price = ?");
      values.push(productData.price);
    }
    if (productData.originalPrice !== undefined) {
      updates.push("original_price = ?");
      values.push(productData.originalPrice);
    }
    if (productData.image) {
      updates.push("image = ?");
      values.push(productData.image);
    }
    if (productData.images) {
      updates.push("images = ?");
      values.push(JSON.stringify(productData.images));
    }
    if (productData.category) {
      updates.push("category = ?");
      values.push(productData.category);
    }
    if (productData.inStock !== undefined) {
      updates.push("in_stock = ?");
      values.push(productData.inStock);
    }
    if (productData.organic !== undefined) {
      updates.push("organic = ?");
      values.push(productData.organic);
    }
    if (productData.seasonal !== undefined) {
      updates.push("seasonal = ?");
      values.push(productData.seasonal);
    }
    if (productData.featured !== undefined) {
      updates.push("featured = ?");
      values.push(productData.featured);
    }

    if (updates.length === 0) {
      throw new Error("No updates provided");
    }

    values.push(id);

    await this.runAsync(
      `
      UPDATE products 
      SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      values,
    );

    const product = await this.getProductById(id);
    if (!product) throw new Error("Product not found");
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.runAsync("DELETE FROM products WHERE id = ?", [id]);
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    const rows = await this.allAsync(`
      SELECT * FROM categories 
      ORDER BY sort_order, name_en
    `);

    return rows.map(this.mapRowToCategory);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const row = await this.getAsync("SELECT * FROM categories WHERE id = ?", [
      id,
    ]);

    return row ? this.mapRowToCategory(row) : undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const row = await this.getAsync("SELECT * FROM categories WHERE slug = ?", [
      slug,
    ]);

    return row ? this.mapRowToCategory(row) : undefined;
  }

  async createCategory(
    categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">,
  ): Promise<Category> {
    const id = this.generateId();
    const now = new Date().toISOString();

    await this.runAsync(
      `
      INSERT INTO categories (
        id, name_en, name_vi, description_en, description_vi, slug, image, 
        count, parent_id, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id,
        categoryData.name.en,
        categoryData.name.vi,
        categoryData.description?.en,
        categoryData.description?.vi,
        categoryData.slug,
        categoryData.image,
        categoryData.count || 0,
        categoryData.parentId,
        categoryData.sortOrder || 0,
        now,
        now,
      ],
    );

    const category = await this.getCategoryById(id);
    if (!category) throw new Error("Failed to create category");
    return category;
  }

  async updateCategory(
    id: string,
    categoryData: Partial<Category>,
  ): Promise<Category> {
    const updates = [];
    const values = [];

    if (categoryData.name) {
      updates.push("name_en = ?", "name_vi = ?");
      values.push(categoryData.name.en, categoryData.name.vi);
    }
    if (categoryData.description) {
      updates.push("description_en = ?", "description_vi = ?");
      values.push(categoryData.description.en, categoryData.description.vi);
    }
    if (categoryData.slug) {
      updates.push("slug = ?");
      values.push(categoryData.slug);
    }
    if (categoryData.image) {
      updates.push("image = ?");
      values.push(categoryData.image);
    }
    if (categoryData.count !== undefined) {
      updates.push("count = ?");
      values.push(categoryData.count);
    }

    if (updates.length === 0) {
      throw new Error("No updates provided");
    }

    values.push(id);

    await this.runAsync(
      `
      UPDATE categories 
      SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      values,
    );

    const category = await this.getCategoryById(id);
    if (!category) throw new Error("Category not found");
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.runAsync("DELETE FROM categories WHERE id = ?", [id]);
  }

  // Content
  async getAllContent(): Promise<Content[]> {
    const rows = await this.allAsync(`
      SELECT * FROM content 
      ORDER BY section, sort_order, key
    `);

    return rows.map(this.mapRowToContent);
  }

  async getContentById(id: string): Promise<Content | undefined> {
    const row = await this.getAsync("SELECT * FROM content WHERE id = ?", [id]);

    return row ? this.mapRowToContent(row) : undefined;
  }

  async getContentByKey(key: string): Promise<Content | undefined> {
    const row = await this.getAsync("SELECT * FROM content WHERE key = ?", [
      key,
    ]);

    return row ? this.mapRowToContent(row) : undefined;
  }

  async getContentBySection(section: string): Promise<Content[]> {
    const rows = await this.allAsync(
      "SELECT * FROM content WHERE section = ? ORDER BY sort_order, key",
      [section],
    );

    return rows.map(this.mapRowToContent);
  }

  async createContent(
    contentData: Omit<Content, "id" | "createdAt" | "updatedAt">,
  ): Promise<Content> {
    const id = this.generateId();
    const now = new Date().toISOString();

    await this.runAsync(
      `
      INSERT INTO content (
        id, key, value_en, value_vi, type, section, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id,
        contentData.key,
        contentData.value.en,
        contentData.value.vi,
        contentData.type,
        contentData.section,
        contentData.sortOrder || 0,
        now,
        now,
      ],
    );

    const content = await this.getContentById(id);
    if (!content) throw new Error("Failed to create content");
    return content;
  }

  async updateContent(
    id: string,
    contentData: Partial<Content>,
  ): Promise<Content> {
    const updates = [];
    const values = [];

    if (contentData.key) {
      updates.push("key = ?");
      values.push(contentData.key);
    }
    if (contentData.value) {
      updates.push("value_en = ?", "value_vi = ?");
      values.push(contentData.value.en, contentData.value.vi);
    }
    if (contentData.type) {
      updates.push("type = ?");
      values.push(contentData.type);
    }
    if (contentData.section) {
      updates.push("section = ?");
      values.push(contentData.section);
    }

    if (updates.length === 0) {
      throw new Error("No updates provided");
    }

    values.push(id);

    await this.runAsync(
      `
      UPDATE content 
      SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      values,
    );

    const content = await this.getContentById(id);
    if (!content) throw new Error("Content not found");
    return content;
  }

  async deleteContent(id: string): Promise<void> {
    await this.runAsync("DELETE FROM content WHERE id = ?", [id]);
  }

  // Newsletter
  async createNewsletterSubscription(
    email: string,
    name?: string,
  ): Promise<Newsletter> {
    const id = this.generateId();
    const now = new Date().toISOString();

    await this.runAsync(
      `
      INSERT INTO newsletters (id, email, name, status, created_at, updated_at)
      VALUES (?, ?, ?, 'active', ?, ?)
    `,
      [id, email, name || null, now, now],
    );

    const newsletter = await this.getAsync(
      "SELECT * FROM newsletters WHERE id = ?",
      [id],
    );

    return this.mapRowToNewsletter(newsletter);
  }

  async getAllNewsletters(): Promise<Newsletter[]> {
    const rows = await this.allAsync(`
      SELECT * FROM newsletters 
      ORDER BY created_at DESC
    `);

    return rows.map(this.mapRowToNewsletter);
  }

  // Admin Users
  async createAdminUser(
    username: string,
    password: string,
    name: string,
    email: string,
  ): Promise<AdminUser> {
    const id = this.generateId();
    const passwordHash = crypto
      .createHash("md5")
      .update(password)
      .digest("hex");
    const now = new Date().toISOString();

    await this.runAsync(
      `
      INSERT INTO admin_users (id, username, password_hash, name, email, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [id, username, passwordHash, name, email, now, now],
    );

    const user = await this.getAsync("SELECT * FROM admin_users WHERE id = ?", [
      id,
    ]);

    return this.mapRowToAdminUser(user);
  }

  async getAdminUserByUsername(
    username: string,
  ): Promise<AdminUser | undefined> {
    const row = await this.getAsync(
      "SELECT * FROM admin_users WHERE username = ?",
      [username],
    );

    return row ? this.mapRowToAdminUser(row) : undefined;
  }

  async getAdminUserById(id: string): Promise<AdminUser | undefined> {
    const row = await this.getAsync("SELECT * FROM admin_users WHERE id = ?", [
      id,
    ]);

    return row ? this.mapRowToAdminUser(row) : undefined;
  }

  async validateAdminUser(
    username: string,
    password: string,
  ): Promise<AdminUser | null> {
    const passwordHash = crypto
      .createHash("md5")
      .update(password)
      .digest("hex");
    const row = await this.getAsync(
      "SELECT * FROM admin_users WHERE username = ? AND password_hash = ?",
      [username, passwordHash],
    );

    return row ? this.mapRowToAdminUser(row) : null;
  }

  // Admin Sessions
  async createAdminSession(userId: string): Promise<AdminSession> {
    const id = this.generateId();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const now = new Date().toISOString();

    await this.runAsync(
      `
      INSERT INTO admin_sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `,
      [id, userId, expiresAt.toISOString(), now],
    );

    const session = await this.getAsync(
      "SELECT * FROM admin_sessions WHERE id = ?",
      [id],
    );

    return this.mapRowToAdminSession(session);
  }

  async getAdminSession(sessionId: string): Promise<AdminSession | undefined> {
    const row = await this.getAsync(
      "SELECT * FROM admin_sessions WHERE id = ? AND expires_at > datetime('now')",
      [sessionId],
    );

    return row ? this.mapRowToAdminSession(row) : undefined;
  }

  async deleteAdminSession(sessionId: string): Promise<void> {
    await this.runAsync("DELETE FROM admin_sessions WHERE id = ?", [sessionId]);
  }

  async cleanExpiredSessions(): Promise<void> {
    await this.runAsync(
      "DELETE FROM admin_sessions WHERE expires_at <= datetime('now')",
    );
  }

  // Settings
  async getAllSettings(): Promise<Record<string, any>> {
    const rows = await this.allAsync("SELECT key, value FROM app_settings");
    const out: Record<string, any> = {};
    for (const row of rows) {
      try {
        out[row.key] = row.value ? JSON.parse(row.value) : null;
      } catch {
        out[row.key] = row.value;
      }
    }
    return out;
  }

  async getSettings<T = any>(key: string): Promise<T | null> {
    const row = await this.getAsync(
      "SELECT value FROM app_settings WHERE key = ?",
      [key],
    );
    if (!row) return null;
    try {
      return row.value ? (JSON.parse(row.value) as T) : (null as any);
    } catch {
      return row.value as T;
    }
  }

  async updateSettings(key: string, value: any): Promise<void> {
    const val = JSON.stringify(value);
    await this.runAsync(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP`,
      [key, val],
    );
  }

  // Orders
  async createOrder(input: {
    status: "pending" | "confirmed";
    totalAmount: number;
    currency: string;
    customerName: string;
    email: string | null;
    phone: string | null;
    address: string;
    paymentMethod?: string;
    items: {
      productId: string;
      name_en: string;
      name_vi: string;
      price: number;
      quantity: number;
    }[];
  }) {
    const orderId = this.generateId();
    await this.runAsync(
      `INSERT INTO orders (id, status, total_amount, currency, customer_name, email, phone, address, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        input.status,
        input.totalAmount,
        input.currency,
        input.customerName,
        input.email,
        input.phone,
        input.address,
        input.paymentMethod || null,
      ],
    );

    for (const it of input.items) {
      await this.runAsync(
        `INSERT INTO order_items (id, order_id, product_id, name_en, name_vi, price, quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          this.generateId(),
          orderId,
          it.productId,
          it.name_en,
          it.name_vi,
          it.price,
          it.quantity,
        ],
      );
    }

    return { id: orderId, status: input.status } as {
      id: string;
      status: "pending" | "confirmed";
    };
  }

  // Export all data
  async exportAllData() {
    const [products, categories, content, newsletters, settings, orders] =
      await Promise.all([
        this.getAllProducts(),
        this.getAllCategories(),
        this.getAllContent(),
        this.getAllNewsletters(),
        this.getAllSettings(),
        this.allAsync("SELECT * FROM orders"),
      ]);

    return {
      products,
      categories,
      content,
      newsletters,
      settings,
      orders,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };
  }

  // Mapping functions
  private mapRowToProduct(row: any): Product {
    return {
      id: row.id,
      name: { en: row.name_en, vi: row.name_vi },
      description: { en: row.description_en, vi: row.description_vi },
      price: row.price,
      originalPrice: row.original_price,
      image: row.image,
      images: row.images ? JSON.parse(row.images) : [],
      category: row.category,
      inStock: Boolean(row.in_stock),
      rating: row.rating,
      reviewsCount: row.reviews_count,
      weight: row.weight,
      origin: row.origin,
      harvestDate: row.harvest_date,
      shelfLife: row.shelf_life,
      nutrition: row.nutrition ? JSON.parse(row.nutrition) : {},
      organic: Boolean(row.organic),
      seasonal: Boolean(row.seasonal),
      featured: Boolean(row.featured),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToCategory(row: any): Category {
    return {
      id: row.id,
      name: { en: row.name_en, vi: row.name_vi },
      description: row.description_en
        ? { en: row.description_en, vi: row.description_vi }
        : undefined,
      slug: row.slug,
      image: row.image,
      count: row.count,
      parentId: row.parent_id,
      sortOrder: row.sort_order,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToContent(row: any): Content {
    return {
      id: row.id,
      key: row.key,
      value: { en: row.value_en, vi: row.value_vi },
      type: row.type,
      section: row.section,
      sortOrder: row.sort_order,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToNewsletter(row: any): Newsletter {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      status: row.status,
      preferences: row.preferences ? JSON.parse(row.preferences) : {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToAdminUser(row: any): AdminUser {
    return {
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      name: row.name,
      email: row.email,
      role: row.role,
      lastLogin: row.last_login ? new Date(row.last_login) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToAdminSession(row: any): AdminSession {
    return {
      id: row.id,
      userId: row.user_id,
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at),
    };
  }

  // Seed data
  private async seedData() {
    // Check if data already exists
    const existingProducts = await this.allAsync(
      "SELECT COUNT(*) as count FROM products",
    );
    const existingAdmins = await this.allAsync(
      "SELECT COUNT(*) as count FROM admin_users",
    );

    if (existingProducts[0].count > 0 && existingAdmins[0].count > 0) {
      console.log("Database already seeded");
      return;
    }

    // Check if admin user exists, if not create it
    if (existingAdmins[0].count === 0) {
      console.log("Creating admin user...");
      await this.createAdminUser(
        "admin",
        "admin123",
        "Administrator",
        "admin@minhphat.com",
      );
    }

    if (existingProducts[0].count > 0) {
      console.log("Products already exist, skipping product seeding");
      return;
    }

    if (existingProducts[0].count > 0) {
      console.log("Products already exist, skipping product seeding");
      return;
    }

    console.log("Seeding database...");

    // Seed categories
    const categories = [
      {
        id: "fruits",
        name: { en: "Fruits", vi: "Trái cây" },
        description: {
          en: "Fresh seasonal fruits",
          vi: "Trái cây tươi theo mùa",
        },
        slug: "fruits",
        image:
          "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&h=600&fit=crop",
        count: 0,
        parentId: null,
        sortOrder: 1,
      },
      {
        id: "vegetables",
        name: { en: "Vegetables", vi: "Rau củ" },
        description: {
          en: "Farm-fresh vegetables",
          vi: "Rau củ tươi từ trang trại",
        },
        slug: "vegetables",
        image:
          "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop",
        count: 0,
        parentId: null,
        sortOrder: 2,
      },
      {
        id: "organic",
        name: { en: "Organic", vi: "Hữu cơ" },
        description: {
          en: "Certified organic produce",
          vi: "Sản phẩm hữu cơ được chứng nhận",
        },
        slug: "organic",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
        count: 0,
        parentId: null,
        sortOrder: 3,
      },
      {
        id: "seasonal",
        name: { en: "Seasonal", vi: "Theo mùa" },
        description: {
          en: "Best seasonal picks",
          vi: "Lựa chọn tốt nhất theo mùa",
        },
        slug: "seasonal",
        image:
          "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop",
        count: 0,
        parentId: null,
        sortOrder: 4,
      },
      {
        id: "bundles",
        name: { en: "Bundles", vi: "Gói kết hợp" },
        description: {
          en: "Value fruit & vegetable bundles",
          vi: "Gói trái cây và rau củ giá trị",
        },
        slug: "bundles",
        image:
          "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop",
        count: 0,
        parentId: null,
        sortOrder: 5,
      },
    ];

    for (const category of categories) {
      await this.createCategory(category);
    }

    // Seed products (sample)
    const products = [
      {
        name: { en: "Fresh Strawberries", vi: "Dâu tây tươi" },
        description: {
          en: "Sweet and juicy strawberries, perfect for desserts",
          vi: "Dâu tây ngọt và mọng nước, hoàn hảo cho món tráng miệng",
        },
        price: 5.99,
        originalPrice: 7.99,
        image:
          "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&h=600&fit=crop",
        category: "fruits",
        inStock: true,
        rating: 4.8,
        reviewsCount: 124,
        weight: "1 lb",
        origin: "California",
        organic: true,
        seasonal: true,
        featured: true,
      },
      {
        name: { en: "Organic Bananas", vi: "Chuối hữu cơ" },
        description: {
          en: "Ripe yellow bananas, great source of potassium",
          vi: "Chuối vàng chín, nguồn kali tuyệt vời",
        },
        price: 2.49,
        image:
          "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&h=600&fit=crop",
        category: "fruits",
        inStock: true,
        rating: 4.6,
        reviewsCount: 89,
        weight: "2 lbs",
        origin: "Ecuador",
        organic: true,
        featured: true,
      },
    ];

    for (const product of products) {
      await this.createProduct(product);
    }

    // Update category counts
    for (const category of categories) {
      const count = await this.allAsync(
        "SELECT COUNT(*) as count FROM products WHERE category = ?",
        [category.id],
      );
      await this.runAsync("UPDATE categories SET count = ? WHERE id = ?", [
        count[0].count,
        category.id,
      ]);
    }

    // Seed content
    const content = [
      {
        key: "hero_title",
        value: {
          en: "Fresh Fruits Delivered Daily",
          vi: "Trái cây tươi giao hàng hàng ngày",
        },
        type: "text" as const,
        section: "hero",
      },
      {
        key: "hero_subtitle",
        value: {
          en: "Farm-fresh fruits delivered to your doorstep. Support local farmers while enjoying the finest quality produce at unbeatable prices.",
          vi: "Trái cây tươi từ trang trại giao đến tận nhà. Hỗ trợ nông dân địa phương đồng thời thưởng thức sản phẩm chất lượng cao nhất với giá cả không thể cạnh tranh hơn.",
        },
        type: "text" as const,
        section: "hero",
      },
      {
        key: "features_title",
        value: { en: "Why Choose Minh Phát?", vi: "Tại sao chọn Minh Phát?" },
        type: "text" as const,
        section: "features",
      },
      {
        key: "newsletter_title",
        value: {
          en: "Stay Fresh with Our Newsletter",
          vi: "Luôn cập nhật với Bản tin của chúng tôi",
        },
        type: "text" as const,
        section: "newsletter",
      },
    ];

    for (const cont of content) {
      await this.createContent(cont);
    }

    // Seed default admin user
    await this.createAdminUser(
      "admin",
      "admin123",
      "Administrator",
      "admin@minhphat.com",
    );

    console.log("Database seeded successfully");
  }

  // Cleanup method
  close() {
    this.db.close((err) => {
      if (err) {
        console.error("Error closing database:", err);
      } else {
        console.log("Database connection closed");
      }
    });
  }
}

// Export singleton instance
export const db = new SQLiteDatabase();
