// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const delChat = async (
  roomId: string,
  chatId: string,
  resourceId: string
) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${roomId}/chats/${chatId}`;
  const response = await fetch(endpoint, {
    headers: {
      ["x-weave-user-id"]: resourceId,
    },
    method: "DELETE",
  });

  if (!response.ok && response.status === 404) {
    throw new Error(`Chat doesn't exist`);
  }

  const data = await response.json();
  return data;
};
