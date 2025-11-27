// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const getChat = async (threadId: string, resourceId: string) => {
  const endpoint = `/api/ai/chats/${threadId}`;
  const response = await fetch(endpoint, {
    headers: {
      ai_resource_id: resourceId,
    },
  });

  if (!response.ok && response.status === 404) {
    throw new Error(`Chat doesn't exist`);
  }

  const data = await response.json();
  return data;
};
