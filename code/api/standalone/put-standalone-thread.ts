// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { ThreadStatus } from "@/components/room-components/hooks/types";

export const putStandaloneThread = async ({
  instanceId,
  imageId,
  threadId,
  userId,
  x,
  y,
  status,
  content,
}: {
  instanceId: string;
  imageId: string;
  threadId: string;
  userId: string;
  x?: number;
  y?: number;
  status?: ThreadStatus;
  content?: string;
}) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

  const endpoint = `${apiEndpoint}/${hubName}/standalone/${instanceId}/images/${imageId}/threads/${threadId}`;
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-weave-user-id": userId,
    },
    body: JSON.stringify({
      x,
      y,
      status,
      content,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error updating the thread: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};
