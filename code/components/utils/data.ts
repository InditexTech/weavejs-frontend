// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { getRoom } from "@/api/get-room";
import { getRoomImageFallback } from "@/api/get-room-image-fallback";
import { RoomDataStatus } from "@/store/store";
import { QueryClient } from "@tanstack/react-query";

export const getRoomData = async (
  queryClient: QueryClient,
  roomId: string,
  pageId: string,
  updateStatus: (status: RoomDataStatus) => void,
  updateImageFallback: (imageFallback: Record<string, string>) => void,
) => {
  const loadRoomData = async () => {
    updateStatus("pending");
    const data = await queryClient.fetchQuery({
      queryKey: ["roomData", pageId],
      queryFn: () => getRoom(pageId),
    });
    updateStatus("success");
    return data;
  };

  const loadRoomImageFallbackData = async () => {
    if (roomId === "" || pageId === "") {
      return {};
    }

    updateStatus("pending");
    const data = await queryClient.fetchQuery({
      queryKey: ["roomImageFallbackData", roomId, pageId],
      queryFn: () => getRoomImageFallback(roomId, pageId),
    });
    updateImageFallback(data);
    return data;
  };

  const promises = [loadRoomData(), loadRoomImageFallbackData()];
  const results = await Promise.allSettled(promises);

  if (results[0].status === "fulfilled" && results[1].status === "fulfilled") {
    return {
      roomData: results[0].value as Uint8Array<ArrayBuffer>,
      imageFallbackData: results[1].value as Record<string, string>,
    };
  } else {
    updateStatus("error");
    throw new Error("Error loading room data or image fallback data");
  }
};
