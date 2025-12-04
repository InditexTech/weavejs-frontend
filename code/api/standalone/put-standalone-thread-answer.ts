// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const putStandaloneThreadAnswer = async ({
  instanceId,
  imageId,
  threadId,
  answerId,
  userId,
  content,
}: {
  instanceId: string;
  imageId: string;
  threadId: string;
  answerId: string;
  userId: string;
  content?: string;
}) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/standalone/${instanceId}/images/${imageId}/threads/${threadId}/answers/${answerId}`;
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-weave-user-id": userId,
    },
    body: JSON.stringify({
      content,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error updating the thread answer: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};
