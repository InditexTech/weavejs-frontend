// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import {
  ImageModeration,
  ImageQuality,
  ImageSampleCount,
  ImageSize,
} from "../types";

export const postGenerateImage = async (
  params: {
    roomId: string;
    prompt: string;
  },
  options: {
    quality: ImageQuality;
    moderation: ImageModeration;
    sampleCount: ImageSampleCount;
    size: ImageSize;
  },
) => {
  const password = sessionStorage.getItem("weave_ai_chat_password");
  const apiEndpoint = import.meta.env.VITE_API_V2_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

  const endpoint = `${apiEndpoint}/${hubName}/rooms/${params.roomId}/images/generate?password=${password}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: params.prompt,
      sample_count: options.sampleCount,
      size: options.size,
      moderation: options.moderation,
      quality: options.quality,
    }),
  });

  const data = await response.json();

  return data;
};
