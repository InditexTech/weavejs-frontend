// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { WeaveExportNodesOptions } from "@inditextech/weave-types";

export const postExportToImage = async (
  roomData: string,
  nodes: string[],
  options: WeaveExportNodesOptions
) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/export`;

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
    responseType: "zip",
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(exportPayload),
  });

  if (!response.ok) {
    throw new Error("Failed to export room to image");
  }

  const blob = await response.blob();

  return blob;
};
