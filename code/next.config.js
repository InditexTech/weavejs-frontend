const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  webpack: (
    config,
  ) => {
    config.externals = [...config.externals, { canvas: "canvas" }];  // required to make Konva work
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/weavebff/:path*',
        destination: `${process.env.BACKEND_ENDPOINT}/:path*` // Proxy to Backend
      }
    ]
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

module.exports = nextConfig;
