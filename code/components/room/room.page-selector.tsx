// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { cn } from "@/lib/utils";
import { useWeave } from "@inditextech/weave-react";
import { Badge } from "@/components/ui/badge";
import { useCollaborationRoom } from "@/store/store";
import { SquarePen } from "lucide-react";
import { ToolbarButton } from "../room-components/toolbar/toolbar-button";

export function RoomPageSelector() {
  const selectionActive = useWeave((state) => state.selection.active);
  const isRoomSwitching = useWeave((state) => state.room.switching);

  const room = useCollaborationRoom((state) => state.room);
  const roomInfo = useCollaborationRoom((state) => state.roomInfo.data);
  const actualPageElement = useCollaborationRoom(
    (state) => state.pages.actualPageElement,
  );
  const pagesListVisible = useCollaborationRoom(
    (state) => state.pages.listVisible,
  );
  const setPagesListVisible = useCollaborationRoom(
    (state) => state.setPagesListVisible,
  );
  const setPagesGridVisible = useCollaborationRoom(
    (state) => state.setPagesGridVisible,
  );
  const setRoomsRoomId = useCollaborationRoom((state) => state.setRoomsRoomId);
  const setRoomsPageId = useCollaborationRoom((state) => state.setRoomsPageId);
  const setRoomsEditVisible = useCollaborationRoom(
    (state) => state.setRoomsEditVisible,
  );
  const setRoomsPageEditVisible = useCollaborationRoom(
    (state) => state.setRoomsPageEditVisible,
  );

  const viewType = useCollaborationRoom((state) => state.viewType);

  return (
    <div
      className={cn(
        "w-auto z-1 flex flex-col gap-1 justify-start items-start py-3 px-6",
        {
          ["pointer-events-none"]: selectionActive,
          ["pointer-events-auto"]: !selectionActive,
          ["border-t-[0.5px] border-[#c9c9c9]"]: viewType === "fixed",
        },
      )}
    >
      <div className="w-full flex justify-start items-center gap-2 whitespace-nowrap max-w-[calc(100%)] font-inter text-base overflow-hidden text-ellipsis">
        <Badge variant="secondary" className="text-sm font-mono">
          ROOM
        </Badge>
        <div className="font-light w-[calc(100%-52px-8px-8px-20px)] truncate">
          {roomInfo?.room?.name || room}
        </div>
        <ToolbarButton
          icon={<SquarePen strokeWidth={1} />}
          onClick={() => {
            setRoomsRoomId(actualPageElement.roomId ?? "");
            setRoomsPageId(actualPageElement.pageId ?? "");
            setRoomsEditVisible(true);
          }}
          disabled={isRoomSwitching}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Edit room</p>
            </div>
          }
          size="small"
          variant="squared"
          tooltipSideOffset={14}
          tooltipSide="right"
          tooltipAlign="center"
        />
      </div>
      {actualPageElement && (
        <>
          <div className="w-full flex gap-2 justify-start items-center max-w-[calc(100%)]">
            <div
              role="button"
              className="w-full cursor-pointer flex justify-start whitespace-nowrap items-center gap-2 text-base hover:text-muted-foreground focus:outline-none"
              onClick={() => {
                setPagesGridVisible(false);
                setPagesListVisible(!pagesListVisible);
              }}
            >
              <Badge variant="secondary" className="text-sm font-mono">
                PAGE
              </Badge>
              <div className="font-light w-[calc(100%-52px-8px-8px-20px)] truncate">
                {actualPageElement.name}
              </div>
              <ToolbarButton
                icon={<SquarePen strokeWidth={1} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setRoomsRoomId(actualPageElement.roomId ?? "");
                  setRoomsPageId(actualPageElement.pageId ?? "");
                  setRoomsPageEditVisible(true);
                }}
                disabled={isRoomSwitching}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>Edit page</p>
                  </div>
                }
                size="small"
                variant="squared"
                tooltipSideOffset={14}
                tooltipSide="right"
                tooltipAlign="center"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
