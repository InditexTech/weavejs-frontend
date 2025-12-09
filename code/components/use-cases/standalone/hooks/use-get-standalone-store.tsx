// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import { WeaveUser } from "@inditextech/weave-types";
import { WeaveStoreStandalone } from "@inditextech/weave-store-standalone/client";
import React from "react";
import { initStandaloneInstanceImage } from "../utils/utils";

export function useGetStandaloneStore({
  instanceId,
  imageId,
  imageSize,
  data,
  getUser,
}: {
  instanceId: string;
  imageId: string;
  imageSize: { width: number; height: number };
  data: string | undefined;
  getUser: () => WeaveUser;
}) {
  const [store, setStore] = React.useState<WeaveStoreStandalone | null>(null);

  React.useEffect(() => {
    setStore(null);
  }, [instanceId, imageId]);

  React.useEffect(() => {
    if (!store) {
      let finalRoomData = data;
      if (finalRoomData === undefined) {
        finalRoomData = initStandaloneInstanceImage({
          instanceId,
          imageId,
          width: imageSize.width,
          height: imageSize.height,
        });
      }

      const store = new WeaveStoreStandalone(
        {
          roomData: finalRoomData,
        },
        {
          getUser,
          undoManagerOptions: {
            captureTimeout: 500,
          },
        }
      );

      setStore(store);
    }
  }, [getUser, store, instanceId, imageId, data]);

  return store;
}
