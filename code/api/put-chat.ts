// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { ThreadStatus } from "@/components/room-components/hooks/types";

export const putChat = async (
  roomId: string,
  chatId: string,
  resourceId: string,
  {
    title,
    status,
    updatedAt,
  }: {
    title?: string;
    status?: ThreadStatus;
    updatedAt?: string;
  },
  relative = true,
) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;
  const backendEndpoint = import.meta.env.VITE_BACKEND_ENDPOINT;

  const server = `${backendEndpoint}/api/v1`;
  const endpoint = `${relative ? apiEndpoint : server}/${hubName}/rooms/${roomId}/chats/${chatId}`;

  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-weave-user-id": resourceId,
    },
    body: JSON.stringify({
      title,
      status,
      updatedAt,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error updating the chat: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};
