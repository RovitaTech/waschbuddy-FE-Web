import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
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
  // output: 'export',
  // trailingSlash: true,
  // GitHub Pages configuration
  // basePath: '/waschbaer',
  // assetPrefix: '/waschbaer/',
};

export default nextConfig;
