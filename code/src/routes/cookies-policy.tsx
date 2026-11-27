// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page";
import markdown from "@/content/legal/cookies-policy.md?raw";

export const Route = createFileRoute("/cookies-policy")({
  component: () => <LegalPage title="Cookies Policy" markdown={markdown} />,
  head: () => ({ meta: [{ title: "Cookies Policy | Weave.js" }] }),
});
