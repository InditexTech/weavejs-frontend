// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { WeaveUser } from "@inditextech/weave-types";
import Konva from "konva";

export const postStandaloneThread = async ({
  instanceId,
  imageId,
  userId,
  userMetadata,
  position,
  content,
}: {
  instanceId: string;
  imageId: string;
  userId: string;
  userMetadata: WeaveUser;
  position: Konva.Vector2d;
  content: string;
}) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

  const endpoint = `${apiEndpoint}/${hubName}/standalone/${instanceId}/images/${imageId}/threads`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-weave-user-id": userId,
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
