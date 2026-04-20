// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/ai/chats/$chatId")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const { chatId } = params;
        const roomId = request.headers.get("ai_room_id");
        const resourceId = request.headers.get("ai_resource_id");

        if (!roomId) {
          return Response.json(
            { error: "Missing ai_room_id header" },
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        if (!resourceId) {
          return Response.json(
            { error: "Missing ai_resource_id header" },
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const { messages, imageOption } = await request.json();
        const backendEndpoint = import.meta.env.VITE_BACKEND_ENDPOINT;
        const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

        const endpoint = `${backendEndpoint}/api/v1/${hubName}/rooms/${roomId}/ai/chats/${chatId}/message`;

        const response = await fetch(endpoint, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-weave-user-id": resourceId,
            cookie: request.headers.get("cookie") ?? "",
          },
          body: JSON.stringify({
            messages,
            imageOption,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Error creating chat messages: ${response.statusText}`,
          );
        }

        const stream = response.body;
        if (!stream) {
          return new Response("No stream returned", { status: 500 });
        }

        return new Response(stream, {
          status: response.status,
          headers: {
            "Content-Type":
              response.headers.get("Content-Type") ?? "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            // "Transfer-Encoding": "chunked",
          },
        });
      },
    },
  },
});
