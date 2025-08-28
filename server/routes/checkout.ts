import { RequestHandler } from "express";
import { db } from "../database/sqlite-db";

export const checkout: RequestHandler = async (req, res) => {
  try {
    const { items, paymentMethod, customer } = req.body as {
      items: { id: string; quantity: number }[];
      paymentMethod: "cod" | "bank_transfer" | "momo";
      customer: {
        name: string;
        email?: string;
        phone?: string;
        address: string;
      };
    };

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items in cart" });
    }
    const safeName = String(customer?.name || "").trim().slice(0, 120);
    const safeAddress = String(customer?.address || "").trim().slice(0, 300);
    const safeEmail = customer?.email ? String(customer.email).trim().slice(0, 254) : undefined;
    const safePhone = customer?.phone ? String(customer.phone).trim().slice(0, 40) : undefined;
    if (!safeName || !safeAddress) {
      return res.status(400).json({ error: "Missing customer info" });
    }
    items.forEach((i) => (i.quantity = Math.max(1, Math.min(99, Number(i.quantity) || 1))));
    const settings = (await db.getSettings("store")) || {};
    const pm = settings.paymentMethods || {};
    const enabledMethods = {
      cod: pm.cod?.enabled !== false,
      bank_transfer: pm.bankTransfer?.enabled === true,
      momo: pm.momo?.enabled === true,
    } as const;

    if (!enabledMethods[paymentMethod]) {
      return res.status(400).json({ error: "Unsupported payment method" });
    }

    const products = await Promise.all(
      items.map((i) => db.getProductById(i.id)),
    );
    const missing = products.findIndex((p) => !p);
    if (missing !== -1) {
      return res
        .status(400)
        .json({ error: `Invalid product: ${items[missing].id}` });
    }

    const computedItems = products.map((p, idx) => ({
      product: p!,
      quantity: items[idx].quantity,
    }));
    const total = computedItems.reduce(
      (sum, it) => sum + it.product.price * it.quantity,
      0,
    );

    const order = await db.createOrder({
      status: "pending",
      totalAmount: total,
      currency: "USD",
      customerName: customer.name,
      email: customer.email || null,
      phone: customer.phone || null,
      address: customer.address,
      paymentMethod: paymentMethod,
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
