// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const getThreads = async (
  roomId: string,
  status: string,
  paginated: boolean,
  offset: number = 0,
  limit: number = 20
) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${roomId}/threads?offset=${offset}&limit=${limit}&status=${status}&paginated=${paginated}`;

  const response = await fetch(endpoint);
  const data = await response.json();
  return data;
};
