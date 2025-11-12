import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Disable image optimization for static hosting
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
