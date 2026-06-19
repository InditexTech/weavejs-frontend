// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { useCollaborationRoom } from "@/store/store";
import { WeaveUser } from "@inditextech/weave-types";
import { WeaveStoreAzureWebPubsub } from "@inditextech/weave-store-azure-web-pubsub/client";
import React from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { getRoom } from "@/api/get-room";
import { useGetSession } from "./use-get-session";
import { useHasIndexedDBData } from "./use-has-indexeddb-data";

function useGetAzureWebPubsubProvider({
  loadedParams,
  pagesManaged,
  getUser,
}: {
  loadedParams: boolean;
  pagesManaged: boolean;
  getUser: () => WeaveUser;
}) {
  const [loadedData, setLoadedData] = React.useState<boolean>(false);
  const [wsProvider, setWsProvider] =
    React.useState<WeaveStoreAzureWebPubsub | null>(null);
  const indexedDbEnabled = useCollaborationRoom(
    (state) => state.features.indexedDb,
  );
  const room = useCollaborationRoom((state) => state.room);
  const pageId = useCollaborationRoom((state) => state.pages.actualPageId);
  const setRoomDataStatus = useCollaborationRoom(
    (state) => state.setRoomDataStatus,
  );

  const { session } = useGetSession();

  const { checkedData, hasData } = useHasIndexedDBData(pageId ?? "", {
    indexedDB: { enabled: indexedDbEnabled },
  });

  const loadData =
    (indexedDbEnabled && !hasData && checkedData) || !indexedDbEnabled;

  const {
    data: pageData,
    status,
    isFetched: pageDataIsFetched,
  } = useQuery({
    queryKey: ["roomData", pageId ?? ""],
    queryFn: async () => {
      const data = getRoom(pageId ?? "");
      setLoadedData(true);
      return data;
    },
    initialData: undefined,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled:
      !loadedData &&
      pagesManaged &&
      loadData &&
      typeof pageId !== "undefined" &&
      typeof session !== "undefined",
  });

  React.useEffect(() => {
    setRoomDataStatus(status);
  }, [status]);

  const roomDataLoaded = React.useMemo(() => {
    if (!indexedDbEnabled) {
      return pageDataIsFetched;
    }

    return (
      (checkedData && !hasData && pageDataIsFetched) || (checkedData && hasData)
    );
  }, [checkedData, hasData, pageDataIsFetched, indexedDbEnabled]);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (
      loadedParams &&
      roomDataLoaded &&
      room &&
      pageId &&
      session &&
      !wsProvider
    ) {
      const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
      const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

      const store = new WeaveStoreAzureWebPubsub(
        pageData,
        {
          getUser,
          undoManagerOptions: {
            captureTimeout: 500,
          },
        },
        {
          roomId: pageId ?? "",
          url: `${apiEndpoint}/${hubName}/rooms/[roomId]/connect`,
          indexedDb: {
            enabled: indexedDbEnabled,
          },
        },
      );

      setWsProvider(store);
    }
  }, [
    getUser,
    pageId,
    wsProvider,
    pageData,
    queryClient,
    roomDataLoaded,
    loadedParams,
    room,
    session,
  ]);

  return wsProvider;
}

export default useGetAzureWebPubsubProvider;
