// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/v1/liveness/")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json(
          { status: "OK" },
          {
            status: 200,
          },
        );
      },
    },
  },
});
