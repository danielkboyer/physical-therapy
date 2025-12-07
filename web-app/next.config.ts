import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@pt-app/shared-models', '@pt-app/shared-ui'],
};

export default nextConfig;
