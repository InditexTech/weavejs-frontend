// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { EXPORT_AREA_REFERENCE_PLUGIN_KEY } from "@/components/plugins/export-area-reference/constants";
import { ExportAreaReferencePlugin } from "@/components/plugins/export-area-reference/export-area-reference";
import { useCollaborationRoom } from "@/store/store";
import { useWeave } from "@inditextech/weave-react";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import React from "react";

export const useChangePage = () => {
  const instance = useWeave((state) => state.instance);
  const isSwitchingRoom = useWeave((state) => state.room.switching);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const actualPageElement = useCollaborationRoom(
    (state) => state.pages.actualPageElement,
  );
  const pagesAmount = useCollaborationRoom((state) => state.pages.amount);
  const setActualPageId = useCollaborationRoom(
    (state) => state.setPagesActualPageId,
  );

  React.useEffect(() => {
    if (!instance) {
      return;
    }

    if (
      isSwitchingRoom ||
      weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
    ) {
      return;
    }

    const exportAreaReferencePlugin =
      instance.getPlugin<ExportAreaReferencePlugin>(
        EXPORT_AREA_REFERENCE_PLUGIN_KEY,
      );

    if (!exportAreaReferencePlugin) return;

    if (!actualPageElement) return;

    exportAreaReferencePlugin.setLeftText(actualPageElement.name);
    exportAreaReferencePlugin.setRightText(
      `page ${actualPageElement.index} of ${pagesAmount}`,
    );
  }, [
    instance,
    actualPageElement,
    pagesAmount,
    isSwitchingRoom,
    weaveConnectionStatus,
    setActualPageId,
  ]);
};
