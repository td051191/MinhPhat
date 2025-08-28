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
import { Category } from "@shared/api";
import { adminCategoriesApi } from "@/lib/admin-api";

interface CategoryDialogProps {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryDialog({
  category,
  open,
  onOpenChange,
}: CategoryDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name_en: "",
    name_vi: "",
    description_en: "",
    description_vi: "",
    emoji: "🍎",
    color: "bg-fresh-green/10",
    slug: "",
    sortOrder: "1",
    isActive: true,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name_en: category.name.en,
        name_vi: category.name.vi,
        description_en: category.description?.en || "",
        description_vi: category.description?.vi || "",
        emoji: "🍎",
        color: "bg-fresh-green/10",
        slug: category.slug,
        sortOrder: String(category.sortOrder ?? 0),
        isActive: true,
      });
    } else {
      setFormData({
        name_en: "",
        name_vi: "",
        description_en: "",
        description_vi: "",
        emoji: "🍎",
        color: "bg-fresh-green/10",
        slug: "",
        sortOrder: "1",
        isActive: true,
      });
    }
  }, [category]);

  // Auto-generate slug from English name
  useEffect(() => {
    if (!category && formData.name_en) {
      const slug = formData.name_en
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.name_en, category]);

  const saveCategory = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        name: { en: data.name_en, vi: data.name_vi },
        description: { en: data.description_en, vi: data.description_vi },
        emoji: data.emoji,
        color: data.color,
        slug: data.slug,
        sortOrder: parseInt(data.sortOrder),
        isActive: data.isActive,
      };

      if (category) {
        return adminCategoriesApi.update(category.id, payload);
      } else {
        return adminCategoriesApi.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      onOpenChange(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveCategory.mutate(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const colorOptions = [
    { value: "bg-fresh-green/10", label: "Green" },
    { value: "bg-fresh-orange/10", label: "Orange" },
    { value: "bg-fresh-red/10", label: "Red" },
    { value: "bg-fresh-yellow/10", label: "Yellow" },
    { value: "bg-fresh-purple/10", label: "Purple" },
    { value: "bg-fresh-lime/10", label: "Lime" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Add New Category"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Names */}
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

          {/* Descriptions */}
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

          {/* Visual */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Emoji</Label>
              <Input
                value={formData.emoji}
                onChange={(e) => handleChange("emoji", e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Color</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => handleChange("color", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => handleChange("sortOrder", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Slug */}
          <div>
            <Label>Slug (URL-friendly identifier)</Label>
            <Input
              value={formData.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              required
              placeholder="e.g., tropical-fruits"
            />
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange("isActive", checked)}
            />
            <Label>Active</Label>
          </div>

          {/* Preview */}
          <div className="p-4 border rounded-lg">
            <Label className="text-sm text-muted-foreground">Preview</Label>
            <div className="flex items-center gap-3 mt-2">
              <div
                className={`w-12 h-12 ${formData.color} rounded-full flex items-center justify-center`}
              >
                <span className="text-xl">{formData.emoji}</span>
              </div>
              <div>
                <div className="font-medium">{formData.name_en}</div>
                <div className="text-sm text-muted-foreground">
                  {formData.name_vi}
                </div>
              </div>
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
            <Button type="submit" disabled={saveCategory.isPending}>
              {saveCategory.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {category ? "Update" : "Create"} Category
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
