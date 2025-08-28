import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import { shopApi } from "@/lib/shop-api";
import { useQuery } from "@tanstack/react-query";

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer" | "momo">("cod");

  const { data: publicSettings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: () => shopApi.getPublicSettings(),
  });

  const pm = publicSettings?.settings?.paymentMethods || {};

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
                  <div className="mt-3 space-y-2">
                    {pm?.cod?.enabled !== false && (
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                        />
                        <span>Cash on Delivery</span>
                      </label>
                    )}
                    {pm?.bankTransfer?.enabled && (
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="bank_transfer"
                          checked={paymentMethod === "bank_transfer"}
                          onChange={() => setPaymentMethod("bank_transfer")}
                        />
                        <span>Bank Transfer</span>
                      </label>
                    )}
                    {pm?.momo?.enabled && (
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="momo"
                          checked={paymentMethod === "momo"}
                          onChange={() => setPaymentMethod("momo")}
                        />
                        <span>Momo</span>
                      </label>
                    )}
                  </div>

                  {paymentMethod === "bank_transfer" && pm?.bankTransfer?.enabled && (
                    <div className="mt-3 rounded border p-3 text-sm">
                      <div><strong>Bank:</strong> {pm.bankTransfer.bankName}</div>
                      <div><strong>Account Name:</strong> {pm.bankTransfer.accountName}</div>
                      <div><strong>Account Number:</strong> {pm.bankTransfer.accountNumber}</div>
                      {pm.bankTransfer.instruction && (
                        <div className="mt-2 text-muted-foreground">{pm.bankTransfer.instruction}</div>
                      )}
                    </div>
                  )}

                  {paymentMethod === "momo" && pm?.momo?.enabled && (
                    <div className="mt-3 rounded border p-3 text-sm">
                      <div><strong>Phone:</strong> {pm.momo.phone}</div>
                      {pm.momo.qrImageUrl && (
                        <img src={pm.momo.qrImageUrl} alt="Momo QR" className="mt-2 w-40 h-40 object-cover rounded" />
                      )}
                      {pm.momo.instruction && (
                        <div className="mt-2 text-muted-foreground">{pm.momo.instruction}</div>
                      )}
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
