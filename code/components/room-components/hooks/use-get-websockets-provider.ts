// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { useCollaborationRoom } from "@/store/store";
import { WeaveUser } from "@inditextech/weave-types";
import { WeaveStoreWebsockets } from "@inditextech/weave-store-websockets/client";
import React from "react";

function useGetWebsocketsProvider({
  loadedParams,
  getUser,
}: {
  loadedParams: boolean;
  getUser: () => WeaveUser;
}) {
  const room = useCollaborationRoom((state) => state.room);
  const user = useCollaborationRoom((state) => state.user);

  const store = React.useMemo(() => {
    if (loadedParams && room && user) {
      return new WeaveStoreWebsockets(
        {
          getUser,
          undoManagerOptions: {
            captureTimeout: 500,
          },
        },
        {
          roomId: room,
          wsOptions: {
            serverUrl: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/sync/rooms`,
          },
        }
      );
    }

    return null;
  }, [getUser, loadedParams, room, user]);

  return store;
}

export default useGetWebsocketsProvider;
