import { RequestHandler } from "express";
import { db } from "../database/sqlite-db";

// POST /api/auth/login - Admin login
export const login: RequestHandler = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Validate credentials
    const user = await db.validateAdminUser(username, password);
    if (!user) {
      return res.status(401).json({ error: "Wrong info" });
    }

    // Create session
    const session = await db.createAdminSession(user.id);

    // Set HTTP-only cookie
    res.cookie("admin_session", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/auth/logout - Admin logout
export const logout: RequestHandler = async (req, res) => {
  try {
    const sessionId = req.cookies.admin_session;

    if (sessionId) {
      // Delete session from database
      await db.deleteAdminSession(sessionId);
    }

    // Clear cookie
    res.clearCookie("admin_session");

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/auth/verify - Verify admin session
export const verify: RequestHandler = async (req, res) => {
  try {
    const sessionId = req.cookies.admin_session;

    if (!sessionId) {
      return res.status(401).json({ error: "No session found" });
    }

    // Check session in database
    const session = await db.getAdminSession(sessionId);
    if (!session) {
      // Session expired or invalid
      res.clearCookie("admin_session");
      return res.status(401).json({ error: "Session expired" });
    }

    // Get user details from session
    const user = await db.getAdminUserById(session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Session verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Middleware to protect admin routes
export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const sessionId = req.cookies.admin_session;

    if (!sessionId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check session in database
    const session = await db.getAdminSession(sessionId);
    if (!session) {
      res.clearCookie("admin_session");
      return res.status(401).json({ error: "Session expired" });
    }

    // For mutating requests, enforce admin header as lightweight CSRF guard
    if (req.method !== "GET") {
      const adminHeader = req.headers["x-admin"];
      if (adminHeader !== "true") {
        return res.status(403).json({ error: "Invalid admin request" });
      }
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
