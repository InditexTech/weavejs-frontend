// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const delStandaloneThread = async ({
  instanceId,
  imageId,
  threadId,
  userId,
}: {
  instanceId: string;
  imageId: string;
  threadId: string;
  userId: string;
}) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/standalone/${instanceId}/images/${imageId}/threads/${threadId}`;
  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-weave-user-id": userId,
    },
  });

  if (!response.ok) {
    throw new Error(`Error creating thread: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};
