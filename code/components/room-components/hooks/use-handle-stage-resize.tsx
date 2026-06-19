// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { useWeave } from "@inditextech/weave-react";
import React from "react";
import { WEAVE_INSTANCE_STATUS } from "@inditextech/weave-types";
import { useCollaborationRoom } from "@/store/store";

export const useHandleStageResize = () => {
  const instance = useWeave((state) => state.instance);
  const roomLoaded = useWeave((state) => state.room.loaded);
  const status = useWeave((state) => state.status);

  const setAfterLoadFit = useCollaborationRoom(
    (state) => state.setAfterLoadFit,
  );

  React.useEffect(() => {
    if (!instance) return;

    const handleStageResize = () => {
      if (!instance) return;

      if (status === WEAVE_INSTANCE_STATUS.RUNNING && roomLoaded) {
        instance.triggerAction("fitToPageTool", {
          previousAction: "selectionTool",
          overrideZoom: false,
        });
      }
    };

    const handleOnFitToPage = () => {
      setTimeout(() => {
        setAfterLoadFit(true);
      }, 0);
    };

    instance.addEventListener("onFitToPage", handleOnFitToPage);
    instance.addEventListener("onStageResize", handleStageResize);

    return () => {
      instance.removeEventListener("onFitToPage", handleOnFitToPage);
      instance.removeEventListener("onStageResize", handleStageResize);
    };
  }, [instance, status, roomLoaded]);
};
