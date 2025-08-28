import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useCart } from "@/hooks/useCart";
import {
  productsApi,
  categoriesApi,
  contentApi,
  newsletterApi,
} from "@/lib/api";
import { useState } from "react";
import {
  ShoppingCart,
  Star,
  Truck,
  Shield,
  Leaf,
  Clock,
  ArrowRight,
  Heart,
  Plus,
  Loader2,
} from "lucide-react";

export default function Index() {
  const { language, t } = useLanguage();
  const { add } = useCart();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Fetch data from database
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => productsApi.getFeatured(4),
  });

  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getAll(),
  });

  const { data: heroContent } = useQuery({
    queryKey: ["content", "hero"],
    queryFn: () => contentApi.getBySection("hero"),
  });

  const { data: featuresContent } = useQuery({
    queryKey: ["content", "features"],
    queryFn: () => contentApi.getBySection("features"),
  });

  const { data: newsletterContent } = useQuery({
    queryKey: ["content", "newsletter"],
    queryFn: () => contentApi.getBySection("newsletter"),
  });

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setIsSubscribing(true);
    try {
      await newsletterApi.subscribe(newsletterEmail, language);
      setNewsletterEmail("");
      alert(
        language === "en" ? "Successfully subscribed!" : "Đăng ký thành công!",
      );
    } catch (error) {
      alert(
        language === "en"
          ? "Failed to subscribe. Please try again."
          : "Đăng ký thất bại. Vui lòng thử lại.",
      );
    } finally {
      setIsSubscribing(false);
    }
  };

  // Get translated content with fallbacks
  const getContent = (key: string, fallback: { en: string; vi: string }) => {
    const content =
      heroContent?.content.find((c) => c.key === key) ||
      featuresContent?.content.find((c) => c.key === key) ||
      newsletterContent?.content.find((c) => c.key === key);
    return content ? t(content.value) : t(fallback);
  };

  const featuredProducts = productsData?.products || [];
  const categories = categoriesData?.categories || [];

  // Loading state
  if (loadingProducts || loadingCategories) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-fresh-green/5 via-fresh-lime/5 to-fresh-yellow/5 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-fresh-green text-white">
                  🌱{" "}
                  {language === "en"
                    ? "100% Fresh & Organic"
                    : "100% Tươi & Hữu cơ"}
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="block">
                    {getContent("hero_title", {
                      en: "Fresh Fruits",
                      vi: "Trái cây tươi",
                    })
                      .split(" ")
                      .slice(0, 2)
                      .join(" ")}
                  </span>
                  <span className="block text-fresh-green">
                    {getContent("hero_title", {
                      en: "Delivered Daily",
                      vi: "Giao hàng hàng ngày",
                    })
                      .split(" ")
                      .slice(2)
                      .join(" ")}
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  {getContent("hero_subtitle", {
                    en: "Farm-fresh fruits delivered to your doorstep. Support local farmers while enjoying the finest quality produce at unbeatable prices.",
                    vi: "Trái cây tươi từ trang trại giao đến tận nhà. Hỗ trợ nông dân địa phương đồng thời thưởng thức sản phẩm chất lượng cao nhất với giá cả không thể cạnh tranh hơn.",
                  })}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {language === "en" ? "Shop Now" : "Mua ngay"}
                </Button>
                <Button variant="outline" size="lg">
                  {language === "en" ? "Learn More" : "Tìm hiểu thêm"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-fresh-green" />
                  <span className="font-medium">
                    {language === "en" ? "Free Delivery" : "Miễn phí giao hàng"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-fresh-green" />
                  <span className="font-medium">
                    {language === "en"
                      ? "Quality Guarantee"
                      : "Bảo đảm chất lượng"}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="text-9xl lg:text-[12rem] text-center opacity-90">
                🍎🍊🍌
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {language === "en" ? "Shop by Category" : "Mua theo danh mục"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === "en"
                ? "Discover our wide selection of fresh produce, carefully sourced from local farms"
                : "Khám phá lựa chọn đa dạng của chúng tôi về nông s��n tươi, được lựa chọn cẩn thận từ các trang trại địa phương"}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.slice(0, 6).map((category) => (
              <Card
                key={category.id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">{category.name.en.charAt(0)}</span>
                  </div>
                  <h3 className="font-semibold mb-1">{t(category.name)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.count}+ {language === "en" ? "varieties" : "loại"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                {language === "en" ? "Featured Products" : "Sản phẩm nổi bật"}
              </h2>
              <p className="text-muted-foreground">
                {language === "en"
                  ? "Hand-picked fresh fruits at the best prices"
                  : "Trái cây tươi được chọn lọc với giá tốt nhất"}
              </p>
            </div>
            <Button variant="outline">
              {language === "en" ? "View All" : "Xem tất cả"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card
                key={product.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-card"
              >
                <CardContent className="p-0">
                  <div className="relative p-6 text-center bg-gradient-to-br from-secondary/20 to-secondary/5">
                    {product.featured && (
                      <Badge className="absolute top-3 left-3 bg-fresh-green text-white">
                        Featured
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    <div className="text-8xl mb-4">{product.image}</div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2">
                      {t(product.name)}
                    </h3>

                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-fresh-yellow fill-current" : "text-muted-foreground"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviewsCount})
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">
                          ${product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-muted-foreground line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {product.weight || (language === "en" ? "per unit" : "mỗi đơn vị")}
                      </span>
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => add(product, 1)}>
                      <Plus className="w-4 h-4 mr-2" />
                      {language === "en" ? "Add to Cart" : "Thêm vào giỏ"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-fresh-green/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {getContent("features_title", {
                en: "Why Choose Minh Phát?",
                vi: "Tại sao chọn Minh Phát?",
              })}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === "en"
                ? "We're committed to delivering the freshest produce while supporting sustainable farming"
                : "Chúng tôi cam kết cung cấp những sản phẩm tươi nhất đồng thời hỗ trợ nông nghiệp bền vững"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-fresh-green rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {language === "en" ? "100% Organic" : "100% Hữu cơ"}
              </h3>
              <p className="text-muted-foreground">
                {language === "en"
                  ? "All our products are certified organic, grown without harmful pesticides or chemicals"
                  : "Tất cả sản phẩm của chúng tôi đều được chứng nhận hữu cơ, trồng không có thuốc trừ sâu hoặc hóa chất có hại"}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-fresh-orange rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {language === "en" ? "Fast Delivery" : "Giao hàng nhanh"}
              </h3>
              <p className="text-muted-foreground">
                {language === "en"
                  ? "Same-day delivery available. Fresh from farm to your table in hours, not days"
                  : "Có giao hàng trong ngày. Tươi từ trang trại đến bàn của bạn trong vài giờ, không phải vài ngày"}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-fresh-red rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {language === "en" ? "Quality Guarantee" : "Bảo đảm chất lượng"}
              </h3>
              <p className="text-muted-foreground">
                {language === "en"
                  ? "Not satisfied? We'll replace or refund your order, no questions asked"
                  : "Không hài lòng? Chúng tôi sẽ thay thế hoặc hoàn tiền đơn hàng của bạn, không cần hỏi"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-fresh-green to-fresh-lime">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {getContent("newsletter_title", {
              en: "Stay Fresh with Our Newsletter",
              vi: "Luôn cập nhật với Bản tin của chúng tôi",
            })}
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            {language === "en"
              ? "Get weekly updates on seasonal fruits, exclusive offers, and healthy recipes delivered to your inbox"
              : "Nhận cập nhật hàng tuần về trái cây theo mùa, ưu đãi độc quyền và công thức nấu ăn lành mạnh được gửi đến hộp thư của bạn"}
          </p>
          <form
            onSubmit={handleNewsletterSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
          >
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder={
                language === "en" ? "Enter your email" : "Nhập email của bạn"
              }
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white"
              required
            />
            <Button
              type="submit"
              disabled={isSubscribing}
              className="bg-white text-fresh-green hover:bg-white/90"
            >
              {isSubscribing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : language === "en" ? (
                "Subscribe"
              ) : (
                "Đăng ký"
              )}
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-fresh-green rounded-full">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-primary">
                  Minh Phát
                </span>
              </div>
              <p className="text-muted-foreground mb-4">
                {language === "en"
                  ? "Fresh, organic produce delivered daily to your doorstep."
                  : "Nông sản tươi, hữu cơ được giao hàng hàng ngày đến tận nhà bạn."}
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon">
                  📘
                </Button>
                <Button variant="ghost" size="icon">
                  📷
                </Button>
                <Button variant="ghost" size="icon">
                  🐦
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">
                {language === "en" ? "Shop" : "Mua sắm"}
              </h4>
              <div className="space-y-2">
                <Link
                  to="/fruits"
                  className="block text-muted-foreground hover:text-foreground"
                >
                  {language === "en" ? "Fruits" : "Trái cây"}
                </Link>
                <Link
                  to="/vegetables"
                  className="block text-muted-foreground hover:text-foreground"
                >
                  {language === "en" ? "Vegetables" : "Rau củ"}
                </Link>
                <Link
                  to="/organic"
                  className="block text-muted-foreground hover:text-foreground"
                >
                  {language === "en" ? "Organic" : "Hữu cơ"}
                </Link>
                <Link
                  to="/bundles"
                  className="block text-muted-foreground hover:text-foreground"
                >
                  {language === "en" ? "Bundles" : "Gói combo"}
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">
                {language === "en" ? "Support" : "Hỗ trợ"}
              </h4>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-muted-foreground hover:text-foreground"
                >
                  {language === "en" ? "Contact Us" : "Liên hệ"}
                </a>
                <a
                  href="#"
                  className="block text-muted-foreground hover:text-foreground"
                >
                  {language === "en" ? "FAQ" : "Câu hỏi thường gặp"}
                </a>
                <a
                  href="#"
                  className="block text-muted-foreground hover:text-foreground"
                >
                  {language === "en" ? "Shipping Info" : "Thông tin giao hàng"}
                </a>
                <a
                  href="#"
                  className="block text-muted-foreground hover:text-foreground"
                >
                  {language === "en" ? "Returns" : "Đổi trả"}
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">
                {language === "en" ? "Contact" : "Liên hệ"}
              </h4>
              <div className="space-y-2 text-muted-foreground">
                <p>📞 +1 (555) 123-4567</p>
                <p>📧 hello@minhphat.com</p>
                <p>📍 123 Farm Street, Fresh Valley</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>
              &copy; 2024 Minh Phát.{" "}
              {language === "en"
                ? "All rights reserved."
                : "Tất cả quyền được bảo lưu."}{" "}
              |
              <span className="mx-2">
                {language === "en" ? "Privacy Policy" : "Chính sách bảo mật"}
              </span>{" "}
              |
              <span className="mx-2">
                {language === "en" ? "Terms of Service" : "Điều khoản dịch vụ"}
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
