// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { createFileRoute } from "@tanstack/react-router";
import { Error } from "@/components/error/error";
import React from "react";

export const Route = createFileRoute("/error/")({
  component: ErrorPage,
  head: () => ({
    meta: [
      {
        title: "Error | Weave.js",
      },
    ],
  }),
});

function ErrorPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Error />
    </React.Suspense>
  );
}
