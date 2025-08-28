import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit2, Trash2, Loader2, Star } from "lucide-react";
import { adminProductsApi, adminCategoriesApi } from "@/lib/admin-api";
import { Product } from "@shared/api";
import { ProductDialog } from "@/components/admin/ProductDialog";

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["admin-products", search],
    queryFn: () =>
      adminProductsApi.getAll({ search: search || undefined, limit: 50 }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => adminCategoriesApi.getAll(),
  });

  const deleteProduct = useMutation({
    mutationFn: adminProductsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProduct.mutate(id);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categoriesData?.categories.find(
      (c) => c.id === categoryId,
    );
    return category ? category.name.en : "Unknown";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Products</h2>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Products ({productsData?.total || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsData?.products?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{product.image}</div>
                          <div>
                            <div className="font-medium">{product.name.en}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.name.vi}
                            </div>
                            {product.featured && (
                              <Badge className="mt-1 bg-fresh-green text-white text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryName(product.category)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.inStock ? "default" : "destructive"}
                        >
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{product.rating}</span>
                          <span className="text-sm text-muted-foreground">
                            ({product.reviewsCount})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDelete(product.id, product.name.en)
                            }
                            disabled={deleteProduct.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Product Dialog */}
        <ProductDialog
          product={selectedProduct}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          categories={categoriesData?.categories || []}
        />
      </div>
    </AdminLayout>
  );
}
