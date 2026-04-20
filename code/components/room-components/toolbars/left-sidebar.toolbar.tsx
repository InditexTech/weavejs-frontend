// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { ListTree } from "lucide-react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { useCollaborationRoom } from "@/store/store";
import { useWeave } from "@inditextech/weave-react";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { Divider } from "../overlay/divider";

export const LeftSidebarToolbar = () => {
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const viewType = useCollaborationRoom((state) => state.viewType);

  const showLeftSidebarFloating = useCollaborationRoom(
    (state) => state.showLeftSidebarFloating,
  );
  const setShowLeftSidebarFloating = useCollaborationRoom(
    (state) => state.setShowLeftSidebarFloating,
  );

  if (viewType !== "floating") {
    return null;
  }

  if (weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED) {
    return null;
  }

  return (
    <>
      {!showLeftSidebarFloating && (
        <>
          <Divider className="h-[20px]" />
          <ToolbarButton
            icon={<ListTree strokeWidth={1} />}
            onClick={() => {
              setShowLeftSidebarFloating(true);
            }}
            label={
              <div className="flex gap-3 justify-start items-center">
                <p>Show elements tree</p>
              </div>
            }
            size="small"
            variant="squared"
            tooltipSideOffset={4}
            tooltipSide="top"
            tooltipAlign="start"
          />
        </>
      )}
    </>
  );
};
