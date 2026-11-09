import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/marketplace", destination: "/jobs", permanent: true }];
  },
  /* config options here */
  experimental: {
    agentUpgrade: "security",
    // CV and cover-photo uploads go through server actions; Vercel itself caps request bodies at ~4.5 MB.
    serverActions: { bodySizeLimit: "4mb" },
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
