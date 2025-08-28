import type { CheckoutRequest, CheckoutResponse } from "@shared/database";

export const shopApi = {
  checkout: async (payload: CheckoutRequest): Promise<CheckoutResponse> => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Checkout failed");
    return data;
  },
};
