// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Cloud, CloudCog, CloudOff } from "lucide-react";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { useWeave } from "@inditextech/weave-react";

export const ConnectionStatus = () => {
  const weaveConnectionStatus = useWeave((state) => state.connection.status);
  const isRoomSwitching = useWeave((state) => state.room.switching);

  return (
    <>
      {isRoomSwitching && (
        <Badge>
          <Cloud size={18} strokeWidth={1} /> changing page
        </Badge>
      )}
      {!isRoomSwitching &&
        weaveConnectionStatus === WEAVE_STORE_CONNECTION_STATUS.CONNECTED && (
          <Badge>
            <Cloud size={18} strokeWidth={1} /> connected
          </Badge>
        )}
      {!isRoomSwitching &&
        weaveConnectionStatus === WEAVE_STORE_CONNECTION_STATUS.CONNECTING && (
          <Badge>
            <CloudCog size={18} strokeWidth={1} />
            connecting
          </Badge>
        )}
      {!isRoomSwitching &&
        weaveConnectionStatus === WEAVE_STORE_CONNECTION_STATUS.ERROR && (
          <Badge>
            <CloudOff size={18} strokeWidth={1} /> error
          </Badge>
        )}
      {!isRoomSwitching &&
        weaveConnectionStatus ===
          WEAVE_STORE_CONNECTION_STATUS.DISCONNECTED && (
          <Badge>
            <CloudOff size={18} strokeWidth={1} /> disconnected
          </Badge>
        )}
    </>
  );
};
