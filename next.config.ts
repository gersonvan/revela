import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/@img/sharp-libvips-linux-x64/**/*",
      "./node_modules/@img/sharp-linux-x64/**/*",
      "./node_modules/sharp/**/*",
    ],
  },
  serverExternalPackages: ["sharp"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
