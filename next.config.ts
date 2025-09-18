import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
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
  
  // For GitHub Pages deployment
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/wasch_bar_FE_Web' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/wasch_bar_FE_Web' : '',
};

export default nextConfig;
