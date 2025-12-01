// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { ImageReference } from "@/store/ia";

export const postGenerateImage = async (
  params: {
    roomId: string;
    model: string;
    prompt: string;
    reference_images?: ImageReference[];
  },
  options: {
    sampleCount: number;
    aspectRatio: string;
    negativePrompt?: string;
  }
) => {
  const password = sessionStorage.getItem("weave_ai_chat_password");
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${params.roomId}/images/generate?password=${password}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.model,
      prompt: params.prompt,
      reference_images: params.reference_images,
      negative_prompt: options.negativePrompt,
      sample_count: options.sampleCount,
      aspect_ratio: options.aspectRatio,
    }),
  });

  const data = await response.json();

  return data;
};
