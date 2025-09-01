// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const getThread = async ({
  roomId,
  threadId,
  userId,
  clientId,
}: {
  roomId: string;
  threadId: string;
  userId: string;
  clientId: string;
}) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${roomId}/threads/${threadId}`;

  const response = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
      "x-weave-user-id": userId,
      "x-weave-client-id": clientId,
    },
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Error getting the thread: ${response.statusText}`);
  }
  if (!response.ok && response.status === 404) {
    return null;
  }

  const data = await response.json();

  return data;
};
