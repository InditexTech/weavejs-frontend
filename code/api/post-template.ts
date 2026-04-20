// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const postTemplate = async ({
  roomId,
  name,
  linkedNodeType,
  templateImage,
  templateData,
}: {
  roomId: string;
  name: string;
  linkedNodeType: string | null;
  templateImage: string;
  templateData: string;
}) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

  const endpoint = `${apiEndpoint}/${hubName}/rooms/${roomId}/templates`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      linkedNodeType,
      templateImage,
      templateData,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error creating template: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};
