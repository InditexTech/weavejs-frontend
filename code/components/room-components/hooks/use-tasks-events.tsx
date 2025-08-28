import { v4 as uuidv4 } from "uuid";
import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCollaborationRoom } from "@/store/store";
import { eventBus } from "@/components/utils/events-bus";

export const useTasksEvents = () => {
  const room = useCollaborationRoom((state) => state.room);
  const user = useCollaborationRoom((state) => state.user);
  const clientId = useCollaborationRoom((state) => state.clientId);
  const setClientId = useCollaborationRoom((state) => state.setClientId);
  const setSseConnected = useCollaborationRoom(
    (state) => state.setSseConnected
  );

  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (typeof clientId === "undefined") {
      setClientId(uuidv4());
      return;
    }

    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_V2_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${room}/events?clientId=${clientId}&roomId=${room}`
    );

    eventSource.onopen = () => {
      setSseConnected(true);
    };

    eventSource.addEventListener("weaveWorkloads", ({ data }) => {
      const message = JSON.parse(data);
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
    });

    eventSource.onerror = () => {
      setSseConnected(false);
    };
  }, [room, user?.name, clientId, queryClient, setClientId, setSseConnected]);
};
