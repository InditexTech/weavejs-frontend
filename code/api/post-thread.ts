// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { WeaveUser } from "@inditextech/weave-types";
import Konva from "konva";

export const postThread = async ({
  roomId,
  userId,
  clientId,
  userMetadata,
  position,
  content,
}: {
  roomId: string;
  userId: string;
  clientId: string;
  userMetadata: WeaveUser;
  position: Konva.Vector2d;
  content: string;
}) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

  const endpoint = `${apiEndpoint}/${hubName}/rooms/${roomId}/threads`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-weave-user-id": userId,
      "x-weave-client-id": clientId,
    },
    body: JSON.stringify({
      userId,
      userMetadata,
      content,
      x: position.x,
      y: position.y,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error creating thread: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};
