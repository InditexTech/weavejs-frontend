// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { useCollaborationRoom } from "@/store/store";
import { WeaveUser } from "@inditextech/weave-types";
import { WeaveStoreAzureWebPubsub } from "@inditextech/weave-store-azure-web-pubsub/client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getRoom } from "@/api/get-room";

function useGetAzureWebPubsubProvider({
  loadedParams,
  getUser,
}: {
  loadedParams: boolean;
  getUser: () => WeaveUser;
}) {
  const [wsProvider, setWsProvider] =
    React.useState<WeaveStoreAzureWebPubsub | null>(null);
  const room = useCollaborationRoom((state) => state.room);
  const user = useCollaborationRoom((state) => state.user);

  const { data: roomData, isFetched } = useQuery({
    queryKey: ["roomData", room ?? ""],
    queryFn: () => {
      return getRoom(room ?? "");
    },
    retry: false,
    enabled: typeof room !== "undefined",
  });

  React.useEffect(() => {
    if (loadedParams && isFetched && room && user && !wsProvider) {
      const store = new WeaveStoreAzureWebPubsub(
        roomData,
        {
          getUser,
          undoManagerOptions: {
            captureTimeout: 500,
          },
        },
        {
          roomId: room,

          url: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${room}/connect`,
        }
      );

      setWsProvider(store);
    }
  }, [getUser, isFetched, wsProvider, roomData, loadedParams, room, user]);

  return wsProvider;
}

export default useGetAzureWebPubsubProvider;
