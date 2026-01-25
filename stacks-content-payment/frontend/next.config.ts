import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // @ts-expect-error - turbopack option is valid but missing in types
  experimental: {
    turbopack: {
      root: path.resolve(__dirname, '..'),
    },
  },
};

export default nextConfig;
