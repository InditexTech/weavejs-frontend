// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import {
  WEAVE_INSTANCE_STATUS,
  WEAVE_STORE_CONNECTION_STATUS,
} from "@inditextech/weave-types";

export const useIsRoomReady = () => {
  const status = useWeave((state) => state.status);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);
  const asyncElementsState = useWeave((state) => state.asyncElements.state);
  const isSwitchingRoom = useWeave((state) => state.room.switching);

  const roomIsReady = React.useMemo(() => {
    return !(
      status !== WEAVE_INSTANCE_STATUS.RUNNING ||
      weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED ||
      asyncElementsState !== "loaded" ||
      isSwitchingRoom
    );
  }, [weaveConnectionStatus, status, asyncElementsState, isSwitchingRoom]);

  return roomIsReady;
};
