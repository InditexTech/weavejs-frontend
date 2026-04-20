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
import { Progress } from "../ui/progress";

export const WEAVE_INSTANCE_STATUS_MAP = {
  ["idle"]: "Idle",
  ["starting"]: "Starting page",
  ["loadingFonts"]: "Preloading fonts",
  ["connectingToRoom"]: "Connecting to page",
  ["connectingError"]: "Page connection error",
  ["loadingRoom"]: "Loading page",
  ["running"]: "Ready",
} as const;

export const RoomCanvas = () => {
  const isRoomSwitching = useWeave((state) => state.room.switching);
  const status = useWeave((state) => state.status);
  const roomLoaded = useWeave((state) => state.room.loaded);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const actualPageElement = useCollaborationRoom(
    (state) => state.pages.actualPageElement,
  );
  const asyncElementsLoaded = useWeave((state) => state.asyncElements.loaded);
  const asyncElementsTotal = useWeave((state) => state.asyncElements.total);
  const asyncElementsState = useWeave((state) => state.asyncElements.state);
  const viewType = useCollaborationRoom((state) => state.viewType);
  const showMinimap = useCollaborationRoom((state) => state.ui.minimap);
  const backgroundColor = useCollaborationRoom(
    (state) => state.backgroundColor,
  );

  const roomFullyLoaded = React.useMemo(() => {
    return status === WEAVE_INSTANCE_STATUS.RUNNING && roomLoaded;
  }, [status, roomLoaded]);

  return (
    <section
      className={cn(
        "fixed top-0 bottom-0 h-[calc(100%-40px)] flex z-0 overflow-hidden relative",
        {
          ["left-[400px] right-[400px] w-[calc(100%-400px-400px)] max-w-[calc(100%-400px-400px)]"]:
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
            status !== WEAVE_INSTANCE_STATUS.RUNNING ||
            asyncElementsState !== "loaded",
          ["pointer-events-auto"]:
            roomFullyLoaded && asyncElementsState === "loaded",
          ["invisible"]: status !== WEAVE_INSTANCE_STATUS.RUNNING,
          ["visible"]: status === WEAVE_INSTANCE_STATUS.RUNNING,
        })}
      ></div>
      <div className="absolute top-0 left-0 right-0 bottom-0 shadow-[inset_0_2px_6px_rgba(0,0,0,0.10)] pointer-events-none"></div>
      {(isRoomSwitching ||
        (!isRoomSwitching && asyncElementsState !== "loaded") ||
        (!isRoomSwitching && status !== WEAVE_INSTANCE_STATUS.RUNNING)) && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-black/50 z-11 !pointer-events-none">
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
              {!isRoomSwitching && asyncElementsState !== "loaded" && (
                <div className="w-full flex justify-between items-center">
                  <div className="font-light text-xs text-center whitespace-nowrap">
                    {`${asyncElementsLoaded} / ${asyncElementsTotal}`} assets
                  </div>
                  <div className="font-light text-xs text-center whitespace-nowrap">
                    {Math.round(
                      (asyncElementsLoaded / asyncElementsTotal) * 100,
                    )}
                    %
                  </div>
                </div>
              )}
              <Progress
                className="w-[300px]"
                value={
                  !(!isRoomSwitching && asyncElementsState !== "loaded")
                    ? 0
                    : (asyncElementsLoaded / asyncElementsTotal) * 100
                }
              />
              <div className="w-full flex justify-center items-center">
                <div className="font-light text-xs text-center whitespace-nowrap">
                  {isRoomSwitching && <span>Changing page</span>}
                  {!isRoomSwitching &&
                    status !== WEAVE_INSTANCE_STATUS.RUNNING && (
                      <span>{WEAVE_INSTANCE_STATUS_MAP[status]}</span>
                    )}
                  {!isRoomSwitching && asyncElementsState !== "loaded" && (
                    <span>Preloading assets</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {weaveConnectionStatus === WEAVE_STORE_CONNECTION_STATUS.ERROR && (
        <div className="absolute top-0 left-0 right-0 bottom-0">
          <div className="w-full h-full bg-black/5 flex justify-center items-center pointer-events-none" />
        </div>
      )}
      {weaveConnectionStatus === WEAVE_STORE_CONNECTION_STATUS.CONNECTING && (
        <div className="absolute top-0 left-0 right-0 bottom-0">
          <div className="w-full h-full bg-black/5 flex justify-center items-center pointer-events-none" />
        </div>
      )}
      {!isRoomSwitching &&
        weaveConnectionStatus ===
          WEAVE_STORE_CONNECTION_STATUS.DISCONNECTED && (
          <div className="absolute top-0 left-0 right-0 bottom-0">
            <div className="w-full h-full bg-black/5 flex justify-center items-center pointer-events-none" />
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
};
