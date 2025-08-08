// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const postRemoveBackgroundV2 = async (
  clientId: string,
  roomId: string,
  imageId: string,
  image: { dataBase64: string; contentType: string }
) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_V2_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${roomId}/images/${imageId}/remove-background?clientId=${clientId}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image }),
  });

  if (!response.ok) {
    throw new Error(`Error removing background: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};
