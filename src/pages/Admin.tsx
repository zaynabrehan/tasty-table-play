import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronRight, Clock, Image, Loader2,
  Package, Plus, RefreshCw, Trash2, Upload,
  UtensilsCrossed, X, BarChart3, MapPin, FileText,
  Truck, Store, UserPlus, Shield,
} from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { toast } from "sonner";

type Tab = "dashboard" | "orders" | "menu" | "admins";

interface MenuItemRow {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
}

interface OrderRow {
  id: string;
  branch: string;
  status: string;
  total: number;
  notes: string | null;
  delivery_address: string | null;
  order_type: string;
  created_at: string;
  user_id: string;
}

interface OrderItemRow {
  id: string;
  quantity: number;
  price: number;
  menu_items: { name: string; image_url: string | null } | null;
}

const STATUS_FLOW = ["pending", "confirmed", "preparing", "rider_picked", "delivered"];
const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  rider_picked: "On the Way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  preparing: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  rider_picked: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  delivered: "bg-green-500/15 text-green-400 border-green-500/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [menuItems, setMenuItems] = useState<MenuItemRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);

  const [loading, setLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItemRow[]>>({});
  const [orderFilter, setOrderFilter] = useState<string>("all");

  // Menu form
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formImage, setFormImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Admin management
  const [adminEmail, setAdminEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === today);
    const pendingOrders = orders.filter((o) => o.status === "pending");
    const activeOrders = orders.filter((o) => ["confirmed", "preparing", "rider_picked"].includes(o.status));
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const pickupOrders = orders.filter((o) => o.order_type === "pickup").length;
    const deliveryOrders = orders.filter((o) => o.order_type === "delivery").length;
    return { todayOrders: todayOrders.length, pendingOrders: pendingOrders.length, activeOrders: activeOrders.length, todayRevenue, totalOrders: orders.length, pickupOrders, deliveryOrders };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") return orders;
    return orders.filter((o) => o.status === orderFilter);
  }, [orders, orderFilter]);

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("menu-images").upload(fileName, file);
    if (error) { toast.error("Image upload failed"); return null; }
    const { data: urlData } = supabase.storage.from("menu-images").getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleFormImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) setFormImage(url);
    setUploading(false);
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditingImageId(itemId);
    const url = await uploadImage(file);
    if (url) {
      const { error } = await supabase.from("menu_items").update({ image_url: url }).eq("id", itemId);
      if (error) toast.error("Failed to update image");
      else { toast.success("Image updated!"); fetchData(); }
    }
    setEditingImageId(null);
  };

  const fetchData = async () => {
    setLoading(true);
    const [menuRes, ordersRes] = await Promise.all([
      supabase.from("menu_items").select("*").order("category").order("name"),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);
    setMenuItems(menuRes.data || []);
    setOrders((ordersRes.data as OrderRow[]) || []);
    setLoading(false);
  };

  const fetchOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) return;
    const { data } = await supabase
      .from("order_items")
      .select("*, menu_items(name, image_url)")
      .eq("order_id", orderId);
    setOrderItems((prev) => ({ ...prev, [orderId]: (data as OrderItemRow[]) || [] }));
  };

  const toggleOrderExpand = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      fetchOrderItems(orderId);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  if (authLoading) return <div className="container mx-auto p-10 text-center text-muted-foreground font-body">Loading...</div>;
  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto p-10 text-center">
        <p className="text-destructive font-body font-bold text-xl">Access Denied</p>
        <p className="text-muted-foreground font-body mt-2">You need admin privileges to access this page.</p>
      </div>
    );
  }

  const addMenuItem = async () => {
    if (!formName || !formPrice || !formCategory) { toast.error("Name, price, and category are required"); return; }
    setSaving(true);
    const { error } = await supabase.from("menu_items").insert({
      name: formName.trim(), description: formDesc.trim() || null,
      price: parseFloat(formPrice), category: formCategory.trim(),
      image_url: formImage.trim() || null,
    });
    setSaving(false);
    if (error) { toast.error("Failed to add item"); }
    else {
      toast.success("Menu item added!");
      setFormName(""); setFormDesc(""); setFormPrice(""); setFormCategory(""); setFormImage("");
      setShowForm(false); fetchData();
    }
  };

  const deleteMenuItem = async (id: string) => {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) toast.error("Failed to delete"); else { toast.success("Deleted"); fetchData(); }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await supabase.from("menu_items").update({ is_available: !current }).eq("id", id);
    fetchData();
  };

  const advanceOrderStatus = async (order: OrderRow) => {
    const currentIdx = STATUS_FLOW.indexOf(order.status);
    if (currentIdx < 0 || currentIdx >= STATUS_FLOW.length - 1) return;
    const nextStatus = STATUS_FLOW[currentIdx + 1];
    const { error } = await supabase.from("orders").update({ status: nextStatus }).eq("id", order.id);
    if (error) toast.error("Failed to update status");
    else toast.success(`Order → ${STATUS_LABELS[nextStatus]}`);
    fetchData();
  };

  const cancelOrder = async (id: string) => {
    const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", id);
    if (error) toast.error("Failed to cancel"); else toast.success("Order cancelled");
    fetchData();
  };

  const handleAddAdmin = async () => {
    if (!adminEmail.trim()) { toast.error("Please enter an email"); return; }
    setAddingAdmin(true);

    // Look up user by email in profiles
    const { data: profiles, error: profileErr } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .limit(1000);

    if (profileErr) {
      toast.error("Failed to search users");
      setAddingAdmin(false);
      return;
    }

    // We need to find user by email - use auth admin or check via a different approach
    // Since we can't query auth.users directly, we'll use the edge function approach
    // For now, let's use supabase rpc or direct lookup
    const { data: userData, error: userError } = await supabase.rpc("has_role", { _user_id: "00000000-0000-0000-0000-000000000000", _role: "admin" });

    // Try to find user by inserting with email lookup via auth
    // Actually, we need to look up by email. Let's query via an edge function or use profiles.
    // Simplified: ask admin to provide user ID or use email from auth metadata
    
    // Let's try a simpler approach - use supabase auth admin api via edge function
    toast.error("To add an admin, please provide the user's UUID. Contact support for email-based lookup.");
    setAddingAdmin(false);
  };

  const handleAddAdminByUuid = async (userId: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error) {
      if (error.code === "23505") toast.error("User is already an admin");
      else toast.error("Failed to add admin: " + error.message);
    } else {
      toast.success("Admin added successfully!");
      setAdminEmail("");
    }
  };

  const tabs = [
    { key: "dashboard" as Tab, label: "Dashboard", icon: BarChart3 },
    { key: "orders" as Tab, label: "Orders", icon: Package, badge: stats.pendingOrders },
    { key: "menu" as Tab, label: "Menu", icon: UtensilsCrossed },
    { key: "admins" as Tab, label: "Admin Users", icon: Shield },
  ];

  const inputClass = "w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground font-body placeholder:text-muted-foreground outline-none focus:border-primary focus:shadow-fire transition-all";

  const getNextStatusLabel = (status: string) => {
    const idx = STATUS_FLOW.indexOf(status);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return null;
    return STATUS_LABELS[STATUS_FLOW[idx + 1]];
  };

  const getOrderTypeIcon = (orderType: string) => {
    return orderType === "pickup" ? <Store className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />;
  };

  const getOrderTypeLabel = (orderType: string) => {
    return orderType === "pickup" ? "Pickup" : "Delivery";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Admin <span className="text-gradient-fire">Panel</span>
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-1">Manage your restaurant</p>
        </div>
        <button onClick={fetchData} disabled={loading} className="p-3 rounded-xl glass text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map(({ key, label, icon: Icon, badge }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-body font-bold text-sm transition-all whitespace-nowrap ${
              tab === key ? "bg-gradient-fire text-primary-foreground shadow-fire" : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
            {badge ? (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
                {badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          {/* ============ DASHBOARD ============ */}
          {tab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { label: "Today's Orders", value: stats.todayOrders, icon: Package, color: "text-blue-400" },
                  { label: "Pending", value: stats.pendingOrders, icon: Clock, color: "text-yellow-400" },
                  { label: "Active", value: stats.activeOrders, icon: RefreshCw, color: "text-orange-400" },
                  { label: "Delivery", value: stats.deliveryOrders, icon: Truck, color: "text-purple-400" },
                  { label: "Pickup", value: stats.pickupOrders, icon: Store, color: "text-green-400" },
                ].map((stat) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground font-body mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Today's Revenue */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-green-400">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-body">Today's Revenue</p>
                    <p className="text-2xl font-display font-bold text-foreground">Rs. {stats.todayRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Recent pending orders quick view */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="font-bold text-foreground font-body mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" /> Pending Orders
                </h2>
                {orders.filter((o) => o.status === "pending").length === 0 ? (
                  <p className="text-muted-foreground font-body text-sm">No pending orders 🎉</p>
                ) : (
                  <div className="space-y-3">
                    {orders.filter((o) => o.status === "pending").slice(0, 5).map((o) => (
                      <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-body font-bold text-foreground text-sm">#{o.id.slice(0, 8)}</p>
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold font-body ${
                              o.order_type === "pickup" ? "bg-green-500/15 text-green-400" : "bg-purple-500/15 text-purple-400"
                            }`}>
                              {getOrderTypeIcon(o.order_type)} {getOrderTypeLabel(o.order_type)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground font-body">{o.branch} • Rs. {o.total}</p>
                        </div>
                        <button
                          onClick={() => advanceOrderStatus(o)}
                          className="px-4 py-2 rounded-xl bg-gradient-fire text-primary-foreground text-xs font-bold font-body hover:shadow-fire transition-all"
                        >
                          Confirm →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============ ORDERS ============ */}
          {tab === "orders" && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {["all", ...STATUS_FLOW, "cancelled"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setOrderFilter(s)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-body capitalize whitespace-nowrap transition-all ${
                      orderFilter === s
                        ? "bg-gradient-fire text-primary-foreground shadow-fire"
                        : "glass text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s === "all" ? `All (${orders.length})` : `${STATUS_LABELS[s] || s} (${orders.filter((o) => o.status === s).length})`}
                  </button>
                ))}
              </div>

              {filteredOrders.length === 0 ? (
                <p className="text-muted-foreground font-body text-center py-10">No orders found.</p>
              ) : (
                filteredOrders.map((o) => (
                  <motion.div key={o.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl overflow-hidden">
                    {/* Order Header */}
                    <button
                      onClick={() => toggleOrderExpand(o.id)}
                      className="w-full p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3 text-left hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <p className="font-body font-bold text-foreground text-sm">#{o.id.slice(0, 8)}</p>
                          <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold font-body border ${STATUS_COLORS[o.status] || "glass text-muted-foreground"}`}>
                            {STATUS_LABELS[o.status] || o.status}
                          </span>
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold font-body ${
                            o.order_type === "pickup" ? "bg-green-500/15 text-green-400 border border-green-500/30" : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                          }`}>
                            {getOrderTypeIcon(o.order_type)} {getOrderTypeLabel(o.order_type)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground font-body">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {o.branch}</span>
                          <span>Rs. {o.total}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(o.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {o.status !== "delivered" && o.status !== "cancelled" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); advanceOrderStatus(o); }}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-fire text-primary-foreground text-xs font-bold font-body hover:shadow-fire transition-all whitespace-nowrap"
                          >
                            {getNextStatusLabel(o.status)} →
                          </button>
                        )}
                        {expandedOrder === o.id ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                      </div>
                    </button>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedOrder === o.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                            {/* Order Type Badge */}
                            <div className="p-3 rounded-xl bg-secondary/50">
                              <p className="text-xs font-bold text-muted-foreground font-body uppercase tracking-wider mb-1 flex items-center gap-1">
                                {getOrderTypeIcon(o.order_type)} Order Type
                              </p>
                              <p className="text-sm text-foreground font-body font-bold">{getOrderTypeLabel(o.order_type)}</p>
                            </div>

                            {/* Order Items */}
                            <div>
                              <p className="text-xs font-bold text-muted-foreground font-body uppercase tracking-wider mb-2">Order Items</p>
                              {orderItems[o.id] ? (
                                <div className="space-y-2">
                                  {orderItems[o.id].map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl bg-secondary/50">
                                      {item.menu_items?.image_url && (
                                        <img src={item.menu_items.image_url} alt={item.menu_items?.name || ""} className="w-10 h-10 rounded-lg object-cover" />
                                      )}
                                      <div className="flex-1">
                                        <p className="font-body text-sm font-medium text-foreground">{item.menu_items?.name}</p>
                                        <p className="text-xs text-muted-foreground font-body">Qty: {item.quantity}</p>
                                      </div>
                                      <p className="font-body font-bold text-foreground text-sm">Rs. {item.price * item.quantity}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-muted-foreground text-sm font-body">
                                  <Loader2 className="w-4 h-4 animate-spin" /> Loading items...
                                </div>
                              )}
                            </div>

                            {/* Customer Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {o.delivery_address && (
                                <div className="p-3 rounded-xl bg-secondary/50">
                                  <p className="text-xs font-bold text-muted-foreground font-body uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> Delivery Address
                                  </p>
                                  <p className="text-sm text-foreground font-body">{o.delivery_address}</p>
                                </div>
                              )}
                              {o.notes && (
                                <div className="p-3 rounded-xl bg-secondary/50">
                                  <p className="text-xs font-bold text-muted-foreground font-body uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> Notes
                                  </p>
                                  <p className="text-sm text-foreground font-body italic">{o.notes}</p>
                                </div>
                              )}
                            </div>

                            {/* Status Actions */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs font-bold text-muted-foreground font-body uppercase tracking-wider mr-2">Set Status:</p>
                              {[...STATUS_FLOW, "cancelled"].map((s) => (
                                <button
                                  key={s}
                                  onClick={() => {
                                    supabase.from("orders").update({ status: s }).eq("id", o.id).then(() => {
                                      toast.success(`Order → ${STATUS_LABELS[s]}`);
                                      fetchData();
                                    });
                                  }}
                                  disabled={o.status === s}
                                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold font-body capitalize transition-all border ${
                                    o.status === s
                                      ? STATUS_COLORS[s]
                                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                                  }`}
                                >
                                  {STATUS_LABELS[s]}
                                </button>
                              ))}
                            </div>

                            {/* Cancel */}
                            {o.status !== "delivered" && o.status !== "cancelled" && (
                              <button
                                onClick={() => cancelOrder(o.id)}
                                className="flex items-center gap-1 text-xs text-destructive font-body font-bold hover:underline"
                              >
                                <X className="w-3 h-3" /> Cancel Order
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* ============ MENU ============ */}
          {tab === "menu" && (
            <div>
              <button onClick={() => setShowForm(!showForm)} className="mb-6 flex items-center gap-2 bg-gradient-fire text-primary-foreground px-5 py-2.5 rounded-xl font-bold font-body hover:shadow-fire transition-all">
                <Plus className="w-4 h-4" /> Add Menu Item
              </button>

              <AnimatePresence>
                {showForm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="glass-card rounded-2xl p-6 mb-6 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Item name" className={inputClass} maxLength={100} />
                        <input value={formCategory} onChange={(e) => setFormCategory(e.target.value)} placeholder="Category" className={inputClass} maxLength={50} />
                      </div>
                      <input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Description" className={inputClass} maxLength={300} />
                      <input value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="Price (e.g. 750)" type="number" className={inputClass} />
                      <div className="flex items-center gap-3">
                        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFormImageUpload} />
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border bg-secondary text-muted-foreground font-body hover:border-primary hover:text-foreground transition-all disabled:opacity-50">
                          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {uploading ? "Uploading..." : "Upload Image"}
                        </button>
                        {formImage && <img src={formImage} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={addMenuItem} disabled={saving} className="bg-gradient-fire text-primary-foreground px-6 py-2.5 rounded-xl font-bold font-body disabled:opacity-50 flex items-center gap-2">
                          {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
                        </button>
                        <button onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl glass text-muted-foreground font-body font-bold hover:text-foreground transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <input type="file" ref={editFileInputRef} accept="image/*" className="hidden" onChange={(e) => editingImageId && handleEditImageUpload(e, editingImageId)} />
              <div className="space-y-3">
                {menuItems.map((item) => (
                  <div key={item.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
                    <div className="relative group flex-shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                          <Image className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <button
                        onClick={() => { setEditingImageId(item.id); editFileInputRef.current?.click(); }}
                        disabled={editingImageId === item.id}
                        className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        {editingImageId === item.id ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Upload className="w-4 h-4 text-white" />}
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-bold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-body">{item.category} • Rs. {item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleAvailability(item.id, item.is_available)} className={`px-3 py-1 rounded-lg text-xs font-bold font-body ${item.is_available ? "bg-green-500/20 text-green-400" : "bg-destructive/20 text-destructive"}`}>
                        {item.is_available ? "Available" : "Unavailable"}
                      </button>
                      <button onClick={() => deleteMenuItem(item.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ ADMIN USERS ============ */}
          {tab === "admins" && (
            <AdminUsersTab />
          )}
        </>
      )}
    </div>
  );
};

// Separate component for admin user management
const AdminUsersTab = () => {
  const [adminEmail, setAdminEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminUsers, setAdminUsers] = useState<{ user_id: string; role: string; full_name: string | null }[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  const inputClass = "w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground font-body placeholder:text-muted-foreground outline-none focus:border-primary focus:shadow-fire transition-all";

  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    if (roles) {
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name");
      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p.full_name]));
      setAdminUsers(
        roles.map((r) => ({
          user_id: r.user_id,
          role: r.role,
          full_name: profileMap.get(r.user_id) || null,
        }))
      );
    }
    setLoadingAdmins(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdminByEmail = async () => {
    if (!adminEmail.trim()) { toast.error("Please enter a valid email"); return; }
    setAddingAdmin(true);

    // We need an edge function to look up user by email
    // For now, let's use a workaround: the admin can enter the user_id directly
    // or we create an edge function

    // Try to find by checking profiles - but profiles don't have email
    // We'll create an edge function for this
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/add-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ email: adminEmail.trim() }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to add admin");
      } else {
        toast.success(`${adminEmail} has been granted admin access!`);
        setAdminEmail("");
        fetchAdmins();
      }
    } catch {
      toast.error("Failed to connect to server");
    }
    setAddingAdmin(false);
  };

  const handleRemoveAdmin = async (userId: string) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/add-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId, action: "remove" }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to remove admin");
      } else {
        toast.success("Admin access removed");
        fetchAdmins();
      }
    } catch {
      toast.error("Failed to connect to server");
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-bold text-foreground font-body mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-primary" /> Add New Admin
        </h2>
        <p className="text-sm text-muted-foreground font-body mb-4">
          Enter the email address of a registered user to grant them admin access.
        </p>
        <div className="flex gap-3">
          <input
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="user@example.com"
            type="email"
            className={inputClass}
          />
          <button
            onClick={handleAddAdminByEmail}
            disabled={addingAdmin}
            className="px-6 py-3 rounded-xl bg-gradient-fire text-primary-foreground font-bold font-body hover:shadow-fire transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
          >
            {addingAdmin ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Add Admin
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-bold text-foreground font-body mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Current Admin Users
        </h2>
        {loadingAdmins ? (
          <div className="flex items-center gap-2 text-muted-foreground font-body">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
          </div>
        ) : adminUsers.length === 0 ? (
          <p className="text-muted-foreground font-body text-sm">No admin users found.</p>
        ) : (
          <div className="space-y-3">
            {adminUsers.map((admin) => (
              <div key={admin.user_id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div>
                  <p className="font-body font-bold text-foreground text-sm">{admin.full_name || "Unknown User"}</p>
                  <p className="text-xs text-muted-foreground font-body">ID: {admin.user_id.slice(0, 12)}... • Role: {admin.role}</p>
                </div>
                <button
                  onClick={() => handleRemoveAdmin(admin.user_id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold font-body text-destructive border border-destructive/30 hover:bg-destructive/10 transition-all"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
