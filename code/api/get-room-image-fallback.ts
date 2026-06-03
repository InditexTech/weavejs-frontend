// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const getRoomImageFallback = async (roomId: string, pageId: string) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

  const endpoint = `${apiEndpoint}/${hubName}/rooms/${roomId}/pages/${pageId}/image-fallback`;
  const response = await fetch(endpoint);

  if (!response.ok && response.status === 404) {
    return {};
  }

  const data = (await response.json()) as Record<string, string>;
  return data;
};
