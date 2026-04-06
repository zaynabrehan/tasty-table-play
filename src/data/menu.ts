import { MenuItem } from "@/context/StoreContext";

/* DONER FRIES IMAGES */
import beefDonerFriesImage from "@/assets/beeffries.jpg";
import chickenDonerFriesImage from "@/assets/chickenfries.jpg";

import foodShawayaRice from "@/assets/abc.jpg";
import foodTurkishDonerBeef from "@/assets/beefdoner2.jpg";
import foodTurkishWrapBeef from "@/assets/beefwrap2.jpg";
import foodTurkishDonerChicken from "@/assets/chickendoner2.jpg";
import foodTurkishWrapChicken from "@/assets/chickenwrap.jpg";

import foodPouchShawarmaBeef from "@/assets/beefpouch.jpg";
import foodPouchShawarmaChicken from "@/assets/chickenpouch.jpg";

import foodShawarmaBeef from "@/assets/beefshawarma.jpg";
import foodShawarmaChicken from "@/assets/chickenshawarma.jpg";

import greenAppleMojitoImage from "@/assets/apple.jpg";
import blueberryMojitoImage from "@/assets/blue.jpg";

import lemonMojitoImage from "@/assets/lemon.jpg";
import peachMojitoImage from "@/assets/peach3.jpg";
import softDrinkImage from "@/assets/soft.jpg";
import strawberryMojitoImage from "@/assets/straw.jpg";
import waterImage from "@/assets/water.jpg";

import foodShawarmaPlatterCheese from "@/assets/chplattercheese.jpg";
import foodShawaya from "@/assets/food-shawaya.jpg";
import foodShawarmaPlatterSimple from "@/assets/simpleplatter.jpg";

/* Dessert Images */
import lotusDessert from "@/assets/lotus.jpg";
import nutellaDessert from "@/assets/nutella.jpg";
import redVelvetDessert from "@/assets/redvelvet.jpg";

/* Add-ons */
import extraCheeseImage from "@/assets/cheese.jpg";
import dipImage from "@/assets/dipsauce.jpg";
import pitaBreadImage from "@/assets/pita2.jpg";
import plainFriesImage from "@/assets/plainfries.jpg";
import tortillaBreadImage from "@/assets/tor.jpg";

