// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const putRoomAccessLink = async (
  accessId: string,
  accessCode: string,
) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;

  const endpoint = `${apiEndpoint}/rooms/access-link/${accessId}`;

  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accessCode }),
  });

  if (!response.ok && response.status === 404) {
    throw new Error("Room not found", {
      cause: response.status,
    });
  }

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

  if (!response.ok) {
    throw new Error("Failed to provide access to the room", {
      cause: response.status,
    });
  }

  const data = await response.json();

  return data;
};
