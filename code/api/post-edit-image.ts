// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const postEditImage = async (
  params: {
    roomId: string;
    model: string;
    prompt: string;
    image: string;
    style: string;
    styleStrength: number;
  },
  options: {
    aspectRatio: string;
    personGeneration: string;
    outputOptions: { mimeType: string; compressionQuality: number };
  }
) => {
  const password = sessionStorage.getItem("weave_ai_password");
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${params.roomId}/images/edit?password=${password}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.model,
      prompt: params.prompt,
      image: params.image,
      style: params.style,
      styleStrength: params.styleStrength,
      aspectRatio: options.aspectRatio,
      personGeneration: options.personGeneration,
      outputOptions: options.outputOptions,
    }),
  });

  const data = await response.json();

  return data;
};
