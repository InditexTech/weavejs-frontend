// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");

const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        'konva': path.resolve(__dirname, 'node_modules/konva'),
        'yjs': path.resolve(__dirname, 'node_modules/yjs'),
      },
    }
    config.externals = [...config.externals, { canvas: "canvas", ["skia-canvas"]: "skia-canvas" }]; // required to make Konva work
    return config;
  },
  experimental: {
    proxyTimeout: 60000 * 5,
  },
  async redirects() {
    return [
      // Wildcard path matching
      {
        source: "/room/:slug",
        destination: "/rooms/:slug",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/weavebff/:path*",
          destination: `${process.env.BACKEND_ENDPOINT}/:path*`, // Proxy to Backend
        },
      ],
    };
  },
  headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
  images: {
    localPatterns: [
      {
        pathname: "/assets/images/**",
        search: "",
      },
      {
        pathname: "/weavebff/api/v1/weavejs/rooms/**/images/**",
        search: "",
      },
    ],
  },
};

module.exports = nextConfig;
