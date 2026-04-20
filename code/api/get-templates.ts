// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const getTemplates = async (
  roomId: string,
  offset: number = 0,
  limit: number = 20,
) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

  const endpoint = `${apiEndpoint}/${hubName}/rooms/${roomId}/templates?offset=${offset}&limit=${limit}`;

  const response = await fetch(endpoint);
  const data = await response.json();
  return data;
};
