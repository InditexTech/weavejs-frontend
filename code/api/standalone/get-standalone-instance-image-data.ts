// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const getStandaloneInstanceImageData = async (
  instanceId: string,
  imageId: string
) => {
  let endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/standalone/${instanceId}/images/${imageId}/data`;
  const response = await fetch(endpoint);

  if (!response.ok && response.status === 404) {
    throw new Error(`Instance / image data doesn't exist`);
  }

  const data = await response.json();
  return data;
};
