// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const delTemplatesImage = async (roomId: string, imageId: string) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

  const endpoint = `${apiEndpoint}/${hubName}/templates/${roomId}/images/${imageId}`;
  const response = await fetch(endpoint, {
    method: "DELETE",
  });
  const data = await response.json();
  return data;
};
