"use client";

import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Loader2, Sparkles, ExternalLink } from "lucide-react";

interface ContactSectionProps {
  contactEmail?: string;
  contactPhone?: string;
  campusMapUrl?: string;
}

export function ContactSection({
  contactEmail = "ecell@vit.edu.in",
  contactPhone = "+91 22 2416 1126",
  campusMapUrl = "https://maps.google.com/?q=Vidyalankar+Institute+of+Technology+Wadala+Mumbai",
}: ContactSectionProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "Student",
    areaOfInterest: "",
    message: "",
    consentGiven: false,
    honeypot: "",
  });

  const [formLoadedAt, setFormLoadedAt] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormLoadedAt(Date.now());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consentGiven) {
      setError("Please check the consent box to proceed.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          source: "contact_form",
          formLoadedAt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message.");
      }

      setSuccess(true);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        role: "Student",
        areaOfInterest: "",
        message: "",
        consentGiven: false,
        honeypot: "",
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-slate-50/50 dark:bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Get In Touch</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Connect With E-Cell VIT
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Have a question, venture idea, or sponsorship inquiry? Send us a message directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-xl space-y-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Contact Information
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                The Entrepreneurship Cell is located at the Vidyalankar Institute of Technology Campus in Wadala East, Mumbai.
              </p>

              <div className="space-y-4 text-sm">
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 hover:border-indigo-500 transition-colors"
                >
                  <Mail className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-slate-400">Official Email</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 break-all">{contactEmail}</span>
                  </div>
                </a>

                <a
                  href={`tel:${contactPhone}`}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 hover:border-indigo-500 transition-colors"
                >
                  <Phone className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-slate-400">Desk Phone</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{contactPhone}</span>
                  </div>
                </a>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                  <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-slate-400">Campus Address</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                      Vidyalankar Educational Campus, Vidyalankar College Marg, Wadala (East), Mumbai 400037
                    </span>
                  </div>
                </div>
              </div>

              {/* Campus Map Link Button */}
              <div className="pt-2">
                <a
                  href={campusMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 hover:border-indigo-500 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all shadow-sm"
                >
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>View VIT Campus on Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>
          </div>

          {/* Right: Interactive Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-xl">
              {success ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 animate-bounce" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                    Thank you for reaching out to E-Cell VIT Mumbai. A team representative will contact you via email shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="mt-4 px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Send Us an Inquiry
                  </h3>

                  {error && (
                    <div className="p-3.5 text-xs flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Honeypot field */}
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
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98XXX XXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                        Role / Profile *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Student">Student Innovator</option>
                        <option value="Mentor">Industry Mentor</option>
                        <option value="Investor">Investor / VC</option>
                        <option value="Sponsor">Sponsor / Brand</option>
                        <option value="Alumni">VIT Alumni</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                      Area of Interest / Venture Domain *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HealthTech, Grant Guidance, Incubation, Workshop"
                      value={formData.areaOfInterest}
                      onChange={(e) => setFormData({ ...formData, areaOfInterest: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Share details of your inquiry, venture proposal, or collaboration..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  {/* Required Consent Checkbox */}
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
                        I consent to E-Cell VIT processing my information to respond to my inquiry under the{" "}
                        <a href="/privacy" target="_blank" className="underline text-indigo-500 hover:text-indigo-400">
                          Privacy Policy
                        </a>
                        .
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
