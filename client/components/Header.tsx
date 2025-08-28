import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  Heart,
  Apple,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/useLanguage";
import { useCart } from "@/hooks/useCart";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-2 text-sm text-muted-foreground border-b border-border/50">
          <div className="flex items-center gap-4">
            <span>
              {language === "en"
                ? "Free delivery on orders over $50"
                : "Miễn phí giao hàng cho đơn hàng trên $50"}
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">
              {language === "en"
                ? "Fresh daily delivery"
                : "Giao hàng tươi hàng ngày"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              className={`hover:text-foreground transition-colors ${language === "en" ? "text-foreground font-medium" : ""}`}
              onClick={() => setLanguage("en")}
            >
              EN
            </button>
            <span>|</span>
            <button
              className={`hover:text-foreground transition-colors ${language === "vi" ? "text-foreground font-medium" : ""}`}
              onClick={() => setLanguage("vi")}
            >
              VI
            </button>
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold text-primary"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-fresh-green rounded-full">
              <Apple className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-fresh-green to-fresh-lime bg-clip-text text-transparent">
              Minh Phát
            </span>
          </Link>

          {/* Search bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search for fresh fruits, vegetables..."
                className="pl-10 pr-4 py-2 bg-secondary/50 border-secondary focus:bg-background"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Search - Mobile */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="w-5 h-5" />
            </Button>

            {/* User account */}
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <User className="w-5 h-5" />
            </Button>

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex relative"
            >
              <Heart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-fresh-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Admin Panel */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex"
              asChild
            >
              <Link to="/admin">
                <Users className="w-5 h-5" />
              </Link>
            </Button>

            {/* Shopping cart */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/cart">
                <ShoppingCart className="w-5 h-5" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>
            </Button>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center justify-between py-3">
          <div className="flex items-center gap-8">
            <Link
              to="/fruits"
              className="text-foreground hover:text-primary font-medium transition-colors"
            >
              {language === "en" ? "Fruits" : "Trái cây"}
            </Link>
            <Link
              to="/vegetables"
              className="text-foreground hover:text-primary font-medium transition-colors"
            >
              {language === "en" ? "Vegetables" : "Rau củ"}
            </Link>
            <Link
              to="/organic"
              className="text-foreground hover:text-primary font-medium transition-colors"
            >
              {language === "en" ? "Organic" : "Hữu cơ"}
            </Link>
            <Link
              to="/seasonal"
              className="text-foreground hover:text-primary font-medium transition-colors"
            >
              {language === "en" ? "Seasonal" : "Theo mùa"}
            </Link>
            <Link
              to="/bundles"
              className="text-foreground hover:text-primary font-medium transition-colors"
            >
              {language === "en" ? "Bundles" : "Gói combo"}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              📞 +1 (555) 123-4567
            </span>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search for fresh fruits, vegetables..."
                className="pl-10 pr-4 py-2 bg-secondary/50 border-secondary"
              />
            </div>

            {/* Mobile navigation */}
            <nav className="space-y-3">
              <Link
                to="/fruits"
                className="block py-2 text-foreground hover:text-primary font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {language === "en" ? "Fruits" : "Trái cây"}
              </Link>
              <Link
                to="/vegetables"
                className="block py-2 text-foreground hover:text-primary font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {language === "en" ? "Vegetables" : "Rau củ"}
              </Link>
              <Link
                to="/organic"
                className="block py-2 text-foreground hover:text-primary font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {language === "en" ? "Organic" : "Hữu cơ"}
              </Link>
              <Link
                to="/seasonal"
                className="block py-2 text-foreground hover:text-primary font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {language === "en" ? "Seasonal" : "Theo mùa"}
              </Link>
              <Link
                to="/bundles"
                className="block py-2 text-foreground hover:text-primary font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {language === "en" ? "Bundles" : "Gói combo"}
              </Link>
            </nav>

            {/* Mobile user actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <Button variant="outline" className="flex-1">
                <User className="w-4 h-4 mr-2" />
                Account
              </Button>
              <Button variant="outline" className="flex-1">
                <Heart className="w-4 h-4 mr-2" />
                Wishlist
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
