// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const delVideo = async (
  userId: string,
  clientId: string,
  roomId: string,
  videoId: string,
) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

  const endpoint = `${apiEndpoint}/${hubName}/rooms/${roomId}/videos/${videoId}`;
  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-weave-user-id": userId,
      "x-weave-client-id": clientId,
    },
  });

  if (!response.ok) {
    throw new Error("Error requesting video deletion.");
  }

  const data = await response.json();
  return data;
};
