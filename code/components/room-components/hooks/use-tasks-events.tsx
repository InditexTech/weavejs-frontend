// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCollaborationRoom } from "@/store/store";
import { eventBus } from "@/components/utils/events-bus";
import { getCommBusNegotiate } from "@/api/get-comm-bus-negotiate";
import { postCommBusJoin } from "@/api/post-comm-bus-join";

export const useTasksEvents = () => {
  const [initializedCommBus, setInitializedCommBus] =
    React.useState<boolean>(false);
  const room = useCollaborationRoom((state) => state.room);
  const user = useCollaborationRoom((state) => state.user);
  const clientId = useCollaborationRoom((state) => state.clientId);
  const setClientId = useCollaborationRoom((state) => state.setClientId);
  const setCommBusConnected = useCollaborationRoom(
    (state) => state.setCommBusConnected
  );

  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (typeof clientId === "undefined") {
      setClientId(uuidv4());
      return;
    }
  }, [clientId, setClientId]);

  React.useEffect(() => {
    if (initializedCommBus) {
      return;
    }

    if (!room || !user?.name) {
      return;
    }

    async function connectToRoomCoomBus() {
      if (!room || !user?.name) {
        return;
      }

      const { url } = await getCommBusNegotiate(room, user?.name ?? "");

      const ws = new WebSocket(url);

      ws.onclose = () => console.log("🔌 closed");

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const type = message.type;

        if (type.startsWith("comment")) {
          eventBus.emit("onCommentsChanged");
        }

        if (
          [
            "addImage",
            "generateImages",
            "editImage",
            "editImageMask",
            "editImageReferences",
            "deleteImage",
            "removeImageBackground",
          ].includes(type)
        ) {
          const queryKey = ["getImages", room];
          queryClient.invalidateQueries({ queryKey });
        }
      };

      ws.onerror = (err) => console.error("❌ error", err);

      ws.onopen = async () => {
        console.log("✅ Connected");

        console.log(`🔌 Join Room ${room}`);

        await postCommBusJoin(room, user?.name ?? "");

        console.log(`✅ Room ${room} joined`);

        setCommBusConnected(true);
      };

      setInitializedCommBus(true);
    }

    connectToRoomCoomBus();
  }, [initializedCommBus, room, user?.name, setCommBusConnected, queryClient]);
};
