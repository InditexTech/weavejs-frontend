import { defineConfig } from "nitro";

export default defineConfig({
  // devProxy: {},
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
