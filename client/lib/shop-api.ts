import type {
  CheckoutRequest,
  CheckoutResponse,
  PublicSettingsResponse,
} from "@shared/database";

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
  getPublicSettings: async (): Promise<PublicSettingsResponse> => {
    const res = await fetch("/api/public-settings");
    if (!res.ok) throw new Error("Failed to load settings");
    return res.json();
  },
};
