// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";
import { WeaveUser, WEAVE_INSTANCE_STATUS } from "@inditextech/weave-types";
import { useCollaborationRoom } from "@/store/store";
import { useWeave, WeaveProvider } from "@inditextech/weave-react";
import { RoomLayout } from "./room.layout";
import { RoomLoader } from "../room-components/room-loader/room-loader";
import { AnimatePresence } from "framer-motion";
import useGetWeaveJSProps from "../room-components/hooks/use-get-weave-js-props";
import useGetWsProvider from "../room-components/hooks/use-get-ws-provider";
import useHandleRouteParams from "../room-components/hooks/use-handle-route-params";
import { UploadFile } from "../room-components/upload-file";
import UserForm from "../room-components/user-form";
import { HelpDrawer } from "../room-components/help/help-drawer";

const statusMap = {
  ["idle"]: "Idle",
  ["starting"]: "Starting Weave...",
  ["loadingFonts"]: "Fetching custom fonts...",
  ["running"]: "Running",
};

export const Room = () => {
  const router = useRouter();

  const instance = useWeave((state) => state.instance);
  const status = useWeave((state) => state.status);
  const roomLoaded = useWeave((state) => state.room.loaded);

  const room = useCollaborationRoom((state) => state.room);
  const user = useCollaborationRoom((state) => state.user);
  const loadingFetchConnectionUrl = useCollaborationRoom(
    (state) => state.fetchConnectionUrl.loading
  );
  const errorFetchConnectionUrl = useCollaborationRoom(
    (state) => state.fetchConnectionUrl.error
  );
  const setFetchConnectionUrlError = useCollaborationRoom(
    (state) => state.setFetchConnectionUrlError
  );
  const setUser = useCollaborationRoom((state) => state.setUser);

  const { loadedParams } = useHandleRouteParams();

  const getUser = React.useCallback(() => {
    return user as WeaveUser;
  }, [user]);

  React.useEffect(() => {
    if (room && !user) {
      const userStorage = localStorage.getItem(`weave.js_${room}`);
      try {
        const userMapped = JSON.parse(userStorage ?? "");
        if (userMapped) {
          setUser(userMapped);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, user]);

  const loadingDescription = React.useMemo(() => {
    if (!loadedParams) {
      return "Fetching room parameters...";
    }
    if (loadingFetchConnectionUrl) {
      return "Connecting to the room...";
    }
    if (status !== WEAVE_INSTANCE_STATUS.RUNNING) {
      return statusMap[status];
    }
    if (status === WEAVE_INSTANCE_STATUS.RUNNING && !roomLoaded) {
      return "Fetching room content...";
    }

    return "";
  }, [loadedParams, loadingFetchConnectionUrl, status, roomLoaded]);

  const { fonts, nodes, actions } = useGetWeaveJSProps();

  const wsStoreProvider = useGetWsProvider({
    loadedParams,
    getUser,
  });

  React.useEffect(() => {
    setFetchConnectionUrlError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (instance && status === WEAVE_INSTANCE_STATUS.RUNNING && roomLoaded) {
      instance.triggerAction("selectionTool");
    }
  }, [instance, status, roomLoaded]);

  if (!room && !user && loadedParams) {
    router.push("/error?errorCode=room-required-parameters");
    return null;
  }

  if (errorFetchConnectionUrl) {
    router.push("/error?errorCode=room-failed-connection");
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {(!loadedParams ||
          loadingFetchConnectionUrl ||
          status !== WEAVE_INSTANCE_STATUS.RUNNING ||
          (status === WEAVE_INSTANCE_STATUS.RUNNING && !roomLoaded)) && (
          <>
            <RoomLoader
              key="loader"
              roomId={room ? room : "-"}
              content={
                loadedParams && room && !user ? "ENTER ROOM" : "LOADING ROOM"
              }
              description={
                <>
                  {loadedParams && room && !user ? (
                    <div className="w-full mt-8">
                      <UserForm />
                    </div>
                  ) : (
                    loadingDescription
                  )}
                </>
              }
            />
          </>
        )}
      </AnimatePresence>
      {loadedParams && room && user && wsStoreProvider && (
        <WeaveProvider
          containerId="weave"
          getUser={getUser}
          store={wsStoreProvider}
          fonts={fonts}
          nodes={nodes}
          actions={actions}
        >
          <UploadFile />
          <RoomLayout />
          <HelpDrawer />
        </WeaveProvider>
      )}
      <Toaster />
    </>
  );
};
