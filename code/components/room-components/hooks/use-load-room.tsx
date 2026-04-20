// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { getRoom } from "@/api/rooms/get-room";
import { useCollaborationRoom } from "@/store/store";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export const useLoadRoom = () => {
  const roomId = useCollaborationRoom((state) => state.room);
  const setRoomInfoData = useCollaborationRoom(
    (state) => state.setRoomInfoData,
  );
  const setRoomInfoError = useCollaborationRoom(
    (state) => state.setRoomInfoError,
  );
  const setRoomInfoLoading = useCollaborationRoom(
    (state) => state.setRoomInfoLoading,
  );
  const setRoomInfoLoaded = useCollaborationRoom(
    (state) => state.setRoomInfoLoaded,
  );

  const { data, isFetched, isFetching, error, isError } = useQuery({
    queryKey: ["getRoomInfo", roomId ?? ""],
    queryFn: async () => {
      return await getRoom(roomId ?? "");
    },
    initialData: undefined,
    staleTime: 0,
    retry: false,
    enabled: !!roomId,
  });

  React.useEffect(() => {
    setRoomInfoData(undefined);
    setRoomInfoError(undefined);
  }, [roomId, setRoomInfoData, setRoomInfoError]);

  React.useEffect(() => {
    if (data && isFetched && !isError) {
      setRoomInfoData(data);
    }
    if (isError && error) {
      setRoomInfoError(error);
    }
    setRoomInfoLoading(isFetching);
    setRoomInfoLoaded(isFetched);
  }, [
    data,
    isFetched,
    isFetching,
    error,
    isError,
    setRoomInfoData,
    setRoomInfoError,
    setRoomInfoLoading,
    setRoomInfoLoaded,
  ]);
};
