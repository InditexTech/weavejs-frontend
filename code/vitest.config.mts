// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

import path from 'path'

// Lets tests read the SDK's own sources when a local checkout is configured.
const sdkSrc = process.env.DEV_WEAVEJS_REPO_PATH
  ? path.resolve(process.env.DEV_WEAVEJS_REPO_PATH, 'sdk/src')
  : undefined

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: sdkSrc ? { '@weave-sdk-src': sdkSrc } : {},
  },
  test: {
    environment: 'jsdom',
    exclude: [
      ...configDefaults.exclude,
      ...(sdkSrc ? [] : ['**/*.sdk.test.ts']),
    ],
  },
})