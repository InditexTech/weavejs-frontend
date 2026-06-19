// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useCollaborationRoom } from "@/store/store";
import { useWeave } from "@inditextech/weave-react";
import {
  WEAVE_INSTANCE_STATUS,
  WEAVE_STORE_CONNECTION_STATUS,
} from "@inditextech/weave-types";
import { cn } from "@/lib/utils";
import { ConnectionTestsOverlay } from "../room-components/overlay/connection-tests-overlay";

export const WEAVE_INSTANCE_STATUS_MAP = {
  ["idle"]: "Idle",
  ["starting"]: "Starting page",
  ["loadingFonts"]: "Preloading fonts",
  ["connectingToRoom"]: "Connecting to page",
  ["connectingError"]: "Page connection error",
  ["loadingRoom"]: "Loading page",
  ["running"]: "Ready",
} as const;

export const RoomCanvas = React.memo(() => {
  const isRoomSwitching = useWeave((state) => state.room.switching);
  const status = useWeave((state) => state.status);
  const roomLoaded = useWeave((state) => state.room.loaded);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const afterLoadFit = useCollaborationRoom((state) => state.afterLoadFit);
  const actualPageElement = useCollaborationRoom(
    (state) => state.pages.actualPageElement,
  );
  const viewType = useCollaborationRoom((state) => state.viewType);
  const showMinimap = useCollaborationRoom((state) => state.ui.minimap);
  const backgroundColor = useCollaborationRoom(
    (state) => state.backgroundColor,
  );
  const roomPageFetching = useCollaborationRoom(
    (state) => state.pages.fetching,
  );
  const roomPageAdding = useCollaborationRoom((state) => state.pages.adding);
  const roomPageRemoving = useCollaborationRoom(
    (state) => state.pages.removing,
  );

  const roomFullyLoaded = React.useMemo(() => {
    return status === WEAVE_INSTANCE_STATUS.RUNNING && roomLoaded;
  }, [status, roomLoaded]);

  const showOverlay = React.useMemo(() => {
    return (
      weaveConnectionStatus === WEAVE_STORE_CONNECTION_STATUS.ERROR ||
      weaveConnectionStatus === WEAVE_STORE_CONNECTION_STATUS.CONNECTING ||
      weaveConnectionStatus === WEAVE_STORE_CONNECTION_STATUS.DISCONNECTED ||
      (isRoomSwitching &&
        weaveConnectionStatus === WEAVE_STORE_CONNECTION_STATUS.DISCONNECTED)
    );
  }, [weaveConnectionStatus, isRoomSwitching]);

  return (
    <section
      className={cn(
        "fixed top-0 bottom-0 h-[calc(100%-40px)] flex z-0 overflow-hidden relative",
        {
          ["left-[500px] right-[500px] w-[calc(100%-500px-500px)] max-w-[calc(100%-500px-500px)]"]:
            !viewType || viewType === "fixed",
          ["!left-[0px] !top-[54px] right-0 w-[calc(100%)] h-[calc(100%-54px-40px)]"]:
            viewType === "floating",
        },
      )}
    >
      <div
        id="weave"
        tabIndex={0}
        style={{
          background: backgroundColor,
        }}
        className={cn("w-full h-full relative overflow-hidden", {
          ["pointer-events-none"]:
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED ||
            !roomFullyLoaded ||
            status !== WEAVE_INSTANCE_STATUS.RUNNING,
          ["pointer-events-auto"]: roomFullyLoaded,
          ["invisible"]:
            status !== WEAVE_INSTANCE_STATUS.RUNNING || !afterLoadFit,
          ["visible"]: status === WEAVE_INSTANCE_STATUS.RUNNING && afterLoadFit,
        })}
      ></div>
      <div className="absolute top-0 left-0 right-0 bottom-0 shadow-[inset_0_2px_6px_rgba(0,0,0,0.10)] pointer-events-none"></div>
      {(isRoomSwitching ||
        !afterLoadFit ||
        roomPageFetching ||
        roomPageAdding ||
        roomPageRemoving) && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-black/50 z-11 pointer-events-auto">
          <div className="w-[380px] max-w-[380px] flex flex-col p-8 bg-white justify-center items-center gap-8">
            <div className="w-full flex flex-col gap-[2px] justify-center items-center">
              <div className="text-center text-base text-[#757575]">
                <p>PAGE</p>
              </div>
              <div className="w-full text-center font-light text-base">
                {actualPageElement?.name ?? ""}
              </div>
            </div>
            <div className="w-full flex flex-col gap-1 justify-center items-center">
              <div className="w-full flex justify-center items-center">
                <div className="font-light text-xs text-center whitespace-nowrap">
                  {isRoomSwitching && <span>Changing page</span>}
                  {!isRoomSwitching && !afterLoadFit && (
                    <span>Initializing</span>
                  )}
                  {!isRoomSwitching && roomPageFetching && (
                    <span>Fetching page data</span>
                  )}
                  {!isRoomSwitching && roomPageAdding && (
                    <span>Creating page</span>
                  )}
                  {!isRoomSwitching && roomPageRemoving && (
                    <span>Archiving page</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showOverlay && (
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
          <div className="w-full h-full bg-black/50 flex justify-center items-center" />
        </div>
      )}
      {roomFullyLoaded && (
        <>
          <ConnectionTestsOverlay />
          <div
            id="minimap"
            className={cn(
              "absolute bottom-[16px] right-[16px] border border-[#c9c9c9] w-[460px] w-auto bg-white z-[11]",
              {
                ["visible"]: showMinimap,
                ["invisible"]: !showMinimap,
              },
            )}
          ></div>
        </>
      )}
    </section>
  );
});
