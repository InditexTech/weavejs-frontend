// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export type PostAddTemplateToRoomPayload = {
  roomId?: string;
  roomName?: string;
  frameName: string;
  templateInstanceId: string;
  templateId: string;
  imagesIds: string[];
};

export const postAddTemplateToRoom = async (
  payload: PostAddTemplateToRoomPayload,
) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/templates/add-template-to-room`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error("Failed to add template to room: " + errorData.error);
  }

  const data = await response.json();

  return data;
};
