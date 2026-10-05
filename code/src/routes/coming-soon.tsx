// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/coming-soon/coming-soon-page";

export const Route = createFileRoute("/coming-soon")({
  component: ComingSoonPage,
  head: () => ({
    meta: [
      { title: "Coming soon | Weave.js" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});
