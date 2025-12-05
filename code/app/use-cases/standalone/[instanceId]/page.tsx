// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import dynamic from "next/dynamic";

const NoSsr = dynamic(
  () => import("@/components/room-components/no-ssr").then((mod) => mod.NoSsr),
  { ssr: false }
);
const StandalonePage = dynamic(
  () =>
    import("@/components/use-cases/standalone/components/page/page").then(
      (mod) => mod.StandalonePage
    ),
  { ssr: false }
);

export default function UseCasesStandalonePage() {
  return (
    <NoSsr>
      <StandalonePage />
    </NoSsr>
  );
}
