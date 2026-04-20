// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { getRoom } from "@/api/rooms/get-room";
import { useQuery } from "@tanstack/react-query";

export const useLoadRoomInfo = (roomId?: string) => {
  const { data, isFetching, error, isError } = useQuery({
    queryKey: ["getRoomInfo", roomId ?? ""],
    queryFn: async () => {
      return await getRoom(roomId ?? "");
    },
    initialData: undefined,
    staleTime: 0,
    retry: false,
    enabled: !!roomId,
  });

  return { data, isFetching, error, isError };
};
