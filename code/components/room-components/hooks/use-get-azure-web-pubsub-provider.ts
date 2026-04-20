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

function useGetAzureWebPubsubProvider({
  loadedParams,
  pagesManaged,
  getUser,
}: {
  loadedParams: boolean;
  pagesManaged: boolean;
  getUser: () => WeaveUser;
}) {
  const [wsProvider, setWsProvider] =
    React.useState<WeaveStoreAzureWebPubsub | null>(null);
  const room = useCollaborationRoom((state) => state.room);
  const pageId = useCollaborationRoom((state) => state.pages.actualPageId);

  const { session } = useGetSession();

  const { data: pageData, isFetched: pageDataIsFetched } = useQuery({
    queryKey: ["roomData", pageId ?? ""],
    queryFn: () => {
      return getRoom(pageId ?? "");
    },
    initialData: undefined,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled:
      pagesManaged &&
      typeof pageId !== "undefined" &&
      typeof session !== "undefined",
  });

  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (loadedParams && pageDataIsFetched && room && session && !wsProvider) {
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
        },
      );

      setWsProvider(store);
    }
  }, [
    getUser,
    pageId,
    pageDataIsFetched,
    wsProvider,
    pageData,
    queryClient,
    loadedParams,
    room,
    session,
  ]);

  return wsProvider;
}

export default useGetAzureWebPubsubProvider;
