// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { WeaveUser } from "@inditextech/weave-types";

export const postThreadAnswer = async ({
  roomId,
  threadId,
  userId,
  clientId,
  userMetadata,
  content,
}: {
  roomId: string;
  threadId: string;
  userId: string;
  clientId: string;
  userMetadata: WeaveUser;
  content: string;
}) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${roomId}/threads/${threadId}/answers`;
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
    }),
  });

  if (!response.ok) {
    throw new Error(`Error creating thread answer: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};
