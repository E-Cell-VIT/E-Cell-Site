"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { submitBlog } from "@/server/actions/public";

const field =
  "w-full rounded-none border border-line bg-surface px-4 py-3 text-sm outline-none transition focus:border-gold focus:shadow-[0_0_0_4px_var(--gold-soft)]";

export function SubmitBlogForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please choose a JPG, PNG or WebP image.");
      e.target.value = "";
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("Please choose an image under 4 MB.");
      e.target.value = "";
      return;
    }
    setError("");
    setPreview(URL.createObjectURL(file));
  }

  function clearImage() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await submitBlog(new FormData(e.currentTarget));
      if (r.ok) {
        setSent(true);
        clearImage();
      } else {
        setError(r.error);
      }
    } catch {
      setError("We couldn't send your submission. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="border border-gold/40 bg-surface p-8 text-center" role="status">
        <CheckCircle2 className="mx-auto h-10 w-10 text-gold" />
        <h2 className="mt-4 font-display text-4xl text-ivory">Submission received</h2>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Thank you. Your blog is now waiting for review by the E-Cell team. If it is approved, it will appear
          on the blog with your name.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/blog" variant="ghost">
            Back to the blog
          </Button>
          <Button
            onClick={() => {
              setSent(false);
              clearImage();
            }}
          >
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 border border-line bg-surface p-6 sm:p-8">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-fg">
          Your name
          <input required name="author" maxLength={80} autoComplete="name" className={`${field} mt-2`} />
        </label>
        <label className="block text-sm font-semibold text-fg">
          Email
          <input
            required
            name="email"
            type="email"
            maxLength={120}
            autoComplete="email"
            className={`${field} mt-2`}
          />
          <span className="mt-1 block font-normal text-xs text-subtle">
            Only used to contact you about this submission. Never published.
          </span>
        </label>
      </div>
      <label className="block text-sm font-semibold text-fg">
        Title
        <input
          required
          name="title"
          maxLength={120}
          minLength={4}
          placeholder="A clear, specific headline"
          className={`${field} mt-2`}
        />
      </label>
      <label className="block text-sm font-semibold text-fg">
        Short summary
        <input
          name="summary"
          maxLength={300}
          placeholder="One or two sentences that explain what the post is about"
          className={`${field} mt-2`}
        />
      </label>
      <div>
        <label className="block text-sm font-semibold text-fg">
          Cover image (optional)
          <span className="mt-1 block font-normal text-xs text-subtle">
            JPG, PNG or WebP up to 4 MB. Shown at the top of the post and on the blog feed.
          </span>
        </label>
        <input
          ref={fileInputRef}
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={onFileChange}
        />
        {preview ? (
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Cover preview"
              className="aspect-[16/9] w-full max-w-xs border border-line bg-surface object-cover"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex cursor-pointer items-center gap-1.5 border border-line bg-surface px-3 py-2 text-xs font-semibold text-fg transition hover:border-gold"
              >
                Change photo
              </button>
              <button
                type="button"
                onClick={clearImage}
                className="inline-flex cursor-pointer items-center gap-1.5 border border-line bg-surface px-3 py-2 text-xs font-semibold text-[#f0a3a3] transition hover:border-red-500/50"
              >
                <X className="h-3.5 w-3.5" /> Remove photo
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 border border-dashed border-line bg-surface/50 p-6 text-sm text-subtle transition hover:border-gold hover:text-fg"
          >
            <ImagePlus className="h-5 w-5 text-gold" />
            <span>Upload a cover photo</span>
          </button>
        )}
      </div>
      <label className="block text-sm font-semibold text-fg">
        Blog post
        <textarea
          required
          name="body"
          rows={14}
          minLength={80}
          maxLength={20000}
          placeholder="Write your post here. Blank lines separate paragraphs."
          className={`${field} mt-2 resize-y leading-relaxed`}
        />
        <span className="mt-1 block font-normal text-xs text-subtle">At least 80 characters.</span>
      </label>
      <div className="border-t border-line pt-5">
        <p className="text-xs leading-5 text-subtle">
          By submitting, you confirm this is your own work and give E-Cell VIT permission to publish it on
          this website with light edits for clarity. Submissions are reviewed before appearing publicly. See
          our{" "}
          <Link href="/privacy" className="text-gold hover:text-gold-light">
            privacy policy
          </Link>
          .
        </p>
        {error && (
          <p className="mt-4 text-sm text-[#f0a3a3]" role="alert">
            {error}
          </p>
        )}
        <Button disabled={busy} className="mt-5 w-full sm:w-auto">
          {busy ? "Submitting…" : "Submit for review"}
        </Button>
      </div>
    </form>
  );
}
