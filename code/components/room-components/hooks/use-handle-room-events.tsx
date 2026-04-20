// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getEmmiter } from "./use-tasks-events";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { WeaveStoreAzureWebPubsub } from "@inditextech/weave-store-azure-web-pubsub/client";
import { useGetSession } from "./use-get-session";
import { useNavigate } from "@tanstack/react-router";

export const useHandleRoomEvents = () => {
  const navigate = useNavigate();

  const instance = useWeave((state) => state.instance);

  const actualPageId = useCollaborationRoom(
    (state) => state.pages.actualPageId,
  );
  const searchText = useCollaborationRoom(
    (state) => state.rooms.filters.searchText,
  );
  const statusFilter = useCollaborationRoom(
    (state) => state.rooms.filters.status,
  );
  const setPagesActualPage = useCollaborationRoom(
    (state) => state.setPagesActualPage,
  );
  const setPagesActualPageId = useCollaborationRoom(
    (state) => state.setPagesActualPageId,
  );
  const setPagesListVisible = useCollaborationRoom(
    (state) => state.setPagesListVisible,
  );
  const setPagesGridVisible = useCollaborationRoom(
    (state) => state.setPagesGridVisible,
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

  const refreshPageData = React.useCallback(
    (roomId: string, pageId: string) => {
      const queryKeyPagesInfiniteGrid = ["getPagesInfiniteGrid", roomId];
      queryClient.invalidateQueries({
        queryKey: queryKeyPagesInfiniteGrid,
      });

      const queryKeyPagesInfiniteList = ["getPagesInfiniteList", roomId];
      queryClient.invalidateQueries({
        queryKey: queryKeyPagesInfiniteList,
      });

      const queryKeyPages = ["getPages", roomId];
      queryClient.invalidateQueries({ queryKey: queryKeyPages });

      let queryKeyPage = ["getPage", roomId, pageId];
      queryClient.invalidateQueries({ queryKey: queryKeyPage });

      queryKeyPage = ["getPage", roomId, pageId];
      queryClient.invalidateQueries({ queryKey: queryKeyPage });
    },
    [queryClient],
  );

  // ROOM UPDATED
  React.useEffect(() => {
    const handleRoomUpdated = (payload: { roomId: string }) => {
      refreshRoomData(payload.roomId);
    };

    const emmiter = getEmmiter();

    emmiter.on("roomUpdated", handleRoomUpdated);

    return () => {
      emmiter.off("roomUpdated", handleRoomUpdated);
    };
  }, [refreshRoomData]);

  // ROOM DELETED
  React.useEffect(() => {
    const handleRoomDeleted = async (payload: { roomId: string }) => {
      refreshRoomData(payload.roomId);

      sessionStorage.removeItem(`weave.js_${payload.roomId}`);
      await instance?.getStore().disconnect();
      navigate({ to: "/" });
    };

    const emmiter = getEmmiter();

    emmiter.on("roomDeleted", handleRoomDeleted);

    return () => {
      emmiter.off("roomDeleted", handleRoomDeleted);
    };
  }, [navigate, instance, refreshRoomData]);

  // PAGE CREATED
  React.useEffect(() => {
    const handlePageCreated = (payload: { roomId: string; pageId: string }) => {
      refreshRoomData(payload.roomId);
      refreshPageData(payload.roomId, payload.pageId);
    };

    const emmiter = getEmmiter();

    emmiter.on("pageCreated", handlePageCreated);

    return () => {
      emmiter.off("pageCreated", handlePageCreated);
    };
  }, [refreshPageData, refreshRoomData]);

  // PAGE UPDATED
  React.useEffect(() => {
    const handlePageUpdated = (payload: { roomId: string; pageId: string }) => {
      refreshPageData(payload.roomId, payload.pageId);
    };

    const emmiter = getEmmiter();

    emmiter.on("pageUpdated", handlePageUpdated);

    return () => {
      emmiter.off("pageUpdated", handlePageUpdated);
    };
  }, [refreshPageData]);

  // PAGE DELETED
  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePageDeleted = (payload: { pageId: string; goToPage: any }) => {
      if (!instance) return;

      const goToPage = payload.goToPage;

      refreshRoomData(goToPage.roomId);
      refreshPageData(goToPage.roomId, goToPage.pageId);

      const queryKeyPage = ["getPage", goToPage.roomId, payload.pageId];
      queryClient.invalidateQueries({ queryKey: queryKeyPage });

      if (actualPageId === payload.pageId) {
        const store = instance.getStore() as WeaveStoreAzureWebPubsub;

        store.switchToRoom(goToPage.pageId, goToPage);

        setPagesActualPage(goToPage.index);
        setPagesActualPageId(goToPage.pageId);
        setPagesListVisible(false);
        setPagesGridVisible(false);
      }
    };

    const emmiter = getEmmiter();

    emmiter.on("pageDeleted", handlePageDeleted);

    return () => {
      emmiter.off("pageDeleted", handlePageDeleted);
    };
  }, [
    instance,
    actualPageId,
    queryClient,
    refreshPageData,
    refreshRoomData,
    setPagesActualPage,
    setPagesActualPageId,
    setPagesGridVisible,
    setPagesListVisible,
  ]);
};
