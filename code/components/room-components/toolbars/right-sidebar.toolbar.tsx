// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { useCollaborationRoom } from "@/store/store";
import { useWeave } from "@inditextech/weave-react";
import { Divider } from "../overlay/divider";
import { useIsRoomReady } from "../hooks/use-is-room-ready";

export const RightSidebarToolbar = () => {
  const isRoomSwitching = useWeave((state) => state.room.switching);

  const viewType = useCollaborationRoom((state) => state.viewType);

  const showRightSidebarFloating = useCollaborationRoom(
    (state) => state.showRightSidebarFloating,
  );
  const setShowRightSidebarFloating = useCollaborationRoom(
    (state) => state.setShowRightSidebarFloating,
  );

  const isRoomReady = useIsRoomReady();

  return (
    <>
      {viewType === "floating" && (
        <>
          <Divider className="h-[20px]" />
          <ToolbarButton
            icon={
              showRightSidebarFloating ? (
                <PanelLeftOpen strokeWidth={1} />
              ) : (
                <PanelLeftClose strokeWidth={1} />
              )
            }
            disabled={!isRoomReady || isRoomSwitching}
            onClick={() => {
              setShowRightSidebarFloating(!showRightSidebarFloating);
            }}
            label={
              <div className="flex gap-3 justify-start items-center">
                <p>Toggle right sidebar</p>
              </div>
            }
            size="small"
            variant="squared"
            tooltipSideOffset={12}
            tooltipSide="top"
            tooltipAlign="end"
          />
        </>
      )}
    </>
  );
};
