// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const getRoom = async (roomId: string) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

  const endpoint = `${apiEndpoint}/${hubName}/rooms/${roomId}`;
  const response = await fetch(endpoint);

  if (!response.ok && response.status === 404) {
    throw new Error(`Room doesn't exist`);
  }

  const data = await response.bytes();
  return data;
};
