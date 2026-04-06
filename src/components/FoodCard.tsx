import { Tables } from "@/integrations/supabase/types";
import { useStore } from "@/context/StoreContext";
import { Heart, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import BeverageUpsellModal from "@/components/BeverageUpsellModal";

type DbMenuItem = Tables<"menu_items">;

interface FoodCardProps {
  item: DbMenuItem;
}

const UPSELL_CATEGORIES = [
  "Appetizers",
  "Pouch Shawarma",
  "Shawarma Platter",
  "Turkish Wraps",
  "Turkish Doner",
  "Shawarma",
];

const FoodCard = ({ item }: FoodCardProps) => {
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const fav = isFavorite(item.id);
  const imageUrl = item.image_url || "/placeholder.svg";
  const [showBeverageModal, setShowBeverageModal] = useState(false);

  const handleAdd = () => {
    addToCart({
      id: item.id,
      name: item.name,
      description: item.description || "",
      price: item.price,
      category: item.category,
      image: imageUrl,
    });

    if (UPSELL_CATEGORIES.includes(item.category)) {
      setShowBeverageModal(true);
    }
  };

  return (
    <>
      <div className="group glass-card rounded-2xl overflow-hidden hover-lift">
        <div className="relative overflow-hidden aspect-square">
          <img src={imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
          <button
            onClick={() => toggleFavorite(item.id)}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              fav ? "bg-accent text-accent-foreground shadow-fire" : "glass text-muted-foreground hover:text-accent"
            }`}
          >
            <Heart className={`w-4 h-4 ${fav ? "fill-current" : ""}`} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent h-20" />
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display font-bold text-foreground truncate">{item.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 font-body">{item.description || ""}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-display font-bold text-gradient-fire">Rs. {item.price}</span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAdd}
              className="flex items-center gap-1.5 bg-gradient-fire text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-bold hover:shadow-fire transition-shadow font-body"
            >
              <Plus className="w-4 h-4" /> Add
            </motion.button>
          </div>
        </div>
      </div>

      <BeverageUpsellModal
        open={showBeverageModal}
        onClose={() => setShowBeverageModal(false)}
        addedItemName={item.name}
      />
    </>
  );
};

export default FoodCard;
