import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  experimental: {
    externalDir: true,
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
