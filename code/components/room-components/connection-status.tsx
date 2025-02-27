"use client";

import React from "react";
import { Cloud, CloudCog, CloudAlert } from "lucide-react";
import { WEAVE_WEBSOCKET_CONNECTION_STATUS } from "@weavejs/websockets-store";
import { cn } from "@/lib/utils";

type ConnectionStatusProps = {
  weaveConnectionStatus: string;
};

export const ConnectionStatus = ({ weaveConnectionStatus }: Readonly<ConnectionStatusProps>) => {
  return (
    <div className="flex gap-[1px] bg-light-border-3 rounded-full">
      <div
        className={cn("bg-light-background-1 px-2 py-2 flex justify-center items-center rounded-full", {
          ["bg-mint-200 text-light-content-1"]: weaveConnectionStatus === WEAVE_WEBSOCKET_CONNECTION_STATUS.CONNECTED,
          ["bg-water-200 text-light-content-1"]: weaveConnectionStatus === WEAVE_WEBSOCKET_CONNECTION_STATUS.CONNECTING,
          ["bg-cherry-200 text-light-content-1"]:
            weaveConnectionStatus === WEAVE_WEBSOCKET_CONNECTION_STATUS.DISCONNECTED,
        })}
      >
        {weaveConnectionStatus === WEAVE_WEBSOCKET_CONNECTION_STATUS.CONNECTED && <Cloud size={16} />}
        {weaveConnectionStatus === WEAVE_WEBSOCKET_CONNECTION_STATUS.CONNECTING && <CloudCog size={16} />}
        {weaveConnectionStatus === WEAVE_WEBSOCKET_CONNECTION_STATUS.DISCONNECTED && <CloudAlert size={16} />}
      </div>
    </div>
  );
};
