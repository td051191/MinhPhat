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
import { Loader2 } from "lucide-react";
import { Content } from "@shared/api";
import { adminContentApi } from "@/lib/admin-api";

interface ContentDialogProps {
  content: Content | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContentDialog({
  content,
  open,
  onOpenChange,
}: ContentDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    key: "",
    value_en: "",
    value_vi: "",
    type: "text" as "text" | "html" | "markdown" | "json",
    section: "",
  });

  useEffect(() => {
    if (content) {
      setFormData({
        key: content.key,
        value_en: content.value.en,
        value_vi: content.value.vi,
        type: content.type,
        section: content.section,
      });
    } else {
      setFormData({
        key: "",
        value_en: "",
        value_vi: "",
        type: "text",
        section: "",
      });
    }
  }, [content]);

  const saveContent = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        key: data.key,
        value: { en: data.value_en, vi: data.value_vi },
        type: data.type,
        section: data.section,
      };

      if (content) {
        return adminContentApi.update(content.id, payload);
      } else {
        return adminContentApi.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      onOpenChange(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveContent.mutate(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const sectionOptions = [
    { value: "hero", label: "Hero Section" },
    { value: "features", label: "Features Section" },
    { value: "newsletter", label: "Newsletter Section" },
    { value: "footer", label: "Footer Section" },
    { value: "about", label: "About Section" },
    { value: "contact", label: "Contact Section" },
    { value: "general", label: "General" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {content ? "Edit Content" : "Add New Content"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Key and Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Key (unique identifier)</Label>
              <Input
                value={formData.key}
                onChange={(e) => handleChange("key", e.target.value)}
                placeholder="e.g., hero_title"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use snake_case for keys
              </p>
            </div>
            <div>
              <Label>Section</Label>
              <Select
                value={formData.section}
                onValueChange={(value) => handleChange("section", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sectionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Type */}
          <div>
            <Label>Content Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Plain Text</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content Values */}
          <div className="space-y-4">
            <div>
              <Label>Content (English)</Label>
              {formData.type === "text" ? (
                <Textarea
                  value={formData.value_en}
                  onChange={(e) => handleChange("value_en", e.target.value)}
                  placeholder="Enter English content..."
                  rows={4}
                  required
                />
              ) : (
                <Textarea
                  value={formData.value_en}
                  onChange={(e) => handleChange("value_en", e.target.value)}
                  placeholder={
                    formData.type === "html"
                      ? "Enter HTML content..."
                      : "Enter Markdown content..."
                  }
                  rows={6}
                  required
                  className="font-mono text-sm"
                />
              )}
            </div>

            <div>
              <Label>Content (Vietnamese)</Label>
              {formData.type === "text" ? (
                <Textarea
                  value={formData.value_vi}
                  onChange={(e) => handleChange("value_vi", e.target.value)}
                  placeholder="Enter Vietnamese content..."
                  rows={4}
                  required
                />
              ) : (
                <Textarea
                  value={formData.value_vi}
                  onChange={(e) => handleChange("value_vi", e.target.value)}
                  placeholder={
                    formData.type === "html"
                      ? "Enter HTML content..."
                      : "Enter Markdown content..."
                  }
                  rows={6}
                  required
                  className="font-mono text-sm"
                />
              )}
            </div>
          </div>

          {/* Preview */}
          {(formData.value_en || formData.value_vi) && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="mt-2 space-y-2">
                {formData.value_en && (
                  <div>
                    <div className="text-xs text-muted-foreground">
                      English:
                    </div>
                    <div className="text-sm">{formData.value_en}</div>
                  </div>
                )}
                {formData.value_vi && (
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Vietnamese:
                    </div>
                    <div className="text-sm">{formData.value_vi}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saveContent.isPending}>
              {saveContent.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {content ? "Update" : "Create"} Content
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
