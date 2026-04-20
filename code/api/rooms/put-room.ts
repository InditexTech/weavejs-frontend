// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const putRoom = async (
  roomId: string,
  { name, thumbnail }: { name?: string; thumbnail?: string },
) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;

  const endpoint = `${apiEndpoint}/rooms/${roomId}`;

  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      thumbnail,
    }),
  });

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
