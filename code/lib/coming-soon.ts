// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const COMING_SOON_PATH = "/coming-soon";

const ALLOWED_PREFIXES = [
  "/v1/",
  "/weavebff/",
  "/fonts/",
  "/assets/",
  "/_build/",
  "/_serverFn/",
  "/@",
  "/node_modules/",
  "/src/",
];

const ALLOWED_EXACT = new Set([
  "/v1",
  "/weavebff",
  COMING_SOON_PATH,
  "/favicon.ico",
]);

export function isComingSoonEnabled(): boolean {
  return import.meta.env.VITE_COMING_SOON === "true";
}

export function isAllowedPath(pathname: string): boolean {
  const path =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  if (ALLOWED_EXACT.has(path)) return true;
  return ALLOWED_PREFIXES.some((p) => path.startsWith(p));
}
