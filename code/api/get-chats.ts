// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const getChats = async (
  roomId: string,
  resourceId: string,
  limit: number,
  offset: number,
) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

  const endpoint = `${apiEndpoint}/${hubName}/rooms/${roomId}/chats?limit=${limit}&offset=${offset}`;
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
