// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { WeaveExportNodesOptions } from "@inditextech/weave-types";

export const postExportToPDFAsync = async (
  userId: string,
  clientId: string,
  roomId: string,
  roomData: string,
  pages: { title: string; nodes: string[] }[],
  options: WeaveExportNodesOptions,
  responseType: "base64" | "blob" | "zip" = "zip",
) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${roomId}/export/pdf`;

  const exportPayload = {
    roomData,
    pages,
    options: {
      pixelRatio: options.pixelRatio,
      padding: options.padding,
      backgroundColor: options.backgroundColor,
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
    throw new Error("Failed to export to PDF");
  }

  if (responseType === "zip") {
    const blob = await response.blob();

    return blob;
  }

  if (responseType === "blob") {
    const blob = await response.blob();

    return blob;
  }

  if (responseType === "base64") {
    const data = await response.json();
    return data;
  }
};
