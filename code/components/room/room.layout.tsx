"use client";

import { Hourglass } from "lucide-react";
import React from "react";
import { ContextMenu } from "@/components/room-components/context-menu";
import { useCollaborationRoom } from "@/store/store";
import { RoomInformationOverlay } from "@/components/room-components/overlay/room-information-overlay";
import { RoomStatusOverlay } from "@/components/room-components/overlay/room-status-overlay";
import { ToolsOverlay } from "@/components/room-components/overlay/tools-overlay";
import { MultiuseOverlay } from "@/components/room-components/overlay/multiuse-overlay";
import { OperationsOverlay } from "@/components/room-components/overlay/operations-overlay";
import { useWeave } from "@weavejs/react";
import { RoomLoader } from "../room-components/room-loader";
import { WEAVE_INSTANCE_STATUS } from "@inditextech/weavejs-sdk";
import { RoomError } from "../room-components/room-error";

const statusMap = {
  ["idle"]: "Idle",
  ["starting"]: "Starting Weave...",
  ["loadingFonts"]: "Loading custom fonts...",
  ["running"]: "Running",
}

export const RoomLayout = () => {
  const status = useWeave((state) => state.status);
  const roomLoaded = useWeave((state) => state.room.loaded);

  const roomId = useCollaborationRoom((state) => state.room);
  const errorFetchConnectionUrl = useCollaborationRoom((state) => state.fetchConnectionUrl.error);
  const loadingFetchConnectionUrl = useCollaborationRoom((state) => state.fetchConnectionUrl.loading);
  const contextMenuShow = useCollaborationRoom((state) => state.contextMenu.show);
  const contextMenuPosition = useCollaborationRoom((state) => state.contextMenu.position);
  const contextMenuOptions = useCollaborationRoom((state) => state.contextMenu.options);
  const setContextMenuShow = useCollaborationRoom((state) => state.setContextMenuShow);
  const uploadingImage = useCollaborationRoom((state) => state.images.uploading);
  const loadingImage = useCollaborationRoom((state) => state.images.loading);

  if (loadingFetchConnectionUrl) {
    return (
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-light-background-1 flex justify-center items-center">
        <RoomLoader roomId={roomId ?? "undefined"} content="Loading fetch URL" />
      </div>
    );
  }

  if (errorFetchConnectionUrl) {
    return (
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-light-background-1 flex justify-center items-center">
        <RoomError content={`Failed to fetch client connection URL for room ${roomId}`} />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative flex">
      <div id="weave" className="w-full h-full"></div>
      {status !== WEAVE_INSTANCE_STATUS.RUNNING && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-light-background-1 flex justify-center items-center">
          <RoomLoader roomId={roomId ?? "undefined"} content={statusMap[status]} />
        </div>
      )}
      {status === WEAVE_INSTANCE_STATUS.RUNNING && !roomLoaded && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-light-background-1 flex justify-center items-center">
          <RoomLoader roomId={roomId ?? "undefined"} content="Loading room content..." />
        </div>
      )}
      {status === WEAVE_INSTANCE_STATUS.RUNNING && roomLoaded && (
        <>
          <RoomInformationOverlay />
          <RoomStatusOverlay />
          <ToolsOverlay />
          <OperationsOverlay />
          <MultiuseOverlay />
          <ContextMenu
            show={contextMenuShow}
            onChanged={(show: boolean) => {
              setContextMenuShow(show);
            }}
            position={contextMenuPosition}
            options={contextMenuOptions}
          />
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