export const menuItems: MenuItem[] = [

  // Doner Fries
  {
    id: "1",
    name: "Doner Fries – Chicken",
    description: "Crispy fries loaded with seasoned chicken doner, drizzled with signature sauces",
    price: 600,
    category: "Doner Fries",
    image: chickenDonerFriesImage,
  },
  {
    id: "2",
    name: "Doner Fries – Beef",
    description: "Crispy fries topped with juicy beef doner and our special sauce blend",
    price: 750,
    category: "Doner Fries",
    image: beefDonerFriesImage,
  },

  // Dubai Shawaya
  {
    id: "3",
    name: "Half Shawaya",
    description: "Half portion of our signature Dubai-style rotisserie chicken, marinated and grilled",
    price: 1400,
    category: "Dubai Shawaya",
    image: foodShawaya,
  },
  {
    id: "4",
    name: "Full Shawaya",
    description: "Full Dubai-style rotisserie chicken, perfectly marinated and slow-grilled",
    price: 2500,
    category: "Dubai Shawaya",
    image: foodShawaya,
  },
  {
    id: "5",
    name: "Half Shawaya + Rice",
    description: "Half shawaya served with a generous portion of flavored rice",
    price: 1600,
    category: "Dubai Shawaya",
    image: foodShawayaRice,
  },
  {
    id: "6",
    name: "Full Shawaya + Rice",
    description: "Full shawaya served with a large portion of flavored rice",
    price: 2700,
    category: "Dubai Shawaya",
    image: foodShawayaRice,
  },

  // Shawarma Platter
  {
    id: "7",
    name: "CH Platter",
    description: "Generous shawarma platter with sliced meat, pickles, garlic sauce, and flatbread",
    price: 900,
    category: "Shawarma Platter",
    image: foodShawarmaPlatterSimple,
  },
  {
    id: "8",
    name: "CH Platter – With Cheese",
    description: "Our signature shawarma platter topped with melted cheese and sauces",
    price: 1000,
    category: "Shawarma Platter",
    image: foodShawarmaPlatterCheese,
  },

  // Turkish Wraps
  {
    id: "9",
    name: "Turkish Wrap – Chicken",
    description: "Grilled chicken wrapped in warm Turkish flatbread with fresh veggies and sauce",
    price: 600,
    category: "Turkish Wraps",
    image: foodTurkishWrapChicken,
  },
  {
    id: "10",
    name: "Turkish Wrap – Beef",
    description: "Tender beef wrapped in Turkish flatbread with fresh vegetables and garlic sauce",
    price: 900,
    category: "Turkish Wraps",
    image: foodTurkishWrapBeef,
  },

  // Turkish Doner
  {
    id: "11",
    name: "Turkish Doner – Chicken",
    description: "Classic Turkish doner sandwich with seasoned chicken, veggies, and sauce",
    price: 850,
    category: "Turkish Doner",
    image: foodTurkishDonerChicken,
  },
  {
    id: "12",
    name: "Turkish Doner – Beef",
    description: "Authentic Turkish doner with juicy beef, fresh toppings, and signature sauce",
    price: 1100,
    category: "Turkish Doner",
    image: foodTurkishDonerBeef,
  },

  // Pouch Shawarma
  {
    id: "13",
    name: "Pouch Shawarma – Chicken",
    description: "Chicken shawarma wrapped in a crispy pouch with garlic sauce and pickles",
    price: 450,
    category: "Pouch Shawarma",
    image: foodPouchShawarmaChicken,
  },
  {
    id: "14",
    name: "Pouch Shawarma – Beef",
    description: "Beef shawarma in a crispy pouch with our special sauce blend",
    price: 700,
    category: "Pouch Shawarma",
    image: foodPouchShawarmaBeef,
  },

  // Shawarma
  {
    id: "15",
    name: "Shawarma – Chicken",
    description: "Classic chicken shawarma wrap with garlic sauce, pickles, and fresh veggies",
    price: 550,
    category: "Shawarma",
    image: foodShawarmaChicken,
  },
  {
    id: "16",
    name: "Shawarma – Beef",
    description: "Premium beef shawarma wrap with signature sauces and fresh toppings",
    price: 750,
    category: "Shawarma",
    image: foodShawarmaBeef,
  },

  // Beverages
  {
    id: "17",
    name: "Water",
    description: "Mineral water bottle",
    price: 80,
    category: "Beverages",
    image: waterImage,
  },
  {
    id: "18",
    name: "Soft Drink",
    description: "Chilled carbonated soft drink",
    price: 150,
    category: "Beverages",
    image: softDrinkImage,
  },
  {
    id: "19",
    name: "Blueberry Mojito",
    description: "Refreshing blueberry flavored mojito with crushed ice",
    price: 290,
    category: "Beverages",
    image: blueberryMojitoImage,
  },
  {
    id: "20",
    name: "Strawberry Mojito",
    description: "Sweet strawberry mojito with fresh mint and crushed ice",
    price: 290,
    category: "Beverages",
    image: strawberryMojitoImage,
  },
  {
    id: "21",
    name: "Green Apple Mojito",
    description: "Tangy green apple mojito with a refreshing twist",
    price: 290,
    category: "Beverages",
    image: greenAppleMojitoImage,
  },
  {
    id: "22",
    name: "Peach Mojito",
    description: "Smooth peach flavored mojito, perfectly chilled",
    price: 290,
    category: "Beverages",
    image: peachMojitoImage,
  },
  {
    id: "23",
    name: "Lemon Mojito",
    description: "Classic lemon mojito with fresh mint leaves and ice",
    price: 290,
    category: "Beverages",
    image: lemonMojitoImage,
  },

  // Desserts
  {
    id: "24",
    name: "Lotus Can",
    description: "Layered lotus biscoff cream dessert in a can, topped with crushed biscuits",
    price: 1000,
    category: "Jushhpk Desserts",
    image: lotusDessert,
  },
  {
    id: "25",
    name: "Red Velvet Can",
    description: "Rich red velvet cream dessert layered in a can with cream cheese frosting",
    price: 1000,
    category: "Jushhpk Desserts",
    image: redVelvetDessert,
  },
  {
    id: "26",
    name: "Nutella Can",
    description: "Indulgent Nutella cream dessert in a can with hazelnut crumble",
    price: 1000,
    category: "Jushhpk Desserts",
    image: nutellaDessert,
  },

  // Add-ons
  {
    id: "27",
    name: "Extra Cheese",
    description: "Add a generous portion of melted cheese to any item",
    price: 90,
    category: "Add-ons",
    image: extraCheeseImage,
  },
  {
    id: "28",
    name: "Dip",
    description: "Choice of garlic, chili, or signature dipping sauce",
    price: 90,
    category: "Add-ons",
    image: dipImage,
  },
  {
    id: "29",
    name: "Tortilla Bread",
    description: "Warm soft tortilla bread on the side",
    price: 90,
    category: "Add-ons",
    image: tortillaBreadImage,
  },
  {
    id: "30",
    name: "Pita Bread",
    description: "Fresh baked pita bread, warm and fluffy",
    price: 60,
    category: "Add-ons",
    image: pitaBreadImage,
  },
  {
    id: "31",
    name: "Plain Fries",
    description: "Golden crispy plain french fries",
    price: 150,
    category: "Add-ons",
    image: plainFriesImage,
  },
];

export const categories = [
  "All",
  "Doner Fries",
  "Dubai Shawaya",
  "Shawarma Platter",
  "Turkish Wraps",
  "Turkish Doner",
  "Pouch Shawarma",
  "Shawarma",
  "Beverages",
  "Jushhpk Desserts",
  "Add-ons",
];