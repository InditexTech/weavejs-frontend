// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { useWeave } from "@inditextech/weave-react";
import { topElementVariants } from "./variants";
import { Button } from "@/components/ui/button";
import { WeaveStoreAzureWebPubsub } from "@inditextech/weave-store-azure-web-pubsub/client";
import { useCollaborationRoom } from "@/store/store";
import { X } from "lucide-react";

export function ConnectionTestsOverlay() {
  const intervalRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const instance = useWeave((state) => state.instance);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const [lastSyncTimestamp, setLastSyncTimestamp] = React.useState<
    string | null
  >(null);
  const [timeSinceLastSync, setTimeSinceLastSync] = React.useState<
    string | null
  >(null);

  const connectionTestsShow = useCollaborationRoom(
    (state) => state.connection.tests.show
  );
  const setConnectionTestsShow = useCollaborationRoom(
    (state) => state.setConnectionTestsShow
  );

  React.useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      if (lastSyncTimestamp === null) {
        setTimeSinceLastSync("-");
        return;
      }
      const date = new Date(lastSyncTimestamp);
      const timeSinceStr = formatDistanceToNow(date, {
        addSuffix: true,
        includeSeconds: true,
      });
      setTimeSinceLastSync(timeSinceStr);
    }, 1000);
  }, [lastSyncTimestamp]);

  React.useEffect(() => {
    if (!instance) {
      return;
    }

    const handleOnSyncResponse = (timestamp: number) => {
      const iso = new Date(timestamp).toISOString();
      setLastSyncTimestamp(iso);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };

    instance.addEventListener("onSyncResponse", handleOnSyncResponse);

    return () => {
      instance.removeEventListener("onSyncResponse", handleOnSyncResponse);
    };
  }, [instance]);

  const handleConnect = React.useCallback(async () => {
    if (!instance) {
      return;
    }

    await instance.getStore().connect();
  }, [instance]);

  const handleDisconnect = React.useCallback(async () => {
    if (!instance) {
      return;
    }

    await instance.getStore().disconnect();
  }, [instance]);

  const handleRemoteDisconnect = React.useCallback(() => {
    if (!instance) {
      return;
    }

    (instance.getStore() as WeaveStoreAzureWebPubsub).simulateWebsocketError();
  }, [instance]);

  if (!connectionTestsShow) {
    return null;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={topElementVariants}
      className="min-w-[280px] absolute right-[16px] bottom-[16px] flex flex-col gap-0 justify-center items-center bg-white border-[0.5px] border-[#c9c9c9]"
    >
      <div className="w-full flex  uppercase gap-1 justify-between items-center text-base p-3 w-full text-center text-black border-b-[0.5px] border-[#c9c9c9]">
        <div>Connection Testing</div>
        <button
          className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
          onClick={() => {
            setConnectionTestsShow(false);
          }}
        >
          <X size={16} strokeWidth={1} />
        </button>
      </div>
      <div className="w-full flex flex-col uppercase gap-1 justify-center items-center text-xs p-3 w-full text-center text-black border-b-[0.5px] border-[#c9c9c9]">
        <div>Connection Status</div>
        <div className="text-[#666666]">{weaveConnectionStatus}</div>
      </div>
      <div className="w-full p-3 font-inter text-xs pointer-events-auto grid grid-cols-2 gap-1">
        <Button
          variant="default"
          size="sm"
          className="rounded-none !cursor-pointer uppercase !text-xs"
          onClick={handleConnect}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.DISCONNECTED
          }
        >
          Connect
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="rounded-none !cursor-pointer uppercase !text-xs"
          onClick={handleDisconnect}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
        >
          Disconnect
        </Button>
        <Button
          variant="default"
          size="sm"
          className="rounded-none !cursor-pointer uppercase !text-xs col-span-2"
          onClick={handleRemoteDisconnect}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
        >
          Remote disconnection
        </Button>
      </div>
      {weaveConnectionStatus === WEAVE_STORE_CONNECTION_STATUS.CONNECTED && (
        <div className="w-full flex flex-col gap-1 justify-center uppercase items-center text-xs p-3 w-full text-center text-black border-t-[0.5px] border-[#c9c9c9]">
          <div>last sync (UTC)</div>
          <div className="text-[#666666]">
            {lastSyncTimestamp === null ? "-" : lastSyncTimestamp}
            <br />
            <span className="normal-case">{timeSinceLastSync}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
