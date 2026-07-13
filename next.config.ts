import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: "/plausible/api/event",
        destination: "https://plausible.io/api/event",
      },
      {
        source: "/plausible/js/script.js",
        destination: "https://plausible.io/js/script.js",
      },
    ];
  },
};

export default nextConfig;
