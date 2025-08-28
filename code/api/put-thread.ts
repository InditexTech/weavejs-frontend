// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { ThreadStatus } from "@/components/room-components/hooks/types";

export const putThread = async ({
  roomId,
  threadId,
  userId,
  clientId,
  x,
  y,
  status,
  content,
}: {
  roomId: string;
  threadId: string;
  userId: string;
  clientId: string;
  x?: number;
  y?: number;
  status?: ThreadStatus;
  content?: string;
}) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${roomId}/threads/${threadId}`;
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-weave-user-id": userId,
      "x-weave-client-id": clientId,
    },
    body: JSON.stringify({
      x,
      y,
      status,
      content,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error updating the thread: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};
