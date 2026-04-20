// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const getStandaloneThreads = async (
  instanceId: string,
  imageId: string,
  status: string,
  paginated: boolean,
  offset: number = 0,
  limit: number = 20,
) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

  const endpoint = `${apiEndpoint}/${hubName}/standalone/${instanceId}/images/${imageId}/threads?offset=${offset}&limit=${limit}&status=${status}&paginated=${paginated}`;

  const response = await fetch(endpoint);
  const data = await response.json();
  return data;
};
