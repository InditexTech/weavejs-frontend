// vite.config.ts
import { defineConfig, loadEnv, createLogger } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import mkcert from "vite-plugin-mkcert";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const logger = createLogger();

  const WEAVEJS_REPO_PATH = env.DEV_WEAVEJS_REPO_PATH;

  logger.info(`REPO LOCAL: ${WEAVEJS_REPO_PATH !== undefined}`);
  if (WEAVEJS_REPO_PATH) {
    logger.info(`REPO PATH: ${WEAVEJS_REPO_PATH}`);
  }
  logger.info("");

  let weavejsAlias = {};

  if (WEAVEJS_REPO_PATH) {
    weavejsAlias = {
      "@inditextech/weave-react": path.resolve(WEAVEJS_REPO_PATH, "react/src"),
      "@inditextech/weave-renderer-konva-base": path.resolve(
        WEAVEJS_REPO_PATH,
        "renderer-konva-base/src",
      ),
      "@inditextech/weave-renderer-konva-react-reconciler": path.resolve(
        WEAVEJS_REPO_PATH,
        "renderer-konva-react-reconciler/src",
      ),
      "@inditextech/weave-sdk": path.resolve(WEAVEJS_REPO_PATH, "sdk/src"),
      "@inditextech/weave-store-azure-web-pubsub/client": path.resolve(
        WEAVEJS_REPO_PATH,
        "store-azure-web-pubsub/src/index.client.ts",
      ),
      "@inditextech/weave-store-standalone/client": path.resolve(
        WEAVEJS_REPO_PATH,
        "store-standalone/src/index.client.ts",
      ),
      "@inditextech/weave-store-websockets/client": path.resolve(
        WEAVEJS_REPO_PATH,
        "store-websockets/src/index.client.ts",
      ),
      "@inditextech/weave-types": path.resolve(WEAVEJS_REPO_PATH, "types/src"),
    };
  }

  return {
    server: {
      port: 3000,
    },
    build: {
      rollupOptions: {
        external: ["skia-canvas"],
      },
    },
    define: {
      __GIT_SHA__: JSON.stringify(process.env.VITE_GITHUB_SHA),
    },
    worker: {
      format: "es",
    },
    resolve: {
      tsconfigPaths: true,
      alias: {
        ...weavejsAlias,
        "konva/skia-backend": path.resolve(
          __dirname,
          "node_modules/konva/lib/skia-backend.js",
        ),
        "konva/canvas-backend": path.resolve(
          __dirname,
          "node_modules/konva/lib/canvas-backend.js",
        ),
        konva: path.resolve(__dirname, "node_modules/konva"),
        yjs: path.resolve(__dirname, "node_modules/yjs"),
      },
    },
    plugins: [mkcert(), tailwindcss(), tanstackStart(), viteReact(), nitro()],
  };
});
