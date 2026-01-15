// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { createPortal } from "react-dom";
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
import { UploadImage } from "../room-components/upload-image";
import { UploadImages } from "../room-components/upload-images";
import UserForm from "../room-components/user-form";
import { HelpDrawer } from "../room-components/help/help-drawer";
import { useTasksEvents } from "../room-components/hooks/use-tasks-events";
import { useCommentsHandler } from "../room-components/hooks/use-comments-handler";
import { UploadVideo } from "../room-components/upload-video";
import ChatBotPromptProvider from "../room-components/ai-components/chatbot.prompt.provider";

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

  const comBusConnected = useCollaborationRoom(
    (state) => state.commBus.connected
  );
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
  const setMeasurement = useCollaborationRoom((state) => state.setMeasurement);
  const setReferenceMeasurePixels = useCollaborationRoom(
    (state) => state.setReferenceMeasurePixels
  );

  const { loadedParams } = useHandleRouteParams();

  const getUser = React.useCallback(() => {
    return user as WeaveUser;
  }, [user]);

  const upscaleConfiguration = useCollaborationRoom(
    (state) => state.configuration.upscale
  );

  const performanceConfiguration = React.useMemo(() => {
    return {
      upscale: {
        enabled: upscaleConfiguration.enabled,
        baseWidth: upscaleConfiguration.baseWidth,
        baseHeight: upscaleConfiguration.baseHeight,
        multiplier: upscaleConfiguration.multiplier,
      },
    };
  }, [upscaleConfiguration]);

  React.useEffect(() => {
    if (room) {
      const actualSavedConfig = JSON.parse(
        sessionStorage.getItem(`weave_measurement_config_${room}`) || "{}"
      );

      setMeasurement(
        actualSavedConfig?.units ?? "cms",
        Number.parseFloat(actualSavedConfig?.referenceMeasureUnits ?? "10")
      );

      setReferenceMeasurePixels(
        actualSavedConfig?.referenceMeasurePixels ?? null
      );
    }
  }, [room, setMeasurement, setReferenceMeasurePixels]);

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
    if (!comBusConnected) {
      return "Connecting to the bus...";
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
  }, [loadedParams, loadingFetchConnectionUrl, status, comBusConnected]);

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
          !comBusConnected ||
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
      {loadedParams && room && user && storeProvider && comBusConnected && (
        <ChatBotPromptProvider>
          <WeaveProvider
            getContainer={() => {
              return document?.getElementById("weave") as HTMLDivElement;
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            store={storeProvider as any}
            fonts={FONTS}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            nodes={NODES() as any[]}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            plugins={PLUGINS(getUser) as any[]}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            actions={ACTIONS(getUser) as any[]}
            performance={performanceConfiguration}
            logModules={[]}
          >
            <UploadImage />
            <UploadImages />
            <UploadVideo />
            <RoomLayout inShadowDom={false} />
            <HelpDrawer />
          </WeaveProvider>
        </ChatBotPromptProvider>
      )}
      <Toasts />
    </>
  );
};

const Toasts = () => {
  const toasterContent = (
    <Toaster
      offset={16}
      mobileOffset={16}
      toastOptions={{
        classNames: {
          toast: "w-full font-inter font-light text-xs",
          content: "w-full",
          title: "w-full font-inter font-semibold text-sm",
          description: "w-full font-inter font-light text-xs !text-black",
        },
        style: {
          borderRadius: "0px",
          boxShadow: "none",
        },
      }}
    />
  );

  // Only render in the browser
  if (typeof window === "undefined") return null;

  return createPortal(toasterContent, document.body);
};
