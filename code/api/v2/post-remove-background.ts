// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const postRemoveBackground = async (
  userId: string,
  clientId: string,
  roomId: string,
  imageId: string,
  image: {
    dataBase64: string;
    contentType: string;
  },
) => {
  const apiEndpoint = import.meta.env.VITE_API_V2_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

  const endpoint = `${apiEndpoint}/${hubName}/rooms/${roomId}/images/${imageId}/remove-background`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-weave-user-id": userId,
      "x-weave-client-id": clientId,
    },
    body: JSON.stringify({ image }),
  });

  if (!response.ok) {
    throw new Error(`Error removing background: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};
