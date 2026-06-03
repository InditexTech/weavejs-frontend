// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { getRoomImageFallback } from "@/api/get-room-image-fallback";
import { useCollaborationRoom } from "@/store/store";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export const useLoadRoomImageFallback = () => {
  const setRoomImageFallback = useCollaborationRoom(
    (state) => state.setRoomImageFallback,
  );
  const room = useCollaborationRoom((state) => state.room);
  const actualPageId = useCollaborationRoom(
    (state) => state.pages.actualPageId,
  );
  const setRoomImageFallbackLoading = useCollaborationRoom(
    (state) => state.setRoomImageFallbackLoading,
  );
  const setRoomImageFallbackLoaded = useCollaborationRoom(
    (state) => state.setRoomImageFallbackLoaded,
  );

  const { data, isFetching, error, status, isError } = useQuery({
    queryKey: ["roomImageFallbackData", room ?? "", actualPageId ?? ""],
    queryFn: async () => {
      const roomId = room ?? "";
      const pageId = actualPageId ?? "";

      if (roomId === "" || pageId === "") {
        return {};
      }

      return await getRoomImageFallback(roomId, pageId);
    },
    initialData: undefined,
    staleTime: 0,
    retry: false,
    enabled: !!(room && actualPageId),
  });

  React.useEffect(() => {
    if (isFetching) {
      setRoomImageFallbackLoading(true);
    } else {
      setRoomImageFallbackLoading(false);
    }
  }, [isFetching, setRoomImageFallbackLoading]);

  React.useEffect(() => {
    if (status === "success" && data) {
      setRoomImageFallback(data);
      setRoomImageFallbackLoaded(true);
    } else if (status === "error") {
      // Only reset when there is an actual fetch failure, never while pending.
      // Resetting on "pending" (which happens on every page switch) would briefly
      // set roomImageFallbackLoaded=false, causing WeaveProvider to unmount.
      setRoomImageFallback({});
      setRoomImageFallbackLoaded(false);
    }
  }, [status, data, setRoomImageFallback]);

  return { data, isFetching, error, isError };
};
