import jushhLogo from "@/assets/jushh-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/context/StoreContext";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Heart, LogOut, MapPin, Menu, Phone, ShoppingCart, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import CartPanel from "./CartPanel";
import JushhLogo from "./JushhLogo";

const Navbar = () => {
  const { cartCount, branch, openCart } = useStore();
  const { user, isAdmin, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { to: "/home", label: "Home" },
    { to: "/menu", label: "Menu" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  if (!branch && location.pathname === "/") return null;

  const handleSignOut = async () => {
    setShowLogoutDialog(false);
    await signOut();
    toast.success("You have been logged out successfully!");
    navigate("/home");
  };

  return (
    <>
      {/* Top Bar - Timings */}
      <div className="bg-primary/10 border-b border-border">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-body">
            <Clock className="w-3.5 h-3.5 inline mr-1 text-primary" />
            Mon–Thu: 12 PM – 2 AM &nbsp;|&nbsp; Fri–Sun: 3 PM – 2 AM
          </span>
          <div className="flex items-center gap-4">
            <a href="tel:03269946142" className="flex items-center gap-1 text-primary hover:text-orange-light transition-colors">
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">0326 9946142</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className={`sticky top-0 z-50 border-b border-border transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md shadow-card" : "bg-background/80 backdrop-blur-sm"}`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/home" className="flex-shrink-0 flex items-center gap-2">
            <div className="w-9 h-9 rounded-full overflow-hidden">
              <img src={jushhLogo} alt="Jushh!! Logo" className="w-full h-full object-cover" />
            </div>
            <JushhLogo size="sm" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-sm font-medium transition-colors hover:text-primary ${isActive(link.to) ? "text-primary" : "text-muted-foreground"}`}
              >
                {link.label}
                {isActive(link.to) && (
                  <motion.div layoutId="nav-underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-fire rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {branch && (
              <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground glass px-2.5 py-1.5 rounded-lg">
                <MapPin className="w-3 h-3 text-primary" /> {branch}
              </div>
            )}

            <Link to="/favorites" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
              <Heart className="w-5 h-5" />
            </Link>

            <button onClick={openCart} className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5 bg-gradient-fire text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setShowLogoutDialog(true)} className="p-2 text-muted-foreground hover:text-destructive transition-colors" title="Sign out">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/signin" className="flex items-center gap-1 text-sm font-body font-medium text-primary hover:text-accent transition-colors">
                <User className="w-4 h-4" /> Sign In
              </Link>
            )}

            <button className="md:hidden p-2 text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden border-t border-border bg-background overflow-hidden">
              <div className="container mx-auto px-4 py-4 space-y-3">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to} onClick={() => setIsMobileMenuOpen(false)} className={`block py-2 text-sm font-medium transition-colors ${isActive(link.to) ? "text-primary" : "text-muted-foreground"}`}>
                    {link.label}
                  </Link>
                ))}
                {!user && (
                  <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-primary">
                    Sign In
                  </Link>
                )}
                {user && (
                  <button onClick={() => { setShowLogoutDialog(true); setIsMobileMenuOpen(false); }} className="block py-2 text-sm font-medium text-destructive">
                    Sign Out
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <CartPanel />

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Do you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to place orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Navbar;
