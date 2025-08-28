import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import { shopApi } from "@/lib/shop-api";

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);

  const placeOrder = async () => {
    if (items.length === 0) return alert("Cart is empty");
    if (!name || !address) return alert("Please fill your name and address");
    try {
      setIsPlacing(true);
      const res = await shopApi.checkout({
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        paymentMethod: "cod",
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
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Address</Label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <div className="mt-2">Cash on Delivery</div>
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
                <div className="text-sm text-muted-foreground">Delivery fee calculated at delivery.</div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
