import { RequestHandler } from "express";
import { db } from "../database/sqlite-db";
import {
  ContentResponse,
  CreateContentRequest,
  UpdateContentRequest,
} from "@shared/database";

// GET /api/content - Get all content
export const getContent: RequestHandler = async (req, res) => {
  try {
    const { section, key } = req.query;

    let content;
    if (section && typeof section === "string") {
      content = await db.getContentBySection(section);
    } else if (key && typeof key === "string") {
      const singleContent = await db.getContentByKey(key);
      content = singleContent ? [singleContent] : [];
    } else {
      content = await db.getAllContent();
    }

    const response: ContentResponse = {
      content,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/content/:id - Get content by ID
export const getContentById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await db.getContentById(id);

    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    res.json(content);
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/content/key/:key - Get content by key
export const getContentByKey: RequestHandler = async (req, res) => {
  try {
    const { key } = req.params;
    const content = await db.getContentByKey(key);

    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    res.json(content);
  } catch (error) {
    console.error("Error fetching content by key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/content/section/:section - Get content by section
export const getContentBySection: RequestHandler = async (req, res) => {
  try {
    const { section } = req.params;
    const content = await db.getContentBySection(section);

    res.json({
      content,
      section,
      total: content.length,
    });
  } catch (error) {
    console.error("Error fetching content by section:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/content - Create new content (admin only)
export const createContent: RequestHandler = async (req, res) => {
  try {
    const contentData: CreateContentRequest = req.body;

    // Validate required fields
    if (!contentData.key) {
      return res.status(400).json({ error: "Content key is required" });
    }

    if (!contentData.value?.en || !contentData.value?.vi) {
      return res
        .status(400)
        .json({ error: "Content value in both languages is required" });
    }

    if (!contentData.type) {
      return res.status(400).json({ error: "Content type is required" });
    }

    // Check if key already exists in the same section
    const existingContent = await db.getContentByKey(contentData.key);
    if (existingContent && existingContent.section === contentData.section) {
      return res.status(400).json({
        error: "Content with this key already exists in this section",
      });
    }

    // Create content
    const newContent = await db.createContent(contentData);

    res.status(201).json(newContent);
  } catch (error) {
    console.error("Error creating content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/content/:id - Update content (admin only)
export const updateContent: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: Partial<UpdateContentRequest> = req.body;

    const updatedContent = await db.updateContent(id, updates);

    if (!updatedContent) {
      return res.status(404).json({ error: "Content not found" });
    }

    res.json(updatedContent);
  } catch (error) {
    console.error("Error updating content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/content/:id - Delete content (admin only)
export const deleteContent: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteContent(id);

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/newsletter/subscribe - Subscribe to newsletter
export const subscribeNewsletter: RequestHandler = async (req, res) => {
  try {
    const { email, name } = req.body;

    // Validate email
    const emailStr = String(email || "").trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr) && emailStr.length <= 254;
    if (!emailOk) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    // Check if already subscribed
    const newsletters = await db.getAllNewsletters();
    const existingSubscription = newsletters.find((n) => n.email === emailStr);

    if (existingSubscription) {
      return res.status(400).json({ error: "Email already subscribed" });
    }

    // Create subscription
    const safeName = name ? String(name).slice(0, 120) : undefined;
    const subscription = await db.createNewsletterSubscription(emailStr, safeName);

    res.status(201).json({
      message: "Successfully subscribed to newsletter",
      subscription: {
        id: subscription.id,
        email: subscription.email,
        name: subscription.name,
      },
    });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
