// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { WeaveExportNodesOptions } from "@inditextech/weave-types";

export const postExportPageToImageAsync = async (
  params: {
    userId: string;
    clientId: string;
    roomId: string;
    roomData: string;
    options: WeaveExportNodesOptions;
    responseType: "base64" | "blob" | "zip";
  } & (
    | {
        type: "nodes";
        nodes: string[];
      }
    | {
        type: "area";
        area: { x: number; y: number; width: number; height: number };
      }
  ),
) => {
  const { type, userId, clientId, roomId, roomData, options, responseType } =
    params;

  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

  const endpoint = `${apiEndpoint}/${hubName}/rooms/${roomId}/export`;

  const exportPayload = {
    roomData,
    type,
    ...(type === "nodes" && { nodes: params.nodes }),
    ...(type === "area" && { area: params.area }),
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
