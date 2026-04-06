import CartPanel from "@/components/CartPanel";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/context/StoreContext";
import { AuthProvider } from "@/hooks/useAuth";
import About from "@/pages/About";
import Admin from "@/pages/Admin";
import BranchSelection from "@/pages/BranchSelection";
import Checkout from "@/pages/checkout";
import Contact from "@/pages/Contact";
import Favorites from "@/pages/Favorites";
import Home from "@/pages/Home";
import MenuPage from "@/pages/MenuPage";
import Orders from "@/pages/Orders";
import OrderTracking from "@/pages/OrderTracking";
import SignIn from "@/pages/signin";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const ORDER_TYPE_STORAGE_KEY = "jushh_order_type";

const OrderTypeModal = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;

    if (navigationEntry?.type === "reload") {
      sessionStorage.removeItem(ORDER_TYPE_STORAGE_KEY);
    }

    setShow(!sessionStorage.getItem(ORDER_TYPE_STORAGE_KEY));
  }, []);

  const handleSelect = (type: "delivery" | "pickup") => {
    sessionStorage.setItem(ORDER_TYPE_STORAGE_KEY, type);
    setShow(false);
  };

  return (
    <AlertDialog open={show}>
      <AlertDialogContent className="sm:max-w-md glass-card border-primary/20">
        <AlertDialogHeader className="text-center">
          <AlertDialogTitle className="text-2xl font-display font-bold text-foreground text-center">
            How would you like your order?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <button
            onClick={() => handleSelect("delivery")}
            className="flex-1 flex flex-col items-center gap-3 glass-card rounded-2xl p-6 hover:shadow-fire hover:scale-105 transition-all group"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-fire flex items-center justify-center group-hover:shadow-fire transition-shadow">
              <MapPin className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground text-lg">Delivery</span>
            <span className="text-sm text-muted-foreground font-body">We'll bring it to you</span>
          </button>
          <button
            onClick={() => handleSelect("pickup")}
            className="flex-1 flex flex-col items-center gap-3 glass-card rounded-2xl p-6 hover:shadow-fire hover:scale-105 transition-all group"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-fire flex items-center justify-center group-hover:shadow-fire transition-shadow">
              <Clock className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground text-lg">Pickup</span>
            <span className="text-sm text-muted-foreground font-body">Grab it on the go</span>
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const AppLayout = () => {
  const location = useLocation();
  const isBranchPage = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-[100dvh] w-full overflow-x-hidden">
      <Navbar />
      <OrderTypeModal />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<BranchSelection />} />
          <Route path="/home" element={<Home />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderId" element={<OrderTracking />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isBranchPage && <Footer />}
      <CartPanel />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <StoreProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </StoreProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
