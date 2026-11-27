// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const LEGAL_PAGES = [
  { label: "COOKIES POLICY", title: "Cookies Policy", to: "/cookies-policy" },
  { label: "LEGAL NOTICE", title: "Legal Notice", to: "/legal-notice" },
  { label: "PRIVACY POLICY", title: "Privacy Policy", to: "/privacy-policy" },
] as const;

export const LEGAL_PATHS: string[] = LEGAL_PAGES.map((p) => p.to);
