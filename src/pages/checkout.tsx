import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/context/StoreContext";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Loader2, MessageCircle, Minus, Plus, X, Truck, Store } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Checkout = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart, branch, setBranch } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [orderSuccess, setOrderSuccess] = useState<{ orderId: string; whatsappUrl: string } | null>(null);

  if (!user) {
    return (
      <div className="container mx-auto p-10 text-center">
        <p className="text-muted-foreground font-body mb-4">Please sign in to checkout.</p>
        <Link to="/signin" className="bg-gradient-fire text-primary-foreground px-6 py-3 rounded-xl font-bold font-body">
          Sign In
        </Link>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="container mx-auto p-10 max-w-lg text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <CheckCircle className="w-20 h-20 text-green-500" />
          <h1 className="text-2xl font-display font-bold text-foreground">Order Placed Successfully! 🎉</h1>
          <p className="text-muted-foreground font-body">Your order has been received and is being prepared.</p>

          <a
            href={orderSuccess.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors font-body mt-2"
          >
            <MessageCircle className="w-5 h-5" />
            Send Order via WhatsApp
          </a>

          <Link
            to={`/orders/${orderSuccess.orderId}`}
            className="w-full py-3 bg-gradient-fire text-primary-foreground font-bold rounded-xl text-center hover:shadow-fire transition-all font-body"
          >
            Track Your Order
          </Link>

          <Link
            to="/menu"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="container mx-auto p-10 text-center text-muted-foreground">
        <p className="font-body">Your cart is empty. Add some items to checkout.</p>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!branch) {
      toast.error("Please select a branch first.");
      return;
    }
    if (orderType === "delivery" && !deliveryAddress.trim()) {
      toast.error("Please enter your delivery address.");
      return;
    }
    setPlacing(true);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        branch: branch,
        total: cartTotal,
        notes: notes.trim() || null,
        delivery_address: orderType === "delivery" ? deliveryAddress.trim() : null,
        order_type: orderType,
      })
      .select()
      .single();

    if (orderError || !order) {
      toast.error("Failed to place order. Please try again.");
      setPlacing(false);
      return;
    }

    const orderItems = cart.map((item) => ({
      order_id: order.id,
      menu_item_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      toast.error("Order placed but items failed to save.");
      setPlacing(false);
      return;
    }

    const orderTypeLabel = orderType === "pickup" ? "🏪 Pickup" : "🚚 Delivery";
    const orderText = cart
      .map((item) => `${item.name} x${item.quantity} - Rs.${item.price * item.quantity}`)
      .join("\n");
    const whatsappMessage = `🛒 *New Order!*\n\n${orderText}\n\n💰 *Total: Rs.${cartTotal}*\n📍 *Branch:* ${branch}\n📦 *Type:* ${orderTypeLabel}\n${orderType === "delivery" ? `🏠 *Address:* ${deliveryAddress.trim()}\n` : ""}📝 *Notes:* ${notes.trim() || "None"}\n\n📦 Order ID: ${order.id}`;
    const whatsappUrl = `https://wa.me/923245531819?text=${encodeURIComponent(whatsappMessage)}`;

    setOrderSuccess({ orderId: order.id, whatsappUrl });
    clearCart();
    setPlacing(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-display font-bold text-foreground mb-6">Checkout</h1>

      <AnimatePresence>
        {cart.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-4 mb-4 glass-card rounded-xl p-4"
          >
            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-foreground font-body">{item.name}</h4>
              <p className="text-primary font-bold mt-1 font-body">Rs. {item.price}</p>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-bold text-foreground w-6 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-full bg-gradient-fire text-primary-foreground flex items-center justify-center hover:shadow-fire transition-shadow">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex justify-between items-center mt-6 p-4 bg-secondary rounded-xl">
        <span className="font-bold text-foreground font-body">Total</span>
        <span className="font-bold text-lg text-primary font-body">Rs. {cartTotal}</span>
      </div>

      {/* Order Type Selection */}
      <div className="mt-6">
        <label className="text-sm text-muted-foreground font-body mb-3 block">Order Type *</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setOrderType("delivery")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              orderType === "delivery"
                ? "border-primary bg-primary/10 shadow-fire"
                : "border-border bg-secondary hover:border-primary/50"
            }`}
          >
            <Truck className={`w-6 h-6 ${orderType === "delivery" ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`font-body font-bold text-sm ${orderType === "delivery" ? "text-primary" : "text-muted-foreground"}`}>
              Delivery
            </span>
            <span className="text-xs text-muted-foreground font-body">We'll bring it to you</span>
          </button>
          <button
            onClick={() => setOrderType("pickup")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              orderType === "pickup"
                ? "border-primary bg-primary/10 shadow-fire"
                : "border-border bg-secondary hover:border-primary/50"
            }`}
          >
            <Store className={`w-6 h-6 ${orderType === "pickup" ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`font-body font-bold text-sm ${orderType === "pickup" ? "text-primary" : "text-muted-foreground"}`}>
              Pickup
            </span>
            <span className="text-xs text-muted-foreground font-body">Grab it on the go</span>
          </button>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm text-muted-foreground font-body mb-1.5 block">Branch *</label>
        <Select value={branch || ""} onValueChange={(val) => setBranch(val)}>
          <SelectTrigger className="w-full bg-secondary border border-border rounded-xl text-foreground font-body">
            <SelectValue placeholder="Select a branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Johar Town">Johar Town</SelectItem>
            <SelectItem value="DHA">DHA</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {orderType === "delivery" && (
        <div className="mt-4">
          <label className="text-sm text-muted-foreground font-body mb-1.5 block">Delivery Address *</label>
          <textarea
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Enter your full delivery address..."
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground font-body placeholder:text-muted-foreground outline-none focus:border-primary focus:shadow-fire transition-all resize-none"
            rows={2}
            maxLength={300}
          />
        </div>
      )}

      <div className="mt-4">
        <label className="text-sm text-muted-foreground font-body mb-1.5 block">Order Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special instructions..."
          className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground font-body placeholder:text-muted-foreground outline-none focus:border-primary focus:shadow-fire transition-all resize-none"
          rows={2}
          maxLength={500}
        />
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={placing}
        className="w-full py-3 bg-gradient-fire text-primary-foreground font-bold rounded-xl hover:shadow-fire hover:scale-[1.02] transition-all font-body mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {placing && <Loader2 className="w-4 h-4 animate-spin" />}
        Place Order
      </button>
      <button onClick={clearCart} className="w-full py-2 mt-2 text-sm text-muted-foreground hover:text-destructive transition-colors font-body">
        Clear Cart
      </button>
    </div>
  );
};

export default Checkout;
