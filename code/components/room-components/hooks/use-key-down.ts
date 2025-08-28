// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { useWeave } from "@inditextech/weave-react";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import React from "react";

const canDetectKeyboard = () => {
  const editingTextNodes =
    Object.keys(window.weaveTextEditing ?? {}).length !== 0;
  return !editingTextNodes;
};

export const useKeyDown = (
  callback: () => void,
  keys: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modifiers: (event: any) => boolean = () => true
) => {
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const onKeyDown = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any) => {
      const wasAnyKeyPressed = keys.some((key: string) => event.code === key);
      if (
        wasAnyKeyPressed &&
        !window.weaveOnFieldFocus &&
        canDetectKeyboard() &&
        modifiers(event) &&
        weaveConnectionStatus === WEAVE_STORE_CONNECTION_STATUS.CONNECTED
      ) {
        event.preventDefault();
        callback();
      }
    },
    [callback, keys, weaveConnectionStatus, modifiers]
  );

  React.useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);
};
