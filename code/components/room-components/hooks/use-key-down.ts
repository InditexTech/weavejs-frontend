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

export type useKeyDownCallback = (event: KeyboardEvent) => void;

export const useKeyDown = (callback: useKeyDownCallback) => {
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const onKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED) {
        return;
      }

      if (window.weaveOnFieldFocus) {
        return;
      }

      if (!canDetectKeyboard()) {
        return;
      }

      callback(event);
    },
    [callback, weaveConnectionStatus]
  );

  React.useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);
};
