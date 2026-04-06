import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useStore, MenuItem } from "@/context/StoreContext";
import { Plus, Check, Coffee, UtensilsCrossed, Droplets, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type DbMenuItem = Tables<"menu_items">;

/* ── which items trigger sauce-only upsell ── */
const SAUCE_TRIGGER_NAMES = ["plain fries", "pita bread", "tortilla bread"];

/* ── which categories are "main" food (trigger beverage+addon upsell) ── */
const MAIN_FOOD_CATEGORIES = [
  "Appetizers",
  "Pouch Shawarma",
  "Shawarma Platter",
  "Turkish Wraps",
  "Turkish Doner",
  "Shawarma",
  "Doner Fries",
  "Dubai Shawaya",
];

type UpsellMode = "full" | "sauce";

interface UpsellModalProps {
  open: boolean;
  onClose: () => void;
  addedItemName: string;
  addedItemCategory: string;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const UpsellModal = ({ open, onClose, addedItemName, addedItemCategory }: UpsellModalProps) => {
  const { addToCart } = useStore();
  const [beverages, setBeverages] = useState<DbMenuItem[]>([]);
  const [addons, setAddons] = useState<DbMenuItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [allItems, setAllItems] = useState<Map<string, DbMenuItem>>(new Map());
  const [activeTab, setActiveTab] = useState<"beverages" | "addons">("beverages");

  const mode: UpsellMode = SAUCE_TRIGGER_NAMES.some((n) =>
    addedItemName.toLowerCase().includes(n)
  )
    ? "sauce"
    : "full";

  useEffect(() => {
    if (!open) {
      setSelected(new Set());
      setActiveTab("beverages");
      return;
    }
    const load = async () => {
      const cats = mode === "sauce" ? ["Add-ons"] : ["Beverages", "Add-ons"];
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .in("category", cats)
        .eq("is_available", true);
      if (data) {
        setBeverages(data.filter((i) => i.category === "Beverages"));
        if (mode === "sauce") {
          // Show only dip/sauce items
          setAddons(data.filter((i) => i.name.toLowerCase().includes("dip") || i.name.toLowerCase().includes("sauce") || i.name.toLowerCase().includes("cheese")));
        } else {
          setAddons(data.filter((i) => i.category === "Add-ons"));
        }
        const map = new Map<string, DbMenuItem>();
        data.forEach((i) => map.set(i.id, i));
        setAllItems(map);
      }
    };
    load();
  }, [open, mode]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleConfirm = () => {
    selected.forEach((id) => {
      const item = allItems.get(id);
      if (item) {
        addToCart({
          id: item.id,
          name: item.name,
          description: item.description || "",
          price: item.price,
          category: item.category,
          image: item.image_url || "/placeholder.svg",
        });
      }
    });
    onClose();
  };

  const selectedTotal = useMemo(() => {
    let t = 0;
    selected.forEach((id) => {
      const item = allItems.get(id);
      if (item) t += item.price;
    });
    return t;
  }, [selected, allItems]);

  const renderCard = (item: DbMenuItem) => {
    const isSelected = selected.has(item.id);
    return (
      <motion.button
        key={item.id}
        variants={itemVariants}
        whileTap={{ scale: 0.95 }}
        onClick={() => toggle(item.id)}
        className={`relative rounded-2xl overflow-hidden transition-all duration-300 group ${
          isSelected
            ? "ring-2 ring-accent shadow-[0_0_20px_hsl(var(--accent)/0.3)]"
            : "ring-1 ring-border/40 hover:ring-accent/50 hover:shadow-[0_0_16px_hsl(var(--accent)/0.15)]"
        }`}
      >
        {/* Selection indicator */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-accent flex items-center justify-center z-20 shadow-lg"
            >
              <Check className="w-3.5 h-3.5 text-accent-foreground" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image */}
        <div className="aspect-square overflow-hidden relative">
          <img
            src={item.image_url || "/placeholder.svg"}
            alt={item.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isSelected ? "scale-110" : "group-hover:scale-105"
            }`}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
          {!isSelected && (
            <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-accent/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="w-4 h-4 text-accent-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 bg-card/80 backdrop-blur-sm">
          <p className="font-display font-bold text-sm text-foreground truncate">{item.name}</p>
          <span className="text-xs font-display font-bold text-gradient-fire mt-0.5 block">
            Rs. {item.price}
          </span>
        </div>
      </motion.button>
    );
  };

  const headingIcon = mode === "sauce" ? <Droplets className="w-5 h-5 text-accent" /> : <Sparkles className="w-5 h-5 text-accent" />;
  const headingText = mode === "sauce" ? "Add a Sauce?" : "Make It a Meal?";
  const subText =
    mode === "sauce"
      ? <>You added <span className="text-foreground font-semibold">{addedItemName}</span>. Pick a dip to go with it!</>
      : <>You added <span className="text-foreground font-semibold">{addedItemName}</span>. Complete your meal with a drink or extra!</>;

  const showTabs = mode === "full" && beverages.length > 0 && addons.length > 0;
  const displayItems = mode === "sauce" ? addons : showTabs ? (activeTab === "beverages" ? beverages : addons) : (beverages.length > 0 ? beverages : addons);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="glass-card border-border/30 max-w-md max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Gradient header */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-b from-accent/10 to-transparent">
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
          <DialogHeader className="space-y-2">
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              {headingIcon}
              {headingText}
            </DialogTitle>
            <DialogDescription className="font-body text-muted-foreground text-sm">
              {subText}
            </DialogDescription>
          </DialogHeader>

          {/* Tabs */}
          {showTabs && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setActiveTab("beverages")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-body font-bold transition-all ${
                  activeTab === "beverages"
                    ? "bg-accent text-accent-foreground shadow-fire"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                <Coffee className="w-4 h-4" /> Drinks
              </button>
              <button
                onClick={() => setActiveTab("addons")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-body font-bold transition-all ${
                  activeTab === "addons"
                    ? "bg-accent text-accent-foreground shadow-fire"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                <UtensilsCrossed className="w-4 h-4" /> Extras
              </button>
            </div>
          )}

          {mode === "sauce" && (
            <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-accent/10 border border-accent/20">
              <Droplets className="w-4 h-4 text-accent shrink-0" />
              <span className="text-xs text-muted-foreground font-body">Pro tip: Everything tastes better with a dip! 🔥</span>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="overflow-y-auto flex-1 px-6 pb-2">
          <motion.div
            key={activeTab + mode}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-3 py-2"
          >
            {displayItems.map(renderCard)}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 border-t border-border/30 bg-card/50 backdrop-blur-sm">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl glass text-muted-foreground hover:text-foreground font-body font-bold text-sm transition-colors"
            >
              No thanks
            </button>
            <AnimatePresence>
              {selected.size > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9, width: 0 }}
                  animate={{ opacity: 1, scale: 1, width: "auto" }}
                  exit={{ opacity: 0, scale: 0.9, width: 0 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-fire text-primary-foreground font-body font-bold text-sm hover:shadow-fire transition-shadow flex items-center justify-center gap-1.5 overflow-hidden"
                >
                  Add {selected.size} · Rs. {selectedTotal}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpsellModal;
export { MAIN_FOOD_CATEGORIES, SAUCE_TRIGGER_NAMES };
