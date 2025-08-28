import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminProductsApi, adminCategoriesApi } from "@/lib/admin-api";
import { Package, FolderTree, TrendingUp, Users, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["admin-products-dashboard"],
    queryFn: () => adminProductsApi.getAll({ limit: 100 }),
  });

  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ["admin-categories-dashboard"],
    queryFn: () => adminCategoriesApi.getAll(),
  });

  if (loadingProducts || loadingCategories) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const stats = [
    {
      title: "Total Products",
      value: productsData?.total || 0,
      icon: Package,
      description: "Active products in store",
    },
    {
      title: "Categories",
      value: categoriesData?.categories?.length || 0,
      icon: FolderTree,
      description: "Product categories",
    },
    {
      title: "Featured Products",
      value: productsData?.products?.filter((p) => p.featured).length || 0,
      icon: TrendingUp,
      description: "Marked as featured",
    },
    {
      title: "In Stock",
      value: productsData?.products?.filter((p) => p.inStock).length || 0,
      icon: Users,
      description: "Available products",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your Minh Phát fruit store
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Products */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productsData?.products?.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-3 border rounded-lg"
                >
                  <div className="text-4xl">{product.image}</div>
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name.en}</h4>
                    <p className="text-sm text-muted-foreground">
                      {product.name.vi}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${product.price}</div>
                    <div
                      className={`text-xs ${product.inStock ? "text-green-600" : "text-red-600"}`}
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
