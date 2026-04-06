import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useState, useMemo, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import FoodCard from "@/components/FoodCard";

type MenuItem = Tables<"menu_items">;

const CATEGORY_ORDER = [
  "All",
  "Appetizers",
  "Shawarma Platter",
  "Turkish Wraps",
  "Turkish Doner",
  "Pouch Shawarma",
  "Shawarma",
  "Beverages",
  "Jush Desserts",
  "Add-ons",
];

// Categories that should appear at the bottom
const BOTTOM_CATEGORIES = ["Beverages", "Jush Desserts", "Add-ons"];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_available", true)
        .order("category")
        .order("name");
      if (data) {
        setMenuItems(data);
        const dbCats = new Set(data.map((i) => i.category));
        const ordered = CATEGORY_ORDER.filter((c) => c === "All" || dbCats.has(c));
        const extra = [...dbCats].filter((c) => !CATEGORY_ORDER.includes(c));
        setCategories([...ordered, ...extra]);
      }
      setLoading(false);
    };
    fetchMenu();
  }, []);

  const filtered = useMemo(() => {
    let items = menuItems;
    if (activeCategory !== "All") {
      items = items.filter((i) => i.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description && i.description.toLowerCase().includes(q))
      );
    }
    // Sort: main items first, beverages/desserts/add-ons at the bottom
    if (activeCategory === "All") {
      items = [...items].sort((a, b) => {
        const aIsBottom = BOTTOM_CATEGORIES.includes(a.category);
        const bIsBottom = BOTTOM_CATEGORIES.includes(b.category);
        if (aIsBottom && !bIsBottom) return 1;
        if (!aIsBottom && bIsBottom) return -1;
        return 0;
      });
    }
    return items;
  }, [activeCategory, searchQuery, menuItems]);

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-10">
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">
          Our <span className="text-gradient-fire">Menu</span>
        </h1>
        <p className="text-muted-foreground font-body">
          Discover our handcrafted dishes made with the finest ingredients
        </p>
      </motion.div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-8">
        <div className="flex items-center glass rounded-xl px-4 py-3 focus-within:shadow-fire transition-shadow">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-foreground placeholder:text-muted-foreground outline-none w-full font-body"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-bold font-body transition-all ${
              activeCategory === cat
                ? "bg-gradient-fire text-primary-foreground shadow-fire"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <FoodCard item={item} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground font-display text-xl">No dishes found</p>
          <p className="text-sm text-muted-foreground font-body mt-1">
            Try a different search or category
          </p>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
