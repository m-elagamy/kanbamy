import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
