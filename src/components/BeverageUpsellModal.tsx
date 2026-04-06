import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useStore, MenuItem } from "@/context/StoreContext";
import { Plus, Check, Coffee, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";

type DbMenuItem = Tables<"menu_items">;

interface BeverageUpsellModalProps {
  open: boolean;
  onClose: () => void;
  addedItemName: string;
}

const BeverageUpsellModal = ({ open, onClose, addedItemName }: BeverageUpsellModalProps) => {
  const { addToCart } = useStore();
  const [beverages, setBeverages] = useState<DbMenuItem[]>([]);
  const [addons, setAddons] = useState<DbMenuItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [allItems, setAllItems] = useState<Map<string, DbMenuItem>>(new Map());

  useEffect(() => {
    if (!open) {
      setSelected(new Set());
      return;
    }
    const fetch = async () => {
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .in("category", ["Beverages", "Add-ons"])
        .eq("is_available", true);
      if (data) {
        const bevs = data.filter((i) => i.category === "Beverages");
        const adds = data.filter((i) => i.category === "Add-ons");
        setBeverages(bevs);
        setAddons(adds);
        const map = new Map<string, DbMenuItem>();
        data.forEach((i) => map.set(i.id, i));
        setAllItems(map);
      }
    };
    fetch();
  }, [open]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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

  const renderGrid = (items: DbMenuItem[]) => (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const isSelected = selected.has(item.id);
        return (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggle(item.id)}
            className={`glass rounded-xl p-3 text-left transition-all group relative ${isSelected ? "ring-2 ring-accent shadow-fire" : "hover:shadow-fire"}`}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center z-10">
                <Check className="w-3 h-3 text-accent-foreground" />
              </div>
            )}
            <div className="aspect-square rounded-lg overflow-hidden mb-2">
              <img
                src={item.image_url || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <p className="font-display font-bold text-sm text-foreground truncate">{item.name}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-display font-bold text-gradient-fire">Rs. {item.price}</span>
              {!isSelected && <Plus className="w-4 h-4 text-accent" />}
            </div>
          </motion.button>
        );
      })}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="glass-card border-border/50 max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Coffee className="w-5 h-5 text-accent" />
            Enhance Your Order?
          </DialogTitle>
          <DialogDescription className="font-body text-muted-foreground">
            You added <span className="text-foreground font-semibold">{addedItemName}</span>. Add a drink or extra?
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-1 flex-1 space-y-4 mt-2">
          {beverages.length > 0 && (
            <div>
              <h4 className="font-display font-bold text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                <Coffee className="w-4 h-4" /> Beverages
              </h4>
              {renderGrid(beverages)}
            </div>
          )}
          {addons.length > 0 && (
            <div>
              <h4 className="font-display font-bold text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                <UtensilsCrossed className="w-4 h-4" /> Add-ons
              </h4>
              {renderGrid(addons)}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl glass text-muted-foreground hover:text-foreground font-body font-bold text-sm transition-colors"
          >
            Skip
          </button>
          {selected.size > 0 && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-xl bg-gradient-fire text-primary-foreground font-body font-bold text-sm hover:shadow-fire transition-shadow"
            >
              Add {selected.size} item{selected.size > 1 ? "s" : ""}
            </motion.button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BeverageUpsellModal;
