// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page";
import markdown from "@/content/legal/legal-notice.md?raw";

export const Route = createFileRoute("/legal-notice")({
  component: () => <LegalPage title="Legal Notice" markdown={markdown} />,
  head: () => ({ meta: [{ title: "Legal Notice | Weave.js" }] }),
});
