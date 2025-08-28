// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const putThreadAnswer = async ({
  roomId,
  threadId,
  answerId,
  userId,
  clientId,
  content,
}: {
  roomId: string;
  threadId: string;
  answerId: string;
  userId: string;
  clientId: string;
  content?: string;
}) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${roomId}/threads/${threadId}/answers/${answerId}`;
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-weave-user-id": userId,
      "x-weave-client-id": clientId,
    },
    body: JSON.stringify({
      content,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error updating the thread answer: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};
