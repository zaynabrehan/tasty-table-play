import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { CheckCircle, ChefHat, Clock, MapPin, Package, Phone, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

interface Order {
  id: string;
  branch: string;
  status: string;
  total: number;
  notes: string | null;
  delivery_address: string | null;
  estimated_delivery: string | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  menu_items: { name: string; image_url: string | null } | null;
}

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: Package, description: "Your order has been received" },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle, description: "Restaurant confirmed your order" },
  { key: "preparing", label: "Preparing", icon: ChefHat, description: "Your food is being prepared" },
  { key: "rider_picked", label: "On the Way", icon: Truck, description: "Rider has picked up your order" },
  { key: "delivered", label: "Delivered", icon: MapPin, description: "Order delivered successfully!" },
];

const BRANCH_COORDS: Record<string, [number, number]> = {
  "Johar Town": [31.4697, 74.2728],
  "DHA": [31.4784, 74.3753],
};

const OrderTracking = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !orderId) return;

    const fetchOrder = async () => {
      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single();

      if (orderData) {
        setOrder(orderData);
        const { data: itemsData } = await supabase
          .from("order_items")
          .select("*, menu_items(name, image_url)")
          .eq("order_id", orderId);
        setItems((itemsData as OrderItem[]) || []);
      }
      setLoading(false);
    };

    fetchOrder();

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        (payload) => {
          setOrder((prev) => (prev ? { ...prev, ...payload.new } : null));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, orderId]);

  if (!user) {
    return (
      <div className="container mx-auto p-10 text-center">
        <p className="text-muted-foreground font-body mb-4">Please sign in to track orders.</p>
        <Link to="/signin" className="bg-gradient-fire text-primary-foreground px-6 py-3 rounded-xl font-bold">Sign In</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-10 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground font-body mt-4">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-10 text-center">
        <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground font-body">Order not found.</p>
        <Link to="/orders" className="inline-block mt-4 text-primary font-bold">View All Orders</Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const branchCoords = BRANCH_COORDS[order.branch] || BRANCH_COORDS["Johar Town"];
  const estimatedTime = order.estimated_delivery
    ? new Date(order.estimated_delivery).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })
    : "30-45 mins";

  const latDelta = 0.02;
  const lngDelta = 0.03;
  const bbox = [
    branchCoords[1] - lngDelta,
    branchCoords[0] - latDelta,
    branchCoords[1] + lngDelta,
    branchCoords[0] + latDelta,
  ].join(",");
  const embedMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${branchCoords[0]},${branchCoords[1]}`;
  const openMapUrl = `https://www.openstreetmap.org/?mlat=${branchCoords[0]}&mlon=${branchCoords[1]}#map=14/${branchCoords[0]}/${branchCoords[1]}`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Track <span className="text-gradient-fire">Order</span>
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-1">Order #{order.id.slice(0, 8)}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Clock className="w-4 h-4" />
            <span className="font-body">{estimatedTime}</span>
          </div>
          <p className="text-xs text-muted-foreground font-body">Estimated delivery</p>
        </div>
      </div>

      {/* Delivery Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden shadow-card mb-6 border border-border"
      >
        <iframe
          title="Order delivery map"
          src={embedMapUrl}
          className="w-full h-[300px] border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="px-4 py-2 bg-secondary text-right">
          <a
            href={openMapUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-body text-primary hover:underline"
          >
            Open full map
          </a>
        </div>
      </motion.div>

      {/* Status Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-6 mb-6"
      >
        <h2 className="font-bold text-foreground font-body mb-4">Order Status</h2>
        <div className="relative">
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex items-start gap-4 relative">
                {index < STATUS_STEPS.length - 1 && (
                  <div className={`absolute left-5 top-10 w-0.5 h-12 ${index < currentStepIndex ? "bg-primary" : "bg-border"}`} />
                )}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: isCurrent ? 1.1 : 1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? "bg-gradient-fire text-primary-foreground" : "bg-muted text-muted-foreground"
                  } ${isCurrent ? "ring-4 ring-primary/30" : ""}`}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <div className="pb-8">
                  <p className={`font-bold font-body ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                  <p className="text-sm text-muted-foreground font-body">{step.description}</p>
                  {isCurrent && order.status !== "delivered" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-xs text-primary font-body">In progress</span>
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Order Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6"
      >
        <h2 className="font-bold text-foreground font-body mb-4">Order Details</h2>
        <div className="space-y-3 mb-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              {item.menu_items?.image_url && (
                <img src={item.menu_items.image_url} alt={item.menu_items?.name} className="w-12 h-12 rounded-lg object-cover" />
              )}
              <div className="flex-1">
                <p className="font-body font-medium text-foreground">{item.menu_items?.name}</p>
                <p className="text-sm text-muted-foreground font-body">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold text-foreground font-body">Rs. {item.price * item.quantity}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex justify-between text-sm font-body">
            <span className="text-muted-foreground">Branch</span>
            <span className="text-foreground">{order.branch}</span>
          </div>
          {order.delivery_address && (
            <div className="flex justify-between text-sm font-body">
              <span className="text-muted-foreground">Delivery Address</span>
              <span className="text-foreground text-right max-w-[200px]">{order.delivery_address}</span>
            </div>
          )}
          <div className="flex justify-between font-bold font-body pt-2">
            <span className="text-foreground">Total</span>
            <span className="text-primary">Rs. {order.total}</span>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-border">
          <a
            href="tel:03245531819"
            className="flex items-center justify-center gap-2 w-full py-3 bg-secondary rounded-xl text-foreground font-bold font-body hover:bg-secondary/80 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Contact Support
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderTracking;
