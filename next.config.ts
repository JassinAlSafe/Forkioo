import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },

  // TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint during builds
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Experimental features
  experimental: {
    // Enable if needed
  },
};

export default nextConfig;
