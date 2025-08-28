import { RequestHandler } from "express";
import { db } from "../database/sqlite-db";

// GET /api/settings - Get store settings
export const getStoreSettings: RequestHandler = async (_req, res) => {
  try {
    const settings = (await db.getSettings("store")) || null;
    res.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/settings - Update store settings (admin only)
export const updateStoreSettings: RequestHandler = async (req, res) => {
  try {
    const settings = req.body?.settings;
    if (!settings || typeof settings !== "object") {
      return res.status(400).json({ error: "Invalid settings payload" });
    }

    await db.updateSettings("store", settings);
    res.json({ message: "Settings updated", settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
