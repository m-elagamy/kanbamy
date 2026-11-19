import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  experimental: {
    authInterrupts: true,
    staleTimes: {
      dynamic: 300,
    },
    useOffline: true,
  },
};

export default nextConfig;
