// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const getTemplatesImages = async (
  instanceId: string,
  pageSize: number,
  continuationToken: string | undefined,
) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

  let endpoint = `${apiEndpoint}/${hubName}/templates/${instanceId}/images?pageSize=${pageSize}`;

  if (continuationToken) {
    endpoint = `${endpoint}&continuationToken=${continuationToken}`;
  }

  const response = await fetch(endpoint);
  const data = await response.json();
  return data;
};
