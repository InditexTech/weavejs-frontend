// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { WeaveExportNodesOptions } from "@inditextech/weave-types";

export const postExportToImageAsync = async (
  userId: string,
  clientId: string,
  roomId: string,
  roomData: string,
  nodes: string[],
  options: WeaveExportNodesOptions,
  responseType: "base64" | "blob" | "zip" = "zip",
) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${roomId}/export`;

  const exportPayload = {
    roomData,
    nodes,
    options: {
      format: options.format,
      pixelRatio: options.pixelRatio,
      padding: options.padding,
      backgroundColor: options.backgroundColor,
      ...(options.format === "image/jpeg" && { quality: options.quality }),
    },
    responseType,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-weave-user-id": userId,
      "x-weave-client-id": clientId,
    },
    body: JSON.stringify(exportPayload),
  });

  if (!response.ok) {
    throw new Error("Export room to image request failed");
  }

  const data = await response.json();
  return data;
};
