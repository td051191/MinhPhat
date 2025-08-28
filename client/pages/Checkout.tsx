import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/useCart";
import { useEffect, useState } from "react";
import { shopApi } from "@/lib/shop-api";
import { useQuery } from "@tanstack/react-query";

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");

  const { data: publicSettings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: () => shopApi.getPublicSettings(),
  });

  const pm = publicSettings?.settings?.paymentMethods || {};

  useEffect(() => {
    const enabled: string[] = [];
    if (pm?.cod?.enabled !== false) enabled.push("cod");
    if (pm?.bankTransfer?.enabled) enabled.push("bank_transfer");
    if (pm?.momo?.enabled) enabled.push("momo");
    if (Array.isArray(pm?.custom)) {
      for (const c of pm.custom) if (c?.enabled) enabled.push(String(c.id));
    }
    if (enabled.length > 0 && !enabled.includes(paymentMethod)) {
      setPaymentMethod(enabled[0]);
    }
  }, [publicSettings]);

  const placeOrder = async () => {
    if (items.length === 0) return alert("Cart is empty");
    if (!name || !address) return alert("Please fill your name and address");
    try {
      setIsPlacing(true);
      const res = await shopApi.checkout({
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        paymentMethod,
        customer: { name, email, phone, address },
      });
      clear();
      alert(`Order placed! Order ID: ${res.orderId}`);
    } catch (e: any) {
      alert(e?.message || "Failed to place order");
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        {items.length === 0 ? (
          <Card>
            <CardContent className="p-6">Your cart is empty.</CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardContent className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Address</Label>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <RadioGroup
                    className="mt-3 space-y-2"
                    value={paymentMethod}
                    onValueChange={(val) => setPaymentMethod(val)}
                  >
                    {pm?.cod?.enabled !== false && (
                      <div className="flex items-center gap-3">
                        <RadioGroupItem id="pm-cod" value="cod" />
                        <Label htmlFor="pm-cod">Cash on Delivery</Label>
                      </div>
                    )}
                    {pm?.bankTransfer?.enabled && (
                      <div className="flex items-center gap-3">
                        <RadioGroupItem id="pm-bank" value="bank_transfer" />
                        <Label htmlFor="pm-bank">Bank Transfer</Label>
                      </div>
                    )}
                    {pm?.momo?.enabled && (
                      <div className="flex items-center gap-3">
                        <RadioGroupItem id="pm-momo" value="momo" />
                        <Label htmlFor="pm-momo">Momo</Label>
                      </div>
                    )}
                    {Array.isArray(pm?.custom) &&
                      pm.custom.map((cm: any) =>
                        cm?.enabled ? (
                          <div key={cm.id} className="flex items-center gap-3">
                            <RadioGroupItem
                              id={`pm-custom-${String(cm.id).replace(/[^a-zA-Z0-9_-]/g, "-")}`}
                              value={String(cm.id)}
                            />
                            <Label htmlFor={`pm-custom-${String(cm.id).replace(/[^a-zA-Z0-9_-]/g, "-")}`}>
                              {cm.name}
                            </Label>
                          </div>
                        ) : null,
                      )}
                  </RadioGroup>

                  {paymentMethod === "bank_transfer" &&
                    pm?.bankTransfer?.enabled && (
                      <div className="mt-3 rounded border p-3 text-sm">
                        <div>
                          <strong>Bank:</strong> {pm.bankTransfer.bankName}
                        </div>
                        <div>
                          <strong>Account Name:</strong>{" "}
                          {pm.bankTransfer.accountName}
                        </div>
                        <div>
                          <strong>Account Number:</strong>{" "}
                          {pm.bankTransfer.accountNumber}
                        </div>
                        {pm.bankTransfer.instruction && (
                          <div className="mt-2 text-muted-foreground">
                            {pm.bankTransfer.instruction}
                          </div>
                        )}
                      </div>
                    )}

                  {paymentMethod === "momo" && pm?.momo?.enabled && (
                    <div className="mt-3 rounded border p-3 text-sm">
                      <div>
                        <strong>Phone:</strong> {pm.momo.phone}
                      </div>
                      {pm.momo.qrImageUrl && (
                        <img
                          src={pm.momo.qrImageUrl}
                          alt="Momo QR"
                          className="mt-2 w-40 h-40 object-cover rounded"
                        />
                      )}
                      {pm.momo.instruction && (
                        <div className="mt-2 text-muted-foreground">
                          {pm.momo.instruction}
                        </div>
                      )}
                    </div>
                  )}

                  {pm?.custom?.some((c: any) => c.id === paymentMethod) && (
                    <div className="mt-3 rounded border p-3 text-sm">
                      {pm.custom
                        .filter((c: any) => c.id === paymentMethod)
                        .map((c: any) => (
                          <div key={c.id} className="space-y-2">
                            {c.qrImageUrl && (
                              <img
                                src={c.qrImageUrl}
                                alt={`${c.name} QR`}
                                className="w-40 h-40 object-cover rounded"
                              />
                            )}
                            {c.instruction && (
                              <div className="text-muted-foreground">
                                {c.instruction}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <Button onClick={placeOrder} disabled={isPlacing}>
                  {isPlacing ? "Placing Order..." : "Place Order"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Delivery fee calculated at delivery.
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
