import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Settings as SettingsIcon,
  Globe,
  Palette,
  Database,
  Shield,
  Download,
} from "lucide-react";
import { adminExportApi, adminSettingsApi } from "@/lib/admin-api";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { StoreSettings } from "@shared/database";

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: { en: "Minh Phát", vi: "Minh Phát" },
  contactEmail: "hello@minhphat.com",
  contactPhone: "+1 (555) 123-4567",
  address: "123 Farm Street, Fresh Valley",
  defaultLanguage: "en",
  enableVietnamese: true,
  currencySymbol: "$",
  currencyCode: "USD",
  darkMode: false,
  primaryColor: "#16a34a",
  autoBackup: true,
};

export default function AdminSettings() {
  const [isExporting, setIsExporting] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => adminSettingsApi.get(),
  });

  useEffect(() => {
    if (data?.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (payload: StoreSettings) => adminSettingsApi.update(payload),
  });

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const blob = await adminExportApi.exportData();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `minhphat-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Configure your Minh Phát store settings</p>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Store Name (English)</Label>
                <Input
                  value={settings.storeName.en}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, storeName: { ...s.storeName, en: e.target.value } }))
                  }
                />
              </div>
              <div>
                <Label>Store Name (Vietnamese)</Label>
                <Input
                  value={settings.storeName.vi}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, storeName: { ...s.storeName, vi: e.target.value } }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Email</Label>
                <Input
                  value={settings.contactEmail}
                  onChange={(e) => setSettings((s) => ({ ...s, contactEmail: e.target.value }))}
                />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input
                  value={settings.contactPhone}
                  onChange={(e) => setSettings((s) => ({ ...s, contactPhone: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Store Address</Label>
              <Input
                value={settings.address}
                onChange={(e) => setSettings((s) => ({ ...s, address: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Language & Localization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Default Language</Label>
                <p className="text-sm text-muted-foreground">The primary language for your store</p>
              </div>
              <select
                className="border rounded px-3 py-2"
                value={settings.defaultLanguage}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, defaultLanguage: e.target.value as StoreSettings["defaultLanguage"] }))
                }
              >
                <option value="en">English</option>
                <option value="vi">Vietnamese</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Vietnamese</Label>
                <p className="text-sm text-muted-foreground">Allow customers to switch to Vietnamese</p>
              </div>
              <Switch
                checked={settings.enableVietnamese}
                onCheckedChange={(val) => setSettings((s) => ({ ...s, enableVietnamese: Boolean(val) }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Currency Symbol</Label>
                <Input
                  value={settings.currencySymbol}
                  onChange={(e) => setSettings((s) => ({ ...s, currencySymbol: e.target.value }))}
                />
              </div>
              <div>
                <Label>Currency Code</Label>
                <Input
                  value={settings.currencyCode}
                  onChange={(e) => setSettings((s) => ({ ...s, currencyCode: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Theme & Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Enable dark theme for admin panel</p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(val) => setSettings((s) => ({ ...s, darkMode: Boolean(val) }))}
              />
            </div>

            <div>
              <Label>Primary Brand Color</Label>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-8 h-8 rounded border" style={{ backgroundColor: settings.primaryColor }}></div>
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => setSettings((s) => ({ ...s, primaryColor: e.target.value }))}
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">Fresh Green</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database & Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Database Type</Label>
                <p className="text-sm text-muted-foreground">Currently using SQLite file-based database</p>
              </div>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">SQLite</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Backup</Label>
                <p className="text-sm text-muted-foreground">Automatically backup data daily</p>
              </div>
              <Switch
                checked={settings.autoBackup}
                onCheckedChange={(val) => setSettings((s) => ({ ...s, autoBackup: Boolean(val) }))}
              />
            </div>

            <Button variant="outline" className="w-full" onClick={handleExportData} disabled={isExporting}>
              {isExporting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-fresh-green mr-2"></div>
                  Exporting...
                </div>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Admin Authentication</Label>
                <p className="text-sm text-muted-foreground">Require login for admin panel</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>API Rate Limiting</Label>
                <p className="text-sm text-muted-foreground">Limit API requests per minute</p>
              </div>
              <Switch defaultChecked />
            </div>

            <Button variant="outline" className="w-full">
              <Shield className="w-4 h-4 mr-2" />
              Change Admin Password
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={() => saveMutation.mutate(settings)} disabled={saveMutation.isPending || isLoading}>
            {saveMutation.isPending ? "Saving..." : "Save All Settings"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
