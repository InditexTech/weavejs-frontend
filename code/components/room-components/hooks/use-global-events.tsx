// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import Emittery from "emittery";
import React from "react";
import ReconnectingWebsocket from "reconnecting-websocket";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCollaborationRoom } from "@/store/store";
import { getCommBusNegotiate } from "@/api/get-comm-bus-negotiate";
import { postCommBusJoin } from "@/api/post-comm-bus-join";
import { useGetSession } from "./use-get-session";

const GLOBAL_BUS_ROOM = "weavejsGlobal";
const emitter = new Emittery();

export const getGlobalEmmiter = () => {
  return emitter;
};

export const useGlobalEvents = () => {
  const [initializedCommBus, setInitializedCommBus] =
    React.useState<boolean>(false);
  const setCommBusConnected = useCollaborationRoom(
    (state) => state.setCommBusConnected,
  );
  const { session } = useGetSession();

  const queryClient = useQueryClient();

  const getCommBusUrl = useMutation({
    mutationFn: () =>
      getCommBusNegotiate(GLOBAL_BUS_ROOM, session?.user.id ?? ""),
  });

  React.useEffect(() => {
    if (initializedCommBus) {
      return;
    }

    if (!session?.user.id) {
      return;
    }

    async function connectToRoomCoomBus() {
      if (!session?.user.id) {
        return;
      }

      const ws = new ReconnectingWebsocket(async () => {
        const { url } = await getCommBusUrl.mutateAsync();
        console.log("🔌 [Global-Bus] connecting", url);
        return url;
      });

      ws.onclose = (e) => {
        console.log(`🚫 [Global-Bus] closed, code: ${e.code}`);
      };

      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        const type = message.type;

        if (["pageCreated"].includes(type)) {
          emitter.emit("pageCreated", message.payload);
        }

        if (["pageDeleted"].includes(type)) {
          emitter.emit("pageDeleted", message.payload);
        }

        if (["roomUpdated"].includes(type)) {
          emitter.emit("roomUpdated", message.payload);
        }

        if (["roomThumbnailUpdated"].includes(type)) {
          emitter.emit("roomThumbnailUpdated", message.payload);
        }

        if (["roomDeleted"].includes(type)) {
          emitter.emit("roomDeleted", message.payload);
        }
      };

      ws.onerror = (err) => console.error("❌ [Global-Bus] error", err);

      ws.onopen = async () => {
        console.log("✅ [Global-Bus] connected");

        console.log(`🔌 [Global-Bus] join room <${GLOBAL_BUS_ROOM}>`);

        await postCommBusJoin(GLOBAL_BUS_ROOM, session?.user.id ?? "");

        console.log(`✅ [Global-Bus] room <${GLOBAL_BUS_ROOM}> joined`);

        setCommBusConnected(true);
      };

      setInitializedCommBus(true);
    }

    connectToRoomCoomBus();
  }, [
    initializedCommBus,
    getCommBusUrl,
    setCommBusConnected,
    queryClient,
    session,
  ]);
};
