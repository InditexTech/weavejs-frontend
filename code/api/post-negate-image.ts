// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const postNegateImage = async (
  userId: string,
  clientId: string,
  roomId: string,
  imageId: string,
  image: {
    dataBase64: string;
    contentType: string;
  }
) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${roomId}/images/${imageId}/negate`;
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
    throw new Error(`Error negating image: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};
