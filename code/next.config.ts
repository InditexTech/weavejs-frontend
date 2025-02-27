import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  webpack: (
    config,
  ) => {
    config.externals = [...config.externals, { canvas: "canvas" }];  // required to make Konva work
    return config;
  },
  images: {
    localPatterns: [
      {
        pathname: "/assets/images/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
