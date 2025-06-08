import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/creator-list",
        destination: "https://api.captions.ai/creator/list",
      },
    ];
  },
};

export default nextConfig;