// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { createFileRoute } from "@tanstack/react-router";

const NO_STORE = { "Cache-Control": "no-store" };

export const Route = createFileRoute("/v1/preview/")({
  server: {
    handlers: {
      // Body: { key } -> exchanges the bypass key for a signed token.
      //       { token } -> verifies a previously issued token.
      POST: async ({ request }) => {
        const { checkKey, issueToken, verifyToken } =
          await import("@/lib/coming-soon-preview.server");

        let body: { key?: unknown; token?: unknown } = {};
        try {
          body = await request.json();
        } catch {
          return Response.json(
            { ok: false },
            { status: 400, headers: NO_STORE },
          );
        }

        if (typeof body.key === "string" && checkKey(body.key)) {
          return Response.json(
            { ok: true, token: issueToken() },
            { headers: NO_STORE },
          );
        }

        if (typeof body.token === "string" && verifyToken(body.token)) {
          return Response.json({ ok: true }, { headers: NO_STORE });
        }

        return Response.json({ ok: false }, { status: 401, headers: NO_STORE });
      },
    },
  },
});
