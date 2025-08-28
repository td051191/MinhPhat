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
  paymentMethods: {
    cod: { enabled: true },
    bankTransfer: {
      enabled: false,
      bankName: "",
      accountName: "",
      accountNumber: "",
      instruction: "",
    },
    momo: { enabled: false, phone: "", qrImageUrl: "", instruction: "" },
    custom: [],
  },
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
    mutationFn: async (payload: StoreSettings) =>
      adminSettingsApi.update(payload),
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
          <p className="text-muted-foreground">
            Configure your Minh Phát store settings
          </p>
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
                    setSettings((s) => ({
                      ...s,
                      storeName: { ...s.storeName, en: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label>Store Name (Vietnamese)</Label>
                <Input
                  value={settings.storeName.vi}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      storeName: { ...s.storeName, vi: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Email</Label>
                <Input
                  value={settings.contactEmail}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, contactEmail: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input
                  value={settings.contactPhone}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, contactPhone: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <Label>Store Address</Label>
              <Input
                value={settings.address}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, address: e.target.value }))
                }
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
                <p className="text-sm text-muted-foreground">
                  The primary language for your store
                </p>
              </div>
              <select
                className="border rounded px-3 py-2"
                value={settings.defaultLanguage}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    defaultLanguage: e.target
                      .value as StoreSettings["defaultLanguage"],
                  }))
                }
              >
                <option value="en">English</option>
                <option value="vi">Vietnamese</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Vietnamese</Label>
                <p className="text-sm text-muted-foreground">
                  Allow customers to switch to Vietnamese
                </p>
              </div>
              <Switch
                checked={settings.enableVietnamese}
                onCheckedChange={(val) =>
                  setSettings((s) => ({ ...s, enableVietnamese: Boolean(val) }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Currency Symbol</Label>
                <Input
                  value={settings.currencySymbol}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      currencySymbol: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Currency Code</Label>
                <Input
                  value={settings.currencyCode}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, currencyCode: e.target.value }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* COD */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Cash on Delivery</Label>
                <p className="text-sm text-muted-foreground">
                  Allow customers to pay cash upon delivery
                </p>
              </div>
              <Switch
                checked={settings.paymentMethods?.cod?.enabled !== false}
                onCheckedChange={(val) =>
                  setSettings((s) => ({
                    ...s,
                    paymentMethods: {
                      ...s.paymentMethods,
                      cod: { enabled: Boolean(val) },
                      bankTransfer: s.paymentMethods?.bankTransfer,
                      momo: s.paymentMethods?.momo,
                    },
                  }))
                }
              />
            </div>

            {/* Bank Transfer */}
            <div className="rounded border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Bank Transfer</Label>
                  <p className="text-sm text-muted-foreground">
                    Show bank details for manual transfer
                  </p>
                </div>
                <Switch
                  checked={Boolean(
                    settings.paymentMethods?.bankTransfer?.enabled,
                  )}
                  onCheckedChange={(val) =>
                    setSettings((s) => ({
                      ...s,
                      paymentMethods: {
                        ...s.paymentMethods,
                        bankTransfer: {
                          ...s.paymentMethods?.bankTransfer,
                          enabled: Boolean(val),
                        },
                        cod: s.paymentMethods?.cod,
                        momo: s.paymentMethods?.momo,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <Label>Bank Name</Label>
                  <Input
                    value={
                      settings.paymentMethods?.bankTransfer?.bankName || ""
                    }
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        paymentMethods: {
                          ...s.paymentMethods,
                          bankTransfer: {
                            ...s.paymentMethods?.bankTransfer,
                            bankName: e.target.value,
                          },
                          cod: s.paymentMethods?.cod,
                          momo: s.paymentMethods?.momo,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Account Name</Label>
                  <Input
                    value={
                      settings.paymentMethods?.bankTransfer?.accountName || ""
                    }
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        paymentMethods: {
                          ...s.paymentMethods,
                          bankTransfer: {
                            ...s.paymentMethods?.bankTransfer,
                            accountName: e.target.value,
                          },
                          cod: s.paymentMethods?.cod,
                          momo: s.paymentMethods?.momo,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Account Number</Label>
                  <Input
                    value={
                      settings.paymentMethods?.bankTransfer?.accountNumber || ""
                    }
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        paymentMethods: {
                          ...s.paymentMethods,
                          bankTransfer: {
                            ...s.paymentMethods?.bankTransfer,
                            accountNumber: e.target.value,
                          },
                          cod: s.paymentMethods?.cod,
                          momo: s.paymentMethods?.momo,
                        },
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Instruction</Label>
                <Input
                  value={
                    settings.paymentMethods?.bankTransfer?.instruction || ""
                  }
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      paymentMethods: {
                        ...s.paymentMethods,
                        bankTransfer: {
                          ...s.paymentMethods?.bankTransfer,
                          instruction: e.target.value,
                        },
                        cod: s.paymentMethods?.cod,
                        momo: s.paymentMethods?.momo,
                      },
                    }))
                  }
                />
              </div>
            </div>

            {/* Momo */}
            <div className="rounded border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Momo</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable Momo wallet payment
                  </p>
                </div>
                <Switch
                  checked={Boolean(settings.paymentMethods?.momo?.enabled)}
                  onCheckedChange={(val) =>
                    setSettings((s) => ({
                      ...s,
                      paymentMethods: {
                        ...s.paymentMethods,
                        momo: {
                          ...s.paymentMethods?.momo,
                          enabled: Boolean(val),
                        },
                        cod: s.paymentMethods?.cod,
                        bankTransfer: s.paymentMethods?.bankTransfer,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <Label>Momo Phone</Label>
                  <Input
                    value={settings.paymentMethods?.momo?.phone || ""}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        paymentMethods: {
                          ...s.paymentMethods,
                          momo: {
                            ...s.paymentMethods?.momo,
                            phone: e.target.value,
                          },
                          cod: s.paymentMethods?.cod,
                          bankTransfer: s.paymentMethods?.bankTransfer,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>QR Image URL</Label>
                  <Input
                    value={settings.paymentMethods?.momo?.qrImageUrl || ""}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        paymentMethods: {
                          ...s.paymentMethods,
                          momo: {
                            ...s.paymentMethods?.momo,
                            qrImageUrl: e.target.value,
                          },
                          cod: s.paymentMethods?.cod,
                          bankTransfer: s.paymentMethods?.bankTransfer,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Instruction</Label>
                  <Input
                    value={settings.paymentMethods?.momo?.instruction || ""}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        paymentMethods: {
                          ...s.paymentMethods,
                          momo: {
                            ...s.paymentMethods?.momo,
                            instruction: e.target.value,
                          },
                          cod: s.paymentMethods?.cod,
                          bankTransfer: s.paymentMethods?.bankTransfer,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Custom Methods */}
            <div className="rounded border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Custom Methods</Label>
                  <p className="text-sm text-muted-foreground">
                    Add your own payment methods (e.g., ZaloPay, VNPay)
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    setSettings((s) => ({
                      ...s,
                      paymentMethods: {
                        ...s.paymentMethods,
                        custom: [
                          ...((s.paymentMethods?.custom as any[]) || []),
                          {
                            id: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                            name: "New Method",
                            enabled: true,
                            instruction: "",
                            qrImageUrl: "",
                          },
                        ],
                      },
                    }))
                  }
                >
                  Add Method
                </Button>
              </div>

              {(settings.paymentMethods?.custom || []).map((m, idx) => (
                <div key={m.id} className="rounded-md border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={Boolean(m.enabled)}
                        onCheckedChange={(val) =>
                          setSettings((s) => ({
                            ...s,
                            paymentMethods: {
                              ...s.paymentMethods,
                              custom: (s.paymentMethods?.custom || []).map(
                                (x, i) =>
                                  i === idx
                                    ? { ...x, enabled: Boolean(val) }
                                    : x,
                              ),
                            },
                          }))
                        }
                      />
                      <Input
                        value={m.name}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            paymentMethods: {
                              ...s.paymentMethods,
                              custom: (s.paymentMethods?.custom || []).map(
                                (x, i) =>
                                  i === idx
                                    ? { ...x, name: e.target.value }
                                    : x,
                              ),
                            },
                          }))
                        }
                        className="w-56"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setSettings((s) => ({
                          ...s,
                          paymentMethods: {
                            ...s.paymentMethods,
                            custom: (s.paymentMethods?.custom || []).filter(
                              (_, i) => i !== idx,
                            ),
                          },
                        }))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label>Instruction</Label>
                      <Input
                        value={m.instruction || ""}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            paymentMethods: {
                              ...s.paymentMethods,
                              custom: (s.paymentMethods?.custom || []).map(
                                (x, i) =>
                                  i === idx
                                    ? { ...x, instruction: e.target.value }
                                    : x,
                              ),
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>QR/Image URL (optional)</Label>
                      <Input
                        value={m.qrImageUrl || ""}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            paymentMethods: {
                              ...s.paymentMethods,
                              custom: (s.paymentMethods?.custom || []).map(
                                (x, i) =>
                                  i === idx
                                    ? { ...x, qrImageUrl: e.target.value }
                                    : x,
                              ),
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
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
                <p className="text-sm text-muted-foreground">
                  Enable dark theme for admin panel
                </p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(val) =>
                  setSettings((s) => ({ ...s, darkMode: Boolean(val) }))
                }
              />
            </div>

            <div>
              <Label>Primary Brand Color</Label>
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: settings.primaryColor }}
                ></div>
                <Input
                  value={settings.primaryColor}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, primaryColor: e.target.value }))
                  }
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">
                  Fresh Green
                </span>
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
                <p className="text-sm text-muted-foreground">
                  Currently using SQLite file-based database
                </p>
              </div>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                SQLite
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically backup data daily
                </p>
              </div>
              <Switch
                checked={settings.autoBackup}
                onCheckedChange={(val) =>
                  setSettings((s) => ({ ...s, autoBackup: Boolean(val) }))
                }
              />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleExportData}
              disabled={isExporting}
            >
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
                <p className="text-sm text-muted-foreground">
                  Require login for admin panel
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>API Rate Limiting</Label>
                <p className="text-sm text-muted-foreground">
                  Limit API requests per minute
                </p>
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
          <Button
            onClick={() => saveMutation.mutate(settings)}
            disabled={saveMutation.isPending || isLoading}
          >
            {saveMutation.isPending ? "Saving..." : "Save All Settings"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
