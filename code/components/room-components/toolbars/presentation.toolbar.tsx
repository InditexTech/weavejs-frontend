// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Presentation } from "lucide-react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { useCollaborationRoom } from "@/store/store";
import { useWeave } from "@inditextech/weave-react";
import { Divider } from "../overlay/divider";
import { useIsRoomReady } from "../hooks/use-is-room-ready";

export const PresentationToolbar = () => {
  const isRoomSwitching = useWeave((state) => state.room.switching);

  const setPresentationVisible = useCollaborationRoom(
    (state) => state.setPresentationVisible,
  );

  const isRoomReady = useIsRoomReady();

  if (!isRoomReady || isRoomSwitching) {
    return null;
  }

  return (
    <>
      <ToolbarButton
        icon={<Presentation strokeWidth={1} />}
        onClick={() => {
          setPresentationVisible(true);
        }}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>Presentation mode</p>
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="top"
        tooltipAlign="center"
      />
      <Divider className="h-[20px]" />
    </>
  );
};
