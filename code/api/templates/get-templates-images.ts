// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const getTemplatesImages = async (
  instanceId: string,
  pageSize: number,
  continuationToken: string | undefined,
) => {
  let endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/templates/${instanceId}/images?pageSize=${pageSize}`;

  if (continuationToken) {
    endpoint = `${endpoint}&continuationToken=${continuationToken}`;
  }

  const response = await fetch(endpoint);
  const data = await response.json();
  return data;
};
