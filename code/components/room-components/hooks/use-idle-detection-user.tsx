// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";

const USER_IDLE_DETECTION_INTERVAL = 3600000; // 1 hour
// const USER_IDLE_DETECTION_INTERVAL = 20000;

export const useIdleDetectionUser = () => {
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const inactivityDetectionTimer =
    React.useRef<ReturnType<typeof setTimeout>>();
  const [inactive, setInactive] = React.useState<boolean>(false);

  const resetInactivityDetectionTimer = () => {
    clearTimeout(inactivityDetectionTimer.current);
    setInactive(false);
    inactivityDetectionTimer.current = setTimeout(
      () => setInactive(true),
      USER_IDLE_DETECTION_INTERVAL
    );
  };

  React.useEffect(() => {
    if (weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED) {
      clearTimeout(inactivityDetectionTimer.current);
      return;
    }

    const events = ["mousemove", "keydown", "scroll", "touchstart", "click"];

    events.forEach((ev) =>
      window.addEventListener(ev, resetInactivityDetectionTimer)
    );
    resetInactivityDetectionTimer(); // start timer

    return () => {
      events.forEach((ev) =>
        window.removeEventListener(ev, resetInactivityDetectionTimer)
      );
      clearTimeout(inactivityDetectionTimer.current);
    };
  }, [weaveConnectionStatus]);

  return inactive;
};
