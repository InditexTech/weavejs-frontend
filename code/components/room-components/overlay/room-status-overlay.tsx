"use client";

import React from "react";
import { ConnectedUsers } from "./../connected-users";
import { ConnectionStatus } from "./../connection-status";
import { useWeave } from "@inditextech/weavejs-react";

export function RoomStatusOverlay() {
  const weaveConnectionStatus = useWeave((state) => state.connection.status);
  const connectedUsers = useWeave((state) => state.users);

  return (
    <div className="absolute top-2 right-2 flex flex-col gap-1 justify-center items-center">
      <div className="w-[320px] p-2 bg-white border border-zinc-200 shadow-xs flex flex-col justify-start items-center">
        <div className="w-full flex justify-between items-center gap-4">
          <ConnectedUsers connectedUsers={connectedUsers} />
          <ConnectionStatus weaveConnectionStatus={weaveConnectionStatus} />
        </div>
      </div>
    </div>
  );
}
