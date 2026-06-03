// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export type PostAddImageTemplateToRoomPayload = {
  roomId: string;
  pageId: string;
  templateId: string;
  target: {
    id: string;
    position: {
      x: number;
      y: number;
    };
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: Record<string, any>;
};

export const postAddImageTemplateToRoom = async (
  payload: PostAddImageTemplateToRoomPayload,
) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

  const endpoint = `${apiEndpoint}/${hubName}/templates/add-image-template-to-room`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error("Failed to add image template to room: " + errorData.error);
  }

  const data = await response.json();

  return data;
};
