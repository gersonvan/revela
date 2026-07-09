import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  serverExternalPackages: ["sharp"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
