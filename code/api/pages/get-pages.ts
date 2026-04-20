// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const getPages = async (
  roomId: string,
  status: string | undefined,
  offset: number = 0,
  limit: number = 20,
) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

  const endpoint = `${apiEndpoint}/${hubName}/rooms/${roomId}/pages?offset=${offset}&limit=${limit}${status ? `&status=${status}` : ""}`;

  const response = await fetch(endpoint);

  if (!response.ok && response.status === 401) {
    throw new Error("Unauthorized", {
      cause: response.status,
    });
  }

  if (!response.ok && response.status === 403) {
    throw new Error("You don't have access to this room", {
      cause: response.status,
    });
  }

  if (!response.ok && response.status === 404) {
    throw new Error("Room not found", {
      cause: response.status,
    });
  }

  const data = await response.json();

  return data;
};
