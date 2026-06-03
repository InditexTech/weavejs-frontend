// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const postRoomImageFallback = async (
  userId: string,
  clientId: string,
  roomId: string,
  pageId: string,
  imageId: string,
  dataURL: string,
  relative = true,
) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;
  const backendEndpoint = import.meta.env.VITE_BACKEND_ENDPOINT;

  const server = `${backendEndpoint}/api/v1`;
  const endpoint = `${relative ? apiEndpoint : server}/${hubName}/rooms/${roomId}/pages/${pageId}/image-fallback`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-weave-user-id": userId,
      "x-weave-client-id": clientId,
    },
    body: JSON.stringify({
      imageId,
      dataURL,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Error adding an element to the room image-fallback map: ${response.statusText}`,
    );
  }

  const data = await response.json();

  return data;
};
