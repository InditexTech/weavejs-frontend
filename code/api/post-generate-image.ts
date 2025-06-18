// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const postGenerateImage = async (
  roomId: string,
  model: string,
  prompt: string
  // options: {
  //   size: string;
  // aspectRatio: string;
  // sampleImageStyle: string;
  // personGeneration: string;
  // outputOptions: { mimeType: string; compressionQuality: number };
  // }
) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${roomId}/images/generate`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      // size: options.size,
      // aspectRatio: options.aspectRatio,
      // sampleImageStyle: options.sampleImageStyle,
      // personGeneration: options.personGeneration,
      // outputOptions: options.outputOptions,
    }),
  });

  const data = await response.json();

  return data;
};
