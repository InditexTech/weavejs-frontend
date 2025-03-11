"use client";

import React from "react";
import { ConnectedUsers } from "./../connected-users";
import { useWeave } from "@inditextech/weavejs-react";

export function RoomStatusOverlay() {
  const connectedUsers = useWeave((state) => state.users);

  return (
    <div className="absolute top-2 right-2 flex flex-col gap-1 justify-center items-center">
      <div className="w-[320px] min-h-[50px] p-2 bg-white border border-zinc-200 shadow-xs flex flex-col justify-start items-center">
        <div className="w-full min-h-[40px] h-full flex flex-col justify-between items-center gap-2">
          <ConnectedUsers connectedUsers={connectedUsers} />
          <div className="w-full flex justify-center gap-2 items-center text-center font-noto-sans-mono text-xs border-t border-zinc-200 pt-1">
            <div className="px-2 mt-1 py-1 bg-accent">
              {Object.keys(connectedUsers).length}
            </div>
            <div>user(s) connected</div>
          </div>
        </div>
      </div>
    </div>
  );
}
