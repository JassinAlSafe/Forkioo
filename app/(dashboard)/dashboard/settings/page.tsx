"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  Palette,
  FileText,
  Mail,
  Save,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCompany } from "@/hooks/use-company";
import { BusinessType, Currency } from "@/types/enums";
import { BUSINESS_TYPE_OPTIONS, CURRENCY_OPTIONS } from "@/lib/constants/options";
import { emailSchema, optionalEmailSchema } from "@/lib/constants/validation";

const profileSchema = z.object({
  name: z.string().min(1, "Company name is required").max(255),
  businessType: z.nativeEnum(BusinessType).optional(),
  taxId: z.string().max(20).optional(),
  countryCode: z.string().length(2).optional(),
  fiscalYearEnd: z.string().regex(/^\d{2}-\d{2}$/).optional(),
});

const settingsSchema = z.object({
  invoicePrefix: z.string().max(10).optional(),
  defaultPaymentTermsDays: z.number().int().positive().max(365).optional().or(z.literal("")),
  defaultTaxRate: z.number().min(0).max(100).optional().or(z.literal("")),
  taxLabel: z.string().max(50).optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional().or(z.literal("")),
  invoiceFooter: z.string().max(1000).optional(),
  invoiceTerms: z.string().max(2000).optional(),
  emailFromName: z.string().max(100).optional(),
  emailReplyTo: optionalEmailSchema,
  currency: z.nativeEnum(Currency).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "branding" | "invoices" | "email">("profile");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const companyHooks = useCompany();

  // Fetch company profile and settings
  const { data: profile, isLoading: profileLoading } = companyHooks.getProfile();
  const { data: settings, isLoading: settingsLoading } = companyHooks.getSettings();

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: profile
      ? {
          name: profile.name,
          businessType: profile.businessType as any,
          taxId: profile.taxId || "",
          countryCode: profile.countryCode || "",
          fiscalYearEnd: profile.fiscalYearEnd || "",
        }
      : undefined,
  });

  // Settings form
  const {
    register: registerSettings,
    handleSubmit: handleSubmitSettings,
    formState: { errors: settingsErrors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    values: settings?.settings
      ? {
          invoicePrefix: settings.settings.invoicePrefix || "",
          defaultPaymentTermsDays: settings.settings.defaultPaymentTermsDays || "",
          defaultTaxRate: settings.settings.defaultTaxRate || "",
          taxLabel: settings.settings.taxLabel || "",
          primaryColor: settings.settings.primaryColor || "",
          invoiceFooter: settings.settings.invoiceFooter || "",
          invoiceTerms: settings.settings.invoiceTerms || "",
          emailFromName: settings.settings.emailFromName || "",
          emailReplyTo: settings.settings.emailReplyTo || "",
          currency: settings.currency || "USD",
        }
      : undefined,
  });

  const onSubmitProfile = async (data: ProfileFormData) => {
    setProfileSuccess(false);
    await companyHooks.updateProfile.mutateAsync({
      name: data.name,
      businessType: data.businessType,
      taxId: data.taxId || undefined,
      countryCode: data.countryCode || undefined,
      fiscalYearEnd: data.fiscalYearEnd || undefined,
    });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const onSubmitSettings = async (data: SettingsFormData) => {
    setSettingsSuccess(false);
    await companyHooks.updateSettings.mutateAsync({
      invoicePrefix: data.invoicePrefix || undefined,
      defaultPaymentTermsDays: data.defaultPaymentTermsDays ? Number(data.defaultPaymentTermsDays) : undefined,
      defaultTaxRate: data.defaultTaxRate ? Number(data.defaultTaxRate) : undefined,
      taxLabel: data.taxLabel || undefined,
      primaryColor: data.primaryColor || undefined,
      invoiceFooter: data.invoiceFooter || undefined,
      invoiceTerms: data.invoiceTerms || undefined,
      emailFromName: data.emailFromName || undefined,
      emailReplyTo: data.emailReplyTo || undefined,
      currency: data.currency || undefined,
    });
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  const tabs = [
    { id: "profile" as const, label: "Company Profile", icon: Building2 },
    { id: "branding" as const, label: "Branding", icon: Palette },
    { id: "invoices" as const, label: "Invoice Defaults", icon: FileText },
    { id: "email" as const, label: "Email Settings", icon: Mail },
  ];

  if (profileLoading || settingsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your company settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* Company Profile Tab */}
        {activeTab === "profile" && (
          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
            <div className="card-elevated rounded-xl border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Company Information</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">
                    Company Name <span className="text-danger-600">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...registerProfile("name")}
                    placeholder="Your Company Ltd"
                  />
                  {profileErrors.name && (
                    <p className="mt-1 text-xs text-danger-600">{profileErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <select
                    id="businessType"
                    {...registerProfile("businessType")}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">-- Select type --</option>
                    {BUSINESS_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="taxId">Tax ID / EIN</Label>
                  <Input
                    id="taxId"
                    {...registerProfile("taxId")}
                    placeholder="12-3456789"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="countryCode">Country Code</Label>
                    <Input
                      id="countryCode"
                      {...registerProfile("countryCode")}
                      placeholder="US"
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="fiscalYearEnd">Fiscal Year End (MM-DD)</Label>
                    <Input
                      id="fiscalYearEnd"
                      {...registerProfile("fiscalYearEnd")}
                      placeholder="12-31"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                {profileSuccess && (
                  <div className="flex items-center gap-2 text-success-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Changes saved successfully</span>
                  </div>
                )}
                <Button type="submit" disabled={companyHooks.updateProfile.isPending} className="ml-auto">
                  <Save className="mr-2 h-4 w-4" />
                  {companyHooks.updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Branding Tab */}
        {activeTab === "branding" && (
          <form onSubmit={handleSubmitSettings(onSubmitSettings)} className="space-y-6">
            <div className="card-elevated rounded-xl border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Brand Colors</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="mt-1 flex gap-2">
                    <Input
                      id="primaryColor"
                      {...registerSettings("primaryColor")}
                      placeholder="#667eea"
                      className="flex-1"
                    />
                    <input
                      type="color"
                      className="h-10 w-20 rounded-md border border-gray-300"
                      {...registerSettings("primaryColor")}
                    />
                  </div>
                  {settingsErrors.primaryColor && (
                    <p className="mt-1 text-xs text-danger-600">{settingsErrors.primaryColor.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    {...registerSettings("currency")}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {CURRENCY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                {settingsSuccess && activeTab === "branding" && (
                  <div className="flex items-center gap-2 text-success-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Changes saved successfully</span>
                  </div>
                )}
                <Button type="submit" disabled={companyHooks.updateSettings.isPending} className="ml-auto">
                  <Save className="mr-2 h-4 w-4" />
                  {companyHooks.updateSettings.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Invoice Defaults Tab */}
        {activeTab === "invoices" && (
          <form onSubmit={handleSubmitSettings(onSubmitSettings)} className="space-y-6">
            <div className="card-elevated rounded-xl border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Invoice Settings</h2>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                    <Input
                      id="invoicePrefix"
                      {...registerSettings("invoicePrefix")}
                      placeholder="INV-"
                    />
                  </div>

                  <div>
                    <Label htmlFor="defaultPaymentTermsDays">Default Payment Terms (days)</Label>
                    <Input
                      id="defaultPaymentTermsDays"
                      type="number"
                      {...registerSettings("defaultPaymentTermsDays")}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
                    <Input
                      id="defaultTaxRate"
                      type="number"
                      step="0.01"
                      {...registerSettings("defaultTaxRate")}
                      placeholder="10.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="taxLabel">Tax Label</Label>
                    <Input
                      id="taxLabel"
                      {...registerSettings("taxLabel")}
                      placeholder="VAT / Sales Tax"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="invoiceFooter">Invoice Footer</Label>
                  <Textarea
                    id="invoiceFooter"
                    {...registerSettings("invoiceFooter")}
                    placeholder="Thank you for your business!"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="invoiceTerms">Default Payment Terms</Label>
                  <Textarea
                    id="invoiceTerms"
                    {...registerSettings("invoiceTerms")}
                    placeholder="Payment due within 30 days. Late payments subject to 1.5% monthly interest."
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                {settingsSuccess && activeTab === "invoices" && (
                  <div className="flex items-center gap-2 text-success-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Changes saved successfully</span>
                  </div>
                )}
                <Button type="submit" disabled={companyHooks.updateSettings.isPending} className="ml-auto">
                  <Save className="mr-2 h-4 w-4" />
                  {companyHooks.updateSettings.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Email Settings Tab */}
        {activeTab === "email" && (
          <form onSubmit={handleSubmitSettings(onSubmitSettings)} className="space-y-6">
            <div className="card-elevated rounded-xl border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Email Configuration</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="emailFromName">From Name</Label>
                  <Input
                    id="emailFromName"
                    {...registerSettings("emailFromName")}
                    placeholder="Your Company Name"
                  />
                </div>

                <div>
                  <Label htmlFor="emailReplyTo">Reply-To Email</Label>
                  <Input
                    id="emailReplyTo"
                    type="email"
                    {...registerSettings("emailReplyTo")}
                    placeholder="billing@yourcompany.com"
                  />
                  {settingsErrors.emailReplyTo && (
                    <p className="mt-1 text-xs text-danger-600">{settingsErrors.emailReplyTo.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                {settingsSuccess && activeTab === "email" && (
                  <div className="flex items-center gap-2 text-success-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Changes saved successfully</span>
                  </div>
                )}
                <Button type="submit" disabled={companyHooks.updateSettings.isPending} className="ml-auto">
                  <Save className="mr-2 h-4 w-4" />
                  {companyHooks.updateSettings.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
