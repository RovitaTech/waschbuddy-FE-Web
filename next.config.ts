import type { NextConfig } from "next";

// Allow overriding the GitHub Pages base path via env var, e.g. NEXT_PUBLIC_BASE_PATH=web
const rawBase = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || "";
const normalizedBase = rawBase
  ? `/${rawBase.replace(/^\/+|\/+$/g, "")}`
  : "";

const nextConfig: NextConfig = {
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
  },
  // Skip ESLint during production builds (use CI linting instead)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Skip TypeScript type checking during builds (CI will handle type checks)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Images configuration for GitHub Pages
  images: {
    domains: [],
    unoptimized: true, // Required for static export
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // For static export/GitHub Pages deployment
  output: 'export',
  trailingSlash: true,
  // Use env-provided base when building for production; empty for local/dev
  basePath: process.env.NODE_ENV === 'production' ? normalizedBase : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? normalizedBase : '',
};

export default nextConfig;
