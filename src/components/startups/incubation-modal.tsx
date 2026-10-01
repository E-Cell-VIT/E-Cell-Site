"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, FileUp, Loader2, Sparkles, ShieldAlert } from "lucide-react";

interface IncubationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IncubationModal({ isOpen, onClose }: IncubationModalProps) {
  const [formData, setFormData] = useState({
    startupName: "",
    founderNames: "",
    founderEmail: "",
    founderPhone: "",
    departmentBatch: "",
    domain: "Artificial Intelligence & ML",
    oneLineSummary: "",
    stage: "Idea Stage / Validation",
    consentGiven: false,
    honeypot: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formLoadedAt, setFormLoadedAt] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormLoadedAt(Date.now());
      setSuccess(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Pitch deck must be in PDF format.");
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size cannot exceed 10 MB.");
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consentGiven) {
      setError("You must acknowledge the data handling consent notice.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("startupName", formData.startupName);
      data.append("founderNames", formData.founderNames);
      data.append("founderEmail", formData.founderEmail);
      data.append("founderPhone", formData.founderPhone);
      data.append("departmentBatch", formData.departmentBatch);
      data.append("domain", formData.domain);
      data.append("oneLineSummary", formData.oneLineSummary);
      data.append("stage", formData.stage);
      data.append("consentGiven", "true");
      data.append("honeypot", formData.honeypot);
      data.append("formLoadedAt", String(formLoadedAt));

      if (selectedFile) {
        data.append("pitchDeck", selectedFile);
      }

      const res = await fetch("/api/incubation", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Submission failed.");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error submitting application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-surface border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Apply for VIT Pre-Incubation</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                E-Cell & VIT Innovation Center Cohort Application
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-white/5"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold">Application Received!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Your incubation application has been safely logged in our secure review queue. The E-Cell Incubation Committee will review your submission and contact you via email.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="p-3.5 text-xs flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Honeypot */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                tabIndex={-1}
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                  Startup / Venture Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Diagnostics"
                  value={formData.startupName}
                  onChange={(e) => setFormData({ ...formData, startupName: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                  Founder Names *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alice Smith, Bob Johnson"
                  value={formData.founderNames}
                  onChange={(e) => setFormData({ ...formData, founderNames: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                  Founder Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="founder@example.com"
                  value={formData.founderEmail}
                  onChange={(e) => setFormData({ ...formData, founderEmail: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                  Founder Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98XXX XXXXX"
                  value={formData.founderPhone}
                  onChange={(e) => setFormData({ ...formData, founderPhone: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                  Department & Batch *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CMPN / 2026"
                  value={formData.departmentBatch}
                  onChange={(e) => setFormData({ ...formData, departmentBatch: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                  Primary Domain *
                </label>
                <select
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                  <option value="HealthTech & BioTech">HealthTech & BioTech</option>
                  <option value="FinTech & Web3">FinTech & Web3</option>
                  <option value="EdTech & Learning">EdTech & Learning</option>
                  <option value="SaaS & Enterprise Tools">SaaS & Enterprise Tools</option>
                  <option value="Hardware & IoT">Hardware & IoT</option>
                  <option value="CleanTech & Sustainability">CleanTech & Sustainability</option>
                  <option value="Other">Other Category</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                  Current Venture Stage *
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Idea Stage / Validation">Idea Stage / Problem Validation</option>
                  <option value="Proof of Concept (PoC)">Proof of Concept (PoC) Built</option>
                  <option value="Working Prototype / MVP">Working Prototype / MVP Ready</option>
                  <option value="Early Traction / Revenue">Early Customers / Traction</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                One-Line Summary / Elevator Pitch *
              </label>
              <textarea
                required
                rows={2}
                placeholder="What problem are you solving and for whom? (1–2 sentences)"
                value={formData.oneLineSummary}
                onChange={(e) => setFormData({ ...formData, oneLineSummary: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Pitch Deck Upload */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                Pitch Deck (PDF format, max 10 MB, 1 file)
              </label>
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 text-center hover:border-indigo-500 transition-colors">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pitch-deck-input"
                />
                <label
                  htmlFor="pitch-deck-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <FileUp className="w-6 h-6 text-indigo-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {selectedFile ? selectedFile.name : "Click to select Pitch Deck (PDF)"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {selectedFile
                      ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                      : "PDF only • Up to 10 MB"}
                  </span>
                </label>
              </div>
            </div>

            {/* Confidential Handling Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>Confidential Pitch Deck Notice:</strong> Pitch decks are stored on an isolated private storage volume with strict access control. They are never published or made available to the public. Every access by an authorized reviewer is recorded in an immutable audit log.
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  required
                  checked={formData.consentGiven}
                  onChange={(e) => setFormData({ ...formData, consentGiven: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  I consent to the E-Cell Incubation Committee evaluating my startup details and pitch deck under the terms of the{" "}
                  <a href="/privacy" target="_blank" className="underline text-indigo-500 hover:text-indigo-400">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <span>Submit Application</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
