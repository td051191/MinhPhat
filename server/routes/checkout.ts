import { RequestHandler } from "express";
import { db } from "../database/sqlite-db";

export const checkout: RequestHandler = async (req, res) => {
  try {
    const { items, paymentMethod, customer } = req.body as {
      items: { id: string; quantity: number }[];
      paymentMethod: "cod";
      customer: { name: string; email?: string; phone?: string; address: string };
    };

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items in cart" });
    }
    if (!customer?.name || !customer?.address) {
      return res.status(400).json({ error: "Missing customer info" });
    }
    if (paymentMethod !== "cod") {
      return res.status(400).json({ error: "Unsupported payment method" });
    }

    const products = await Promise.all(items.map((i) => db.getProductById(i.id)));
    const missing = products.findIndex((p) => !p);
    if (missing !== -1) {
      return res.status(400).json({ error: `Invalid product: ${items[missing].id}` });
    }

    const computedItems = products.map((p, idx) => ({ product: p!, quantity: items[idx].quantity }));
    const total = computedItems.reduce((sum, it) => sum + it.product.price * it.quantity, 0);

    const order = await db.createOrder({
      status: "pending",
      totalAmount: total,
      currency: "USD",
      customerName: customer.name,
      email: customer.email || null,
      phone: customer.phone || null,
      address: customer.address,
      items: computedItems.map((it) => ({
        productId: it.product.id,
        name_en: it.product.name.en,
        name_vi: it.product.name.vi,
        price: it.product.price,
        quantity: it.quantity,
      })),
    });

    res.json({ orderId: order.id, status: order.status });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
