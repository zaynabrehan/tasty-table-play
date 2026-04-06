import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useStore } from "@/context/StoreContext";
import FoodCard from "@/components/FoodCard";
import { motion } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type MenuItem = Tables<"menu_items">;

const Favorites = () => {
  const { favorites } = useStore();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (favorites.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .in("id", favorites);
      setItems(data || []);
      setLoading(false);
    };
    fetchFavorites();
  }, [favorites]);

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">
          Your <span className="text-gradient-fire">Favorites</span>
        </h1>
        <p className="text-muted-foreground font-body">Dishes you've saved for later</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <FoodCard item={item} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-display text-xl">No favorites yet</p>
          <p className="text-sm text-muted-foreground font-body mt-1 mb-6">Tap the heart icon on any dish to save it here</p>
          <Link to="/menu" className="inline-flex bg-gradient-fire text-primary-foreground px-6 py-3 rounded-xl font-bold font-body hover:shadow-fire transition-all">
            Browse Menu
          </Link>
        </div>
      )}
    </div>
  );
};

export default Favorites;
