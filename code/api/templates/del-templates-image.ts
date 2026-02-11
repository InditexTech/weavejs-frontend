// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const delTemplatesImage = async (roomId: string, imageId: string) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/templates/${roomId}/images/${imageId}`;
  const response = await fetch(endpoint, {
    method: "DELETE",
  });
  const data = await response.json();
  return data;
};
