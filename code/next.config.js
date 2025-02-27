const nextConfig = {
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

module.exports = nextConfig;
