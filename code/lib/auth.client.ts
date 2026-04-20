// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { createAuthClient } from "better-auth/react";

console.log("Auth server", import.meta.env.VITE_APP_HOST);

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_APP_HOST,
  basePath: "/weavebff/api/auth",
  fetchOptions: {
    credentials: "include",
  },
});
