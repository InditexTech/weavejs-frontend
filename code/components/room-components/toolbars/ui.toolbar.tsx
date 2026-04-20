// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Maximize2, Minimize2 } from "lucide-react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { useCollaborationRoom } from "@/store/store";
import {
  getSessionConfig,
  setSessionConfig,
} from "@/components/utils/session-config";
import { useWeave } from "@inditextech/weave-react";
import { useIsRoomReady } from "../hooks/use-is-room-ready";

export const UIToolbar = () => {
  const isRoomSwitching = useWeave((state) => state.room.switching);

  const roomInfo = useCollaborationRoom((state) => state.roomInfo.data);
  const viewType = useCollaborationRoom((state) => state.viewType);
  const setViewType = useCollaborationRoom((state) => state.setViewType);

  const isRoomReady = useIsRoomReady();

  return (
    <>
      <ToolbarButton
        icon={
          viewType === "fixed" ? (
            <Maximize2 size={20} strokeWidth={1} />
          ) : (
            <Minimize2 size={20} strokeWidth={1} />
          )
        }
        disabled={!isRoomReady || isRoomSwitching}
        onClick={() => {
          if (!roomInfo) {
            return;
          }

          const room = roomInfo.room.roomId;

          const sessionConfig = getSessionConfig(room);
          sessionConfig.viewType = viewType === "fixed" ? "floating" : "fixed";
          setSessionConfig(room, sessionConfig);

          setViewType(sessionConfig.viewType);
        }}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>{viewType === "fixed" ? "Full screen" : "Fixed screen"}</p>
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="bottom"
        tooltipAlign="center"
      />
    </>
  );
};
