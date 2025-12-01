// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { ChatMessage } from "@/mastra/manager/chat";

export const postChatMessages = async (
  roomId: string,
  chatId: string,
  resourceId: string,
  messages: ChatMessage[],
  relative = true
) => {
  const server = `${process.env.BACKEND_ENDPOINT}/api/v1`;
  const endpoint = `${relative ? process.env.NEXT_PUBLIC_API_ENDPOINT : server}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${roomId}/chats/${chatId}/messages`;

  console.log("Posting chat messages to endpoint:", endpoint);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-weave-user-id": resourceId,
    },
    body: JSON.stringify({
      messages,
    }),
  });

  console.log(
    "Response from posting chat messages:",
    response.status,
    response.statusText
  );

  if (!response.ok) {
    throw new Error(`Error creating chat messages: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};
