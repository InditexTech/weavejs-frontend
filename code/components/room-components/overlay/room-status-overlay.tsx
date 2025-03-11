"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { Braces, Images, Presentation, LogOut } from "lucide-react";
import { ConnectedUsers } from "./../connected-users";
import { ConnectionStatus } from "./../connection-status";
import { useWeave } from "@inditextech/weavejs-react";
import { useCollaborationRoom } from "@/store/store";
import { ZoomHandlerOverlay } from "./zoom-handler-overlay";

export function RoomStatusOverlay() {
  const router = useRouter();

  const instance = useWeave((state) => state.instance);
  // const appState = useWeave((state) => state.appState);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);
  const connectedUsers = useWeave((state) => state.users);

  const isActionActive = useWeave((state) => state.actions.active);

  const workspacesLibraryVisible = useCollaborationRoom((state) => state.workspaces.library.visible);
  const setWorkspacesLibraryVisible = useCollaborationRoom((state) => state.setWorkspacesLibraryVisible);
  const imagesLibraryVisible = useCollaborationRoom((state) => state.images.library.visible);
  const setImagesLibraryVisible = useCollaborationRoom((state) => state.setImagesLibraryVisible);

  return (
    <div className="absolute top-2 right-2 flex flex-col gap-1 justify-center items-center">
      <div className="w-[320px] p-2 bg-white border border-zinc-200 shadow-xs flex flex-col justify-start items-center">
        <div className="w-full flex justify-between items-center gap-4">
          <ConnectedUsers connectedUsers={connectedUsers} />
          <ConnectionStatus weaveConnectionStatus={weaveConnectionStatus} />
        </div>
      </div>
      <div className="w-[320px] p-1 bg-white border border-zinc-200 shadow-xs flex flex-col justify-start items-center">
        <ZoomHandlerOverlay />
      </div>
      <div className="w-[320px] p-1 bg-white border border-zinc-200 shadow-xs flex flex-col justify-start items-center">
        <div className="w-full flex justify-between items-center">
          <div className="flex justify-start items-center gap-1">
            <ToolbarButton
              icon={<Images />}
              active={imagesLibraryVisible}
              onClick={() => {
                setWorkspacesLibraryVisible(false);
                setImagesLibraryVisible(!imagesLibraryVisible);
              }}
              label="Images"
              tooltipSide="top"
            />
            <ToolbarButton
              icon={<Presentation />}
              active={workspacesLibraryVisible}
              onClick={() => {
                setImagesLibraryVisible(false);
                setWorkspacesLibraryVisible(!workspacesLibraryVisible);
              }}
              label="Workspaces"
              tooltipSide="top"
            />
            <ToolbarButton
              icon={<Braces />}
              disabled={isActionActive}
              onClick={() => {
                if (instance) {
                  // eslint-disable-next-line no-console
                  console.log({ appState: JSON.parse(JSON.stringify(instance.getStore().getState())) });
                }
              }}
              label="Debug state"
              tooltipSide="top"
            />
          </div>
          <div className="w-full flex justify-end items-center">
            <ToolbarButton
              icon={<LogOut />}
              onClick={() => {
                router.push("/");
              }}
              label="Leave room"
              tooltipSide="top"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
