// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCollaborationRoom } from "@/store/store";
import { useGetSession } from "./use-get-session";
import { getGlobalEmmiter } from "./use-global-events";

export const useHandleGlobalEvents = () => {
  const searchText = useCollaborationRoom(
    (state) => state.rooms.filters.searchText,
  );
  const statusFilter = useCollaborationRoom(
    (state) => state.rooms.filters.status,
  );

  const { session } = useGetSession();

  const queryClient = useQueryClient();

  const refreshRoomData = React.useCallback(
    (roomId: string) => {
      if (session) {
        const queryKeyAvailableRooms = ["availableRooms"];
        queryClient.invalidateQueries({
          queryKey: queryKeyAvailableRooms,
        });

        const queryKeyRooms = ["getRooms"];
        queryClient.invalidateQueries({
          queryKey: queryKeyRooms,
        });
      }

      const queryKeyRoomInfo = ["getRoomInfo", roomId];
      queryClient.invalidateQueries({
        queryKey: queryKeyRoomInfo,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryClient, session, searchText, statusFilter],
  );

  // ROOM UPDATED
  React.useEffect(() => {
    const handleRoomUpdated = (payload: { roomId: string }) => {
      refreshRoomData(payload.roomId);
    };

    const emmiter = getGlobalEmmiter();

    emmiter.on("roomUpdated", handleRoomUpdated);

    return () => {
      emmiter.off("roomUpdated", handleRoomUpdated);
    };
  }, [refreshRoomData]);

  // ROOM DELETED
  React.useEffect(() => {
    const handleRoomDeleted = (payload: { roomId: string }) => {
      refreshRoomData(payload.roomId);
    };

    const emmiter = getGlobalEmmiter();

    emmiter.on("roomDeleted", handleRoomDeleted);

    return () => {
      emmiter.off("roomDeleted", handleRoomDeleted);
    };
  }, [refreshRoomData]);

  // PAGE CREATED
  React.useEffect(() => {
    const handlePageCreated = (payload: { roomId: string; pageId: string }) => {
      refreshRoomData(payload.roomId);
    };

    const emmiter = getGlobalEmmiter();

    emmiter.on("pageCreated", handlePageCreated);

    return () => {
      emmiter.off("pageCreated", handlePageCreated);
    };
  }, [refreshRoomData]);

  // PAGE DELETED
  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePageDeleted = (payload: { pageId: string; goToPage: any }) => {
      refreshRoomData(payload.goToPage.roomId);
    };

    const emmiter = getGlobalEmmiter();

    emmiter.on("pageDeleted", handlePageDeleted);

    return () => {
      emmiter.off("pageDeleted", handlePageDeleted);
    };
  }, [refreshRoomData]);
};
