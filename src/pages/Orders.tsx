import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Clock, MapPin, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Order {
  id: string;
  branch: string;
  status: string;
  total: number;
  notes: string | null;
  delivery_address: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-orange-soft/20 text-primary",
  confirmed: "bg-primary/20 text-primary",
  preparing: "bg-accent/20 text-accent",
  rider_picked: "bg-blue-500/20 text-blue-400",
  delivered: "bg-green-500/20 text-green-400",
  cancelled: "bg-destructive/20 text-destructive",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  rider_picked: "On the Way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto p-10 text-center">
        <p className="text-muted-foreground font-body mb-4">Please sign in to view orders.</p>
        <Link to="/signin" className="bg-gradient-fire text-primary-foreground px-6 py-3 rounded-xl font-bold font-body">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-display font-bold text-foreground mb-8">
        My <span className="text-gradient-fire">Orders</span>
      </h1>

      {loading ? (
        <p className="text-muted-foreground font-body">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-body">No orders yet. Start ordering!</p>
          <Link to="/menu" className="inline-block mt-4 bg-gradient-fire text-primary-foreground px-6 py-3 rounded-xl font-bold font-body">
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <Link to={`/orders/${order.id}`} key={order.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-body font-bold text-foreground">Order #{order.id.slice(0, 8)}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-body mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(order.created_at).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold font-body capitalize ${statusColors[order.status] || "bg-muted text-muted-foreground"}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground font-body">
                    <MapPin className="w-3 h-3" />
                    {order.branch}
                  </div>
                  <p className="font-bold text-primary font-body">Rs. {order.total}</p>
                </div>
                {order.status !== "delivered" && order.status !== "cancelled" && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <span className="text-xs text-primary font-bold font-body">Track Order →</span>
                  </div>
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
