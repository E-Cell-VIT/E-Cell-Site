"use client";

import React, { useState } from "react";
import {
  Settings,
  Save,
  Upload,
  Globe,
  Mail,
  Phone,
  FileText,
  BarChart3,
  MapPin,
  Clock,
  CheckCircle,
} from "lucide-react";

interface SiteSettingsData {
  id: string;
  siteName: string;
  tagline: string;
  logoUrl?: string | null;
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  missionText: string;
  visionText: string;
  contactEmail: string;
  contactPhone: string;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  youtubeUrl?: string | null;
  twitterUrl?: string | null;
  campusMapUrl: string;
  manualStats: string;
  outdatedGrantThresholdDays: number;
}

interface SettingsAdminClientProps {
  initialSettings: SiteSettingsData | null;
  isSuperAdmin: boolean;
}

export function SettingsAdminClient({
  initialSettings,
  isSuperAdmin,
}: SettingsAdminClientProps) {
  const [formData, setFormData] = useState<SiteSettingsData>({
    id: initialSettings?.id || "default",
    siteName: initialSettings?.siteName || "E-Cell VIT Mumbai",
    tagline: initialSettings?.tagline || "LEARN • BUILD • NETWORK • LEAD",
    logoUrl: initialSettings?.logoUrl || "",
    heroTitle: initialSettings?.heroTitle || "Empowering Student Innovators & Founders",
    heroSubtitle:
      initialSettings?.heroSubtitle ||
      "Vidyalankar Institute of Technology's premier entrepreneurship hub fostering startup excellence, innovation, and leadership.",
    aboutText: initialSettings?.aboutText || "",
    missionText: initialSettings?.missionText || "",
    visionText: initialSettings?.visionText || "",
    contactEmail: initialSettings?.contactEmail || "ecell@vit.edu.in",
    contactPhone: initialSettings?.contactPhone || "+91 22 2416 1126",
    instagramUrl: initialSettings?.instagramUrl || "",
    linkedinUrl: initialSettings?.linkedinUrl || "",
    youtubeUrl: initialSettings?.youtubeUrl || "",
    twitterUrl: initialSettings?.twitterUrl || "",
    campusMapUrl:
      initialSettings?.campusMapUrl ||
      "https://maps.google.com/?q=Vidyalankar+Institute+of+Technology+Wadala+Mumbai",
    manualStats: initialSettings?.manualStats || "[]",
    outdatedGrantThresholdDays: initialSettings?.outdatedGrantThresholdDays || 90,
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("subfolder", "logos");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setFormData((prev) => ({ ...prev, logoUrl: data.url }));
    } catch (err: any) {
      alert("Error uploading logo: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-teal" />
            Global Site Settings & Branding
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Configure identity, institutional mission/vision, contact channels, and system thresholds.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          Settings successfully updated and logged in the audit trail.
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded-xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand & Identity */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-teal" />
            Identity & Tagline
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Site Name
              </label>
              <input
                type="text"
                required
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Official Tagline
              </label>
              <input
                type="text"
                required
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-teal"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Custom Logo URL (Fallback to /logo.svg if empty)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.logoUrl || ""}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="/logo.svg or custom URL"
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
              />
              <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                {uploading ? "Uploading..." : "Upload Logo"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Hero Section Copy */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-gold" />
            Home Hero Copy
          </h2>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Hero Heading
            </label>
            <input
              type="text"
              required
              value={formData.heroTitle}
              onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Hero Subtitle
            </label>
            <textarea
              rows={2}
              required
              value={formData.heroSubtitle}
              onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
            />
          </div>
        </div>

        {/* Mission, Vision & About */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-teal" />
            About, Mission & Vision (Institutional Copy)
          </h2>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              About E-Cell Text
            </label>
            <textarea
              rows={3}
              value={formData.aboutText}
              onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Mission Statement
              </label>
              <textarea
                rows={3}
                value={formData.missionText}
                onChange={(e) => setFormData({ ...formData, missionText: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Vision Statement
              </label>
              <textarea
                rows={3}
                value={formData.visionText}
                onChange={(e) => setFormData({ ...formData, visionText: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
              />
            </div>
          </div>
        </div>

        {/* Contact & Social Links */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-brand-teal" />
            Official Contact Channels & Socials
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Official Phone
              </label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.linkedinUrl || ""}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                placeholder="https://linkedin.com/company/ecellvitmumbai"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Instagram URL
              </label>
              <input
                type="url"
                value={formData.instagramUrl || ""}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                placeholder="https://instagram.com/ecellvitmumbai"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Google Maps Campus Link
            </label>
            <input
              type="url"
              value={formData.campusMapUrl}
              onChange={(e) => setFormData({ ...formData, campusMapUrl: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
            />
          </div>
        </div>

        {/* System Thresholds */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Verification Rules
          </h2>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Outdated Grant Warning Threshold (Days)
            </label>
            <p className="text-xs text-neutral-400 mb-2">
              If a grant scheme has not been re-verified within this number of days, an alert is shown to public visitors advising them to verify directly with the funding agency.
            </p>
            <input
              type="number"
              min={15}
              max={365}
              value={formData.outdatedGrantThresholdDays}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  outdatedGrantThresholdDays: Number(e.target.value),
                })
              }
              className="w-32 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-navy hover:bg-brand-navy/80 text-white rounded-lg font-medium text-sm transition-all border border-brand-teal/40 shadow-lg shadow-black/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-brand-teal" />
            {saving ? "Saving Changes..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
