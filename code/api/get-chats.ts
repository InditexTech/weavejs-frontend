// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const getChats = async (
  roomId: string,
  resourceId: string,
  limit: number,
  offset: number
) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${roomId}/chats?limit=${limit}&offset=${offset}`;
  const response = await fetch(endpoint, {
    headers: {
      ["x-weave-user-id"]: resourceId,
    },
  });

  if (!response.ok && response.status === 404) {
    return null;
  }

  const data = await response.json();
  return data;
};
