// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const getThreadAnswers = async (
  roomId: string,
  threadId: string,
  paginated: boolean,
  offset: number = 0,
  limit: number = 20
) => {
  let endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${roomId}/threads/${threadId}/answers?offset=${offset}&limit=${limit}&paginated=${paginated}`;

  const response = await fetch(endpoint);
  const data = await response.json();
  return data;
};
