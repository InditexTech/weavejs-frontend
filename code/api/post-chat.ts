// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const postChat = async (
  roomId: string,
  chatId: string,
  resourceId: string,
  {
    status,
    title,
  }: {
    status: string;
    title: string;
  }
) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${roomId}/chats`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-weave-user-id": resourceId,
    },
    body: JSON.stringify({
      chatId,
      status,
      title,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error creating chat: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};
