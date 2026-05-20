// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const postPage = async (
  roomId: string,
  {
    pageId,
    name,
    thumbnail,
    position,
    templateId,
    target,
  }: {
    pageId: string;
    name: string;
    thumbnail: string;
    position?: number;
    templateId?: string;
    target?: {
      id: string;
      position: {
        x: number;
        y: number;
      };
    };
  },
) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

  const endpoint = `${apiEndpoint}/${hubName}/rooms/${roomId}/pages`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pageId,
      name,
      thumbnail,
      position,
      templateId,
      target,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error creating page: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};
