import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { Product, Category } from "@shared/api";
import { adminProductsApi } from "@/lib/admin-api";

interface ProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
}

export function ProductDialog({
  product,
  open,
  onOpenChange,
  categories,
}: ProductDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name_en: "",
    name_vi: "",
    description_en: "",
    description_vi: "",
    price: "",
    originalPrice: "",
    image: "",
    category: "",
    badge_en: "",
    badge_vi: "",
    badgeColor: "bg-fresh-green",
    unit: "lb",
    origin: "",
    isOrganic: false,
    isSeasonal: false,
    inStock: true,
    calories: "",
    vitamin_c: "",
    fiber: "",
    sugar: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name_en: product.name.en,
        name_vi: product.name.vi,
        description_en: product.description.en,
        description_vi: product.description.vi,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || "",
        image: product.image,
        category: product.category,
        badge_en: "",
        badge_vi: "",
        badgeColor: "bg-fresh-green",
        unit: product.weight || "lb",
        origin: product.origin || "",
        isOrganic: product.organic ?? false,
        isSeasonal: product.seasonal ?? false,
        inStock: product.inStock ?? true,
        calories:
          product.nutrition && product.nutrition.calories != null
            ? String(product.nutrition.calories)
            : "",
        vitamin_c:
          product.nutrition && product.nutrition.vitamin_c != null
            ? String(product.nutrition.vitamin_c)
            : "",
        fiber:
          product.nutrition && product.nutrition.fiber != null
            ? String(product.nutrition.fiber)
            : "",
        sugar:
          product.nutrition && product.nutrition.sugar != null
            ? String(product.nutrition.sugar)
            : "",
      });
    } else {
      setFormData({
        name_en: "",
        name_vi: "",
        description_en: "",
        description_vi: "",
        price: "",
        originalPrice: "",
        image: "🍎",
        category: "",
        badge_en: "",
        badge_vi: "",
        badgeColor: "bg-fresh-green",
        unit: "lb",
        origin: "",
        isOrganic: false,
        isSeasonal: false,
        inStock: true,
        calories: "",
        vitamin_c: "",
        fiber: "",
        sugar: "",
      });
    }
  }, [product]);

  const saveProduct = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        name: { en: data.name_en, vi: data.name_vi },
        description: { en: data.description_en, vi: data.description_vi },
        price: parseFloat(data.price),
        originalPrice: data.originalPrice
          ? parseFloat(data.originalPrice)
          : undefined,
        image: data.image,
        category: data.category,
        badge: data.badge_en
          ? { en: data.badge_en, vi: data.badge_vi }
          : undefined,
        badgeColor: data.badgeColor,
        unit: data.unit,
        origin: data.origin,
        organic: data.isOrganic,
        seasonal: data.isSeasonal,
        featured: data.featured || false,
        inStock: data.inStock,
        weight: data.unit, // Map unit to weight for now
        nutrition: {
          calories: parseFloat(data.calories) || 0,
          vitamin_c: parseFloat(data.vitamin_c) || 0,
          fiber: parseFloat(data.fiber) || 0,
          sugar: parseFloat(data.sugar) || 0,
        },
      };

      if (product) {
        return adminProductsApi.update(product.id, payload);
      } else {
        return adminProductsApi.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      onOpenChange(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProduct.mutate(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name (English)</Label>
              <Input
                value={formData.name_en}
                onChange={(e) => handleChange("name_en", e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Name (Vietnamese)</Label>
              <Input
                value={formData.name_vi}
                onChange={(e) => handleChange("name_vi", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Description (English)</Label>
              <Textarea
                value={formData.description_en}
                onChange={(e) => handleChange("description_en", e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Description (Vietnamese)</Label>
              <Textarea
                value={formData.description_vi}
                onChange={(e) => handleChange("description_vi", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Pricing & Category */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Price ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Original Price ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => handleChange("originalPrice", e.target.value)}
              />
            </div>
            <div>
              <Label>Unit</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => handleChange("unit", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lb">lb</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="piece">piece</SelectItem>
                  <SelectItem value="box">box</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Image (Emoji)</Label>
              <Input
                value={formData.image}
                onChange={(e) => handleChange("image", e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Origin</Label>
              <Input
                value={formData.origin}
                onChange={(e) => handleChange("origin", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Badge */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Badge (English)</Label>
              <Input
                value={formData.badge_en}
                onChange={(e) => handleChange("badge_en", e.target.value)}
                placeholder="e.g., Organic"
              />
            </div>
            <div>
              <Label>Badge (Vietnamese)</Label>
              <Input
                value={formData.badge_vi}
                onChange={(e) => handleChange("badge_vi", e.target.value)}
                placeholder="e.g., Hữu cơ"
              />
            </div>
            <div>
              <Label>Badge Color</Label>
              <Select
                value={formData.badgeColor}
                onValueChange={(value) => handleChange("badgeColor", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg-fresh-green">Green</SelectItem>
                  <SelectItem value="bg-fresh-orange">Orange</SelectItem>
                  <SelectItem value="bg-fresh-red">Red</SelectItem>
                  <SelectItem value="bg-fresh-yellow">Yellow</SelectItem>
                  <SelectItem value="bg-fresh-purple">Purple</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Nutritional Info */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label>Calories</Label>
              <Input
                type="number"
                value={formData.calories}
                onChange={(e) => handleChange("calories", e.target.value)}
              />
            </div>
            <div>
              <Label>Vitamin C (mg)</Label>
              <Input
                type="number"
                value={formData.vitamin_c}
                onChange={(e) => handleChange("vitamin_c", e.target.value)}
              />
            </div>
            <div>
              <Label>Fiber (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.fiber}
                onChange={(e) => handleChange("fiber", e.target.value)}
              />
            </div>
            <div>
              <Label>Sugar (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.sugar}
                onChange={(e) => handleChange("sugar", e.target.value)}
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isOrganic}
                onCheckedChange={(checked) =>
                  handleChange("isOrganic", checked)
                }
              />
              <Label>Organic</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isSeasonal}
                onCheckedChange={(checked) =>
                  handleChange("isSeasonal", checked)
                }
              />
              <Label>Seasonal</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.inStock}
                onCheckedChange={(checked) => handleChange("inStock", checked)}
              />
              <Label>In Stock</Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saveProduct.isPending}>
              {saveProduct.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {product ? "Update" : "Create"} Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
