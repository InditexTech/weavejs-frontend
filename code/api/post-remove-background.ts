// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const postRemoveBackground = async (roomId: string, imageId: string) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${roomId}/images/${imageId}/remove-background`;
  const response = await fetch(endpoint, {
    method: "POST",
  });

  const data = await response.json();

  return data;
};
