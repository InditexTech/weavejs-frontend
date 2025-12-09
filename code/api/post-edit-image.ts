// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const postEditImage = async (
  params: {
    roomId: string;
    prompt: string;
    image: string;
    imageMask?: string;
  },
  options: {
    seed: number;
    editMode: string;
    sampleCount: number;
    baseSteps?: number;
    guidanceStrength: number;
    negativePrompt?: string;
  }
) => {
  const password = sessionStorage.getItem("weave_ai_chat_password");
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${params.roomId}/images/edit?password=${password}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: params.prompt,
      image: params.image,
      imageMask: params.imageMask,
      sample_count: options.sampleCount,
      edit_mode: options.editMode,
      seed: options.seed,
      base_steps: options.baseSteps,
      guidance_strength: options.guidanceStrength,
      negative_prompt: options.negativePrompt,
    }),
  });

  const data = await response.json();

  return data;
};
