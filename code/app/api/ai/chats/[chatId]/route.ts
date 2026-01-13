// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: { chatId: string } }
) {
  const { chatId } = context.params;
  const roomId = req.headers.get("ai_room_id");
  const resourceId = req.headers.get("ai_resource_id");

  if (!roomId) {
    return NextResponse.json(
      { error: "Missing ai_room_id header" },
      { status: 400 }
    );
  }

  if (!resourceId) {
    return NextResponse.json(
      { error: "Missing ai_resource_id header" },
      { status: 400 }
    );
  }

  const { messages, imageOption } = await req.json();

  const realChatId = `${chatId}_${roomId}_${resourceId}`;
  const endpoint = `${process.env.BACKEND_ENDPOINT}/api/v1/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${roomId}/ai/chats/${realChatId}/message`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-weave-user-id": resourceId,
    },
    body: JSON.stringify({
      messages,
      imageOption,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error creating chat messages: ${response.statusText}`);
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
      "Transfer-Encoding": "chunked",
    },
  });
}
