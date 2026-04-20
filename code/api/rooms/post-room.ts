// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { RoomKind } from "@/components/room-components/overlay/create-room";
import { v4 as uuidv4 } from "uuid";

export const postRoom = async ({
  name,
  kind,
}: {
  name: string;
  kind: RoomKind;
}) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;

  const endpoint = `${apiEndpoint}/rooms`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      roomId: uuidv4(),
      status: "active",
      kind,
      name,
      thumbnail: null,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error creating room: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};
