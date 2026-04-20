// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { RoomKind } from "@/components/room-components/overlay/create-room";

export const getRooms = async (
  offset: number = 0,
  limit: number = 20,
  filters?: {
    name?: string;
    status?: string;
    kind?: RoomKind;
  },
) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;

  const endpoint = `${apiEndpoint}/rooms?offset=${offset}&limit=${limit}${filters?.name ? `&name=${filters.name}` : ""}${filters?.status ? `&status=${filters.status}` : ""}${filters?.kind ? `&kind=${filters.kind}` : ""}`;

  const response = await fetch(endpoint);

  if (!response.ok && response.status === 404) {
    return null;
  }

  const data = await response.json();

  return data;
};
