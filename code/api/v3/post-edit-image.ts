// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import {
  ImageModeration,
  ImageQuality,
  ImageSampleCount,
  ImageSize,
} from "../types";

export const postEditImageV2 = async (
  params: {
    userId: string;
    clientId: string;
    roomId: string;
    prompt: string;
    image: string;
    reference_images?: string[];
    imageMask?: string;
  },
  options: {
    quality: ImageQuality;
    moderation: ImageModeration;
    sampleCount: ImageSampleCount;
    size: ImageSize;
  }
) => {
  const password = sessionStorage.getItem("weave_ai_chat_password");
  const endpoint = `${process.env.NEXT_PUBLIC_API_V3_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${params.roomId}/images/edit?password=${password}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-weave-user-id": params.userId,
      "x-weave-client-id": params.clientId,
    },
    body: JSON.stringify({
      prompt: params.prompt,
      image: params.image,
      reference_images: params.reference_images,
      imageMask: params.imageMask,
      sample_count: options.sampleCount,
      size: options.size,
      moderation: options.moderation,
      quality: options.quality,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error editing image: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};
