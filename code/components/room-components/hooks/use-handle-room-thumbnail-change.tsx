// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { v4 as uuidv4 } from "uuid";
import { getGlobalEmmiter } from "./use-global-events";

type UseHandleRoomThumbnailChangeProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  room: any;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getImageURL(room: any) {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;
  return `${apiEndpoint}/${hubName}/rooms/${room?.roomId}/thumbnail`;
}

export const useHandleRoomThumbnailChange = ({
  room,
}: Readonly<UseHandleRoomThumbnailChangeProps>) => {
  const [thumbnailURL, setThumbnailURL] = React.useState<string>(
    getImageURL(room) + `?t=${uuidv4()}`,
  );

  React.useEffect(() => {
    const handleRoomThumbnailUpdate = async (payload: {
      roomId: string;
      dataURL: string;
    }) => {
      if (payload.roomId === room.roomId) {
        setThumbnailURL(getImageURL(room) + `?t=${uuidv4()}`);
      }
      if (payload.dataURL && payload.roomId === room.roomId) {
        setThumbnailURL(payload.dataURL);
      }
    };

    const emmiter = getGlobalEmmiter();

    emmiter.on("roomThumbnailUpdated", handleRoomThumbnailUpdate);

    return () => {
      emmiter.off("roomThumbnailUpdated", handleRoomThumbnailUpdate);
    };
  }, [room]);

  return thumbnailURL;
};
