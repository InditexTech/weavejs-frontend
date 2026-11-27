// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page";
import markdown from "@/content/legal/privacy-policy.md?raw";

export const Route = createFileRoute("/privacy-policy")({
  component: () => <LegalPage title="Privacy Policy" markdown={markdown} />,
  head: () => ({ meta: [{ title: "Privacy Policy | Weave.js" }] }),
});
