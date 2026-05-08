// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { FileDown, ImageDown } from "lucide-react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { useCollaborationRoom } from "@/store/store";
import { useWeave } from "@inditextech/weave-react";
import { Divider } from "../overlay/divider";
import { useIsRoomReady } from "../hooks/use-is-room-ready";

export const ExportToolbar = () => {
  const isRoomSwitching = useWeave((state) => state.room.switching);

  const setExportNodes = useCollaborationRoom((state) => state.setExportNodes);
  const setExportPageToImageConfigVisible = useCollaborationRoom(
    (state) => state.setExportPageToImageConfigVisible,
  );
  const setExportRoomToPdfConfigVisible = useCollaborationRoom(
    (state) => state.setExportRoomToPdfConfigVisible,
  );

  const isRoomReady = useIsRoomReady();

  if (!isRoomReady || isRoomSwitching) {
    return null;
  }

  return (
    <>
      <ToolbarButton
        icon={<ImageDown strokeWidth={1} />}
        onClick={() => {
          setExportNodes([]);
          setExportPageToImageConfigVisible(true);
        }}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>Export page as image</p>
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="top"
        tooltipAlign="center"
      />
      <ToolbarButton
        icon={<FileDown strokeWidth={1} />}
        onClick={() => {
          setExportNodes([]);
          setExportRoomToPdfConfigVisible(true);
        }}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>Export room as PDF</p>
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
