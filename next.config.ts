import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable Turbopack to use webpack (needed for pino/thread-stream compatibility)
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Fix for thread-stream module issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
