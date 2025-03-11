"use client";

import { Hourglass } from "lucide-react";
import React from "react";
import { ContextMenuRender } from "@/components/room-components/context-menu";
import { useCollaborationRoom } from "@/store/store";
import { RoomInformationOverlay } from "@/components/room-components/overlay/room-information-overlay";
import { RoomStatusOverlay } from "@/components/room-components/overlay/room-status-overlay";
import { ToolsOverlay } from "@/components/room-components/overlay/tools-overlay";
import { MultiuseOverlay } from "@/components/room-components/overlay/multiuse-overlay";
import { useWeave } from "@inditextech/weavejs-react";
import { WEAVE_INSTANCE_STATUS } from "@inditextech/weavejs-sdk";
import { ZoomHandlerOverlay } from "../room-components/overlay/zoom-handler-overlay";

export const RoomLayout = () => {
  const status = useWeave((state) => state.status);
  const roomLoaded = useWeave((state) => state.room.loaded);

  const contextMenuShow = useCollaborationRoom(
    (state) => state.contextMenu.show
  );
  const contextMenuPosition = useCollaborationRoom(
    (state) => state.contextMenu.position
  );
  const contextMenuOptions = useCollaborationRoom(
    (state) => state.contextMenu.options
  );
  const setContextMenuShow = useCollaborationRoom(
    (state) => state.setContextMenuShow
  );
  const uploadingImage = useCollaborationRoom(
    (state) => state.images.uploading
  );
  const loadingImage = useCollaborationRoom((state) => state.images.loading);

  return (
    <div className="w-full h-full relative flex">
      <div id="weave" className="w-full h-full"></div>
      {status === WEAVE_INSTANCE_STATUS.RUNNING && roomLoaded && (
        <>
          <ContextMenuRender
            show={contextMenuShow}
            onChanged={(show: boolean) => {
              setContextMenuShow(show);
            }}
            position={contextMenuPosition}
            options={contextMenuOptions}
          />
          <RoomInformationOverlay />
          <RoomStatusOverlay />
          <ToolsOverlay />
          <ZoomHandlerOverlay />
          <MultiuseOverlay />
          {uploadingImage && (
            <div className="w-full h-full bg-light-background-inverse/25 flex justify-center items-center absolute top-0 left-0">
              <div className="flex flex-col gap-2 bg-light-background-1 p-8 justify-center items-center">
                <Hourglass size={64} />
                <div className="font-label-l-regular">Uploading image</div>
              </div>
            </div>
          )}
          {loadingImage && (
            <div className="w-full h-full bg-light-background-inverse/25 flex justify-center items-center absolute top-0 left-0">
              <div className="flex flex-col gap-2 bg-light-background-1 p-8 justify-center items-center">
                <Hourglass size={64} />
                <div className="font-label-l-regular">Loading image</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
