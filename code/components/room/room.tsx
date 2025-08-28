// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";
import { WeaveUser, WEAVE_INSTANCE_STATUS } from "@inditextech/weave-types";
import { useCollaborationRoom } from "@/store/store";
import { ACTIONS, FONTS, NODES, PLUGINS } from "@/components/utils/constants";
import { useWeave, WeaveProvider } from "@inditextech/weave-react";
import { RoomLayout } from "./room.layout";
import { RoomLoader } from "../room-components/room-loader/room-loader";
import { AnimatePresence } from "framer-motion";
import useGetAzureWebPubSubProvider from "../room-components/hooks/use-get-azure-web-pubsub-provider";
// import useGetWebsocketsProvider from "../room-components/hooks/use-get-websockets-provider";
import useHandleRouteParams from "../room-components/hooks/use-handle-route-params";
import { UploadFile } from "../room-components/upload-file";
import { UploadFiles } from "../room-components/upload-files";
import UserForm from "../room-components/user-form";
import { HelpDrawer } from "../room-components/help/help-drawer";
import { useTasksEvents } from "../room-components/hooks/use-tasks-events";
import { useCommentsHandler } from "../room-components/hooks/use-comments-handler";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const statusMap: any = {
  [WEAVE_INSTANCE_STATUS.IDLE]: "Idle",
  [WEAVE_INSTANCE_STATUS.STARTING]: "Starting Weave...",
  [WEAVE_INSTANCE_STATUS.LOADING_FONTS]: "Fetching fonts...",
  [WEAVE_INSTANCE_STATUS.CONNECTING_TO_ROOM]: "Connecting to room...",
  [WEAVE_INSTANCE_STATUS.LOADING_ROOM]: "Loading room...",
  [WEAVE_INSTANCE_STATUS.RUNNING]: "Running",
};

export const Room = () => {
  const router = useRouter();

  const instance = useWeave((state) => state.instance);
  const status = useWeave((state) => state.status);
  const roomLoaded = useWeave((state) => state.room.loaded);

  const sseConnected = useCollaborationRoom((state) => state.sse.connected);
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
      const userStorage = sessionStorage.getItem(`weave.js_${room}`);
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
    if (!sseConnected) {
      return "Connecting to the server...";
    }
    if (!loadedParams) {
      return "Fetching room parameters...";
    }
    if (loadingFetchConnectionUrl) {
      return "Connecting to the room...";
    }
    if (status !== WEAVE_INSTANCE_STATUS.RUNNING) {
      return statusMap[status];
    }

    return "";
  }, [loadedParams, loadingFetchConnectionUrl, status, sseConnected]);

  const storeProvider = useGetAzureWebPubSubProvider({
    loadedParams,
    getUser,
  });

  // const storeProvider = useGetWebsocketsProvider({
  //   loadedParams,
  //   getUser,
  // });

  React.useEffect(() => {
    setFetchConnectionUrlError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (instance && status === WEAVE_INSTANCE_STATUS.RUNNING && roomLoaded) {
      instance.triggerAction("selectionTool");
    }
  }, [instance, status, roomLoaded]);

  React.useEffect(() => {
    if (status === WEAVE_INSTANCE_STATUS.CONNECTING_ERROR) {
      router.push("/error?errorCode=room-failed-connection");
    }

    if (!room && !user && loadedParams) {
      router.push("/error?errorCode=room-required-parameters");
    }

    if (errorFetchConnectionUrl) {
      router.push("/error?errorCode=room-failed-connection");
    }
  }, [router, room, user, status, loadedParams, errorFetchConnectionUrl]);

  useTasksEvents();
  useCommentsHandler();

  const isBrowser =
    typeof window !== "undefined" && typeof window.document !== "undefined";

  if (!isBrowser) {
    throw new Error("Weave.js can only be used in a browser environment");
  }

  if (status === WEAVE_INSTANCE_STATUS.CONNECTING_ERROR) {
    return null;
  }

  if (!room && !user && loadedParams) {
    return null;
  }

  if (errorFetchConnectionUrl) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {(!loadedParams ||
          loadingFetchConnectionUrl ||
          !sseConnected ||
          status !== WEAVE_INSTANCE_STATUS.RUNNING ||
          (status === WEAVE_INSTANCE_STATUS.RUNNING && !roomLoaded)) && (
          <>
            <RoomLoader
              key="loader"
              roomId={room ? room : "-"}
              content={
                loadedParams && room && !user ? (
                  <div className="text-center">
                    <p>ENTER YOUR USERNAME</p>
                    <p>TO ACCESS THE ROOM</p>
                  </div>
                ) : (
                  "LOADING ROOM"
                )
              }
              description={
                <>
                  {loadedParams && room && !user ? (
                    <div className="w-full">
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
      {loadedParams && room && user && storeProvider && sseConnected && (
        <WeaveProvider
          getContainer={() => {
            return document?.getElementById("weave") as HTMLDivElement;
          }}
          store={storeProvider}
          fonts={FONTS}
          nodes={NODES()}
          plugins={PLUGINS(getUser)}
          actions={ACTIONS(getUser)}
        >
          <UploadFile />
          <UploadFiles />
          <RoomLayout inShadowDom={false} />
          <HelpDrawer />
        </WeaveProvider>
      )}
      <Toaster
        offset={16}
        mobileOffset={16}
        toastOptions={{
          classNames: {
            toast: "font-inter font-light text-xs",
            title: "font-inter font-semibold text-sm",
            description: "font-inter font-light text-xs !text-black",
          },
          style: {
            borderRadius: "0px",
            boxShadow: "none",
          },
        }}
      />
    </>
  );
};
