// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { WeaveUser } from "@inditextech/weave-types";

export const postStandaloneThreadAnswer = async ({
  instanceId,
  imageId,
  threadId,
  userId,
  userMetadata,
  content,
}: {
  instanceId: string;
  imageId: string;
  threadId: string;
  userId: string;
  userMetadata: WeaveUser;
  content: string;
}) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/standalone/${instanceId}/images/${imageId}/threads/${threadId}/answers`;
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
    }),
  });

  if (!response.ok) {
    throw new Error(`Error creating thread answer: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};
