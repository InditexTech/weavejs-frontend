// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import {
  ImageModel,
  ImageModeration,
  ImageQuality,
  ImageSampleCount,
  ImageSize,
} from "../types";

export const postGenerateImageV2 = async (
  params: {
    userId: string;
    clientId: string;
    roomId: string;
    prompt: string;
  },
  options: {
    model: ImageModel;
    quality: ImageQuality;
    moderation: ImageModeration;
    sampleCount: ImageSampleCount;
    size: ImageSize;
  },
) => {
  const password = sessionStorage.getItem("weave_ai_chat_password");
  const apiEndpoint = import.meta.env.VITE_API_V3_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

  const endpoint = `${apiEndpoint}/${hubName}/rooms/${params.roomId}/images/generate?password=${password}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-weave-user-id": params.userId,
      "x-weave-client-id": params.clientId,
    },
    body: JSON.stringify({
      model: options.model,
      prompt: params.prompt,
      sample_count: options.sampleCount,
      size: options.size,
      moderation: options.moderation,
      quality: options.quality,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error generating images: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};
