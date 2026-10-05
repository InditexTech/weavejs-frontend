import { defineConfig } from "nitro";

export default defineConfig({
  // devProxy: {},
  handlers: [
    {
      route: "/**",
      handler: "./server/middleware/coming-soon.ts",
      middleware: true,
    },
  ],
  routeRules: {
    "/weavebff/**": {
      proxy: {
        to: `${import.meta.env.VITE_BACKEND_ENDPOINT}/**`,
        fetchOptions: {
          redirect: "manual",
        },
      },
    },
  },
  // logLevel: 3,
});
