// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { useCollaborationRoom } from "@/store/store";
import { useParams, useSearchParams } from "next/navigation";
import React from "react";

function useHandleRouteParams() {
  const [loadedParams, setLoadedParams] = React.useState(false);
  const setRoom = useCollaborationRoom((state) => state.setRoom);
  const params = useParams<{ roomId: string }>();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const roomId = params.roomId;
    if (roomId) {
      setRoom(roomId);
    }
    setLoadedParams(true);
  }, [params.roomId, searchParams, setRoom]);

  return {
    loadedParams,
  };
}

export default useHandleRouteParams;
