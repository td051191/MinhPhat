import { Header } from "@/components/Header";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const { items, subtotal, update, remove, clear } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        {items.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">Your cart is empty.</p>
              <Button asChild>
                <Link to="/">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    {/^https?:\/\//.test(item.image) ? (
                      <img
                        src={item.image}
                        alt={item.name.en}
                        className="w-16 h-16 rounded-lg object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-4xl">{item.image}</div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">{item.name.en}</div>
                      <div className="text-muted-foreground text-sm">
                        {item.weight || "unit"}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={item.quantity}
                          onChange={(e) =>
                            update(item.id, Number(e.target.value))
                          }
                          className="w-20 border rounded px-2 py-1"
                        />
                        <Button variant="ghost" onClick={() => remove(item.id)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="ghost" onClick={clear}>
                Clear Cart
              </Button>
            </div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-lg font-bold">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <Button
                  className="w-full"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
