import { v4 as uuidv4 } from "uuid";
import React from "react";
import { useCollaborationRoom } from "@/store/store";

export const useTasksEvents = () => {
  const room = useCollaborationRoom((state) => state.room);
  const clientId = useCollaborationRoom((state) => state.clientId);
  const setClientId = useCollaborationRoom((state) => state.setClientId);
  const setTask = useCollaborationRoom((state) => state.setTask);
  const setSseConnected = useCollaborationRoom(
    (state) => state.setSseConnected
  );

  React.useEffect(() => {
    if (typeof clientId === "undefined") {
      setClientId(uuidv4());
      return;
    }

    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_V2_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${room}/events?clientId=${clientId}`
    );

    eventSource.onopen = () => {
      setSseConnected(true);
    };

    eventSource.addEventListener("weaveWorkloads", ({ data }) => {
      const message = JSON.parse(data);
      console.log("SSE message:", message);
      setTask({
        jobId: message.jobId,
        type: message.type,
        status: message.status,
      });
    });

    eventSource.onerror = () => {
      setSseConnected(false);
    };
  }, [room, clientId, setClientId, setSseConnected, setTask]);
};
