// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const delThreadAnswer = async ({
  roomId,
  threadId,
  answerId,
  userId,
  clientId,
}: {
  roomId: string;
  threadId: string;
  answerId: string;
  userId: string;
  clientId: string;
}) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${roomId}/threads/${threadId}/answers/${answerId}`;
  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-weave-user-id": userId,
      "x-weave-client-id": clientId,
    },
  });

  if (!response.ok) {
    throw new Error(`Error creating thread: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};
