// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { createPortal } from "react-dom";
import { Toaster } from "@/components/ui/sonner";
import { useNavigate } from "@tanstack/react-router";
import { WeaveUser, WEAVE_INSTANCE_STATUS } from "@inditextech/weave-types";
import { useCollaborationRoom } from "@/store/store";
import { useWeave, WeaveProvider } from "@inditextech/weave-react";
import { RoomLayout } from "./room.layout";
import { RoomLoader } from "../room-components/room-loader/room-loader";
import useGetAzureWebPubSubProvider from "../room-components/hooks/use-get-azure-web-pubsub-provider";
// import useGetWebsocketsProvider from "../room-components/hooks/use-get-websockets-provider";
import useHandleRouteParams from "../room-components/hooks/use-handle-route-params";
import { UploadImage } from "../room-components/upload-image";
import { UploadImages } from "../room-components/upload-images";
import { HelpDrawer } from "../room-components/help/help-drawer";
import { useTasksEvents } from "../room-components/hooks/use-tasks-events";
import { useCommentsHandler } from "../room-components/hooks/use-comments-handler";
import { UploadVideo } from "../room-components/upload-video";
import { AnimatePresence } from "framer-motion";
import ChatBotPromptProvider from "../room-components/ai-components/chatbot.prompt.provider";
import useGetRendererKonvaBase from "../room-components/hooks/use-get-renderer-konva-base";
import { NODES } from "../utils/weave/nodes";
import { PLUGINS } from "../utils/weave/plugins";
import { ACTIONS } from "../utils/weave/actions";
import { FONTS } from "../utils/weave/fonts";
import { useBreakpoint } from "../room-components/overlay/hooks/use-breakpoint";
import { useManageRoomPages } from "../room-components/hooks/use-manage-room-pages";
import { useChangePage } from "../room-components/hooks/use-change-page";
import { useUpdatePageThumbnail } from "../room-components/hooks/use-update-page-thumbnail";
import { useLoadPage } from "../room-components/hooks/use-load-page";
import { useGetSession } from "../room-components/hooks/use-get-session";
import { EditRoomDialog } from "../room-components/overlay/edit-room";
import { DeleteRoomDialog } from "../room-components/overlay/delete-room";
import { EditRoomPageDialog } from "../room-components/overlay/edit-room-page";
import { DeleteRoomPageDialog } from "../room-components/overlay/delete-room-page";
import { Logo } from "../utils/logo";
import { useLoadRoom } from "../room-components/hooks/use-load-room";
import { SignOverlay } from "../sign-overlay/sign-overlay";
import { useQueryClient } from "@tanstack/react-query";

export const Room = () => {
  return (
    <AnimatePresence>
      <RoomInternal key="internal" />
      <Toasts key="toasts" />
    </AnimatePresence>
  );
};

const RoomInternal = () => {
  const navigate = useNavigate();

  const [initialized, setInitialized] = React.useState(false);

  const instance = useWeave((state) => state.instance);
  const clientId = useCollaborationRoom((state) => state.clientId);
  const status = useWeave((state) => state.status);
  const roomLoaded = useWeave((state) => state.room.loaded);

  const comBusConnected = useCollaborationRoom(
    (state) => state.commBus.connected,
  );
  const room = useCollaborationRoom((state) => state.room);
  const roomInfo = useCollaborationRoom((state) => state.roomInfo.data);
  const loadingFetchConnectionUrl = useCollaborationRoom(
    (state) => state.fetchConnectionUrl.loading,
  );
  const errorFetchConnectionUrl = useCollaborationRoom(
    (state) => state.fetchConnectionUrl.error,
  );
  const setFetchConnectionUrlError = useCollaborationRoom(
    (state) => state.setFetchConnectionUrlError,
  );
  const setMeasurement = useCollaborationRoom((state) => state.setMeasurement);
  const setReferenceMeasurePixels = useCollaborationRoom(
    (state) => state.setReferenceMeasurePixels,
  );
  const setViewType = useCollaborationRoom((state) => state.setViewType);
  const setPagesListVisible = useCollaborationRoom(
    (state) => state.setPagesListVisible,
  );
  const setPagesGridVisible = useCollaborationRoom(
    (state) => state.setPagesGridVisible,
  );
  const setPresentationVisible = useCollaborationRoom(
    (state) => state.setPresentationVisible,
  );
  const setShowRightSidebarFloating = useCollaborationRoom(
    (state) => state.setShowRightSidebarFloating,
  );

  const { loadedParams } = useHandleRouteParams();

  const pagesManaged = useManageRoomPages(room ?? "");

  const { session, isPending } = useGetSession();

  React.useEffect(() => {
    if (roomInfo) {
      document.title = `${roomInfo.room.name} | Showcase | Weave.js`;
    } else {
      document.title = `Room | Showcase | Weave.js`;
    }
  }, [roomInfo]);

  React.useEffect(() => {
    setPagesListVisible(false);
    setPagesGridVisible(false);
    setPresentationVisible(false);
    setShowRightSidebarFloating(false);
  }, [
    setPagesListVisible,
    setPagesGridVisible,
    setPresentationVisible,
    setShowRightSidebarFloating,
  ]);

  const getUser = React.useCallback(() => {
    return {
      id: `${session?.user.id}-${clientId}`,
      userId: session?.user.id,
      clientId: clientId,
      name: session?.user.name,
      email: session?.user.email,
      image: session?.user.image,
    } as WeaveUser;
  }, [session, clientId]);

  const upscaleConfiguration = useCollaborationRoom(
    (state) => state.configuration.upscale,
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

  const breakpoint = useBreakpoint();

  const queryClient = useQueryClient();

  React.useEffect(() => {
    const queryKey = ["roomData"];
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient]);

  React.useEffect(() => {
    if (["2xl"].includes(breakpoint)) {
      setViewType("floating");
    } else {
      setViewType("floating");
    }
  }, [breakpoint, setViewType]);

  React.useEffect(() => {
    if (room) {
      const actualSavedConfig = JSON.parse(
        sessionStorage.getItem(`weave_measurement_config_${room}`) || "{}",
      );

      setMeasurement(
        actualSavedConfig?.units ?? "cms",
        Number.parseFloat(actualSavedConfig?.referenceMeasureUnits ?? "10"),
      );

      setReferenceMeasurePixels(
        actualSavedConfig?.referenceMeasurePixels ?? null,
      );
    }
  }, [room, setMeasurement, setReferenceMeasurePixels]);

  const rendererProvider = useGetRendererKonvaBase();
  // const rendererProvider = useGetRendererKonvaReactReconciler();

  const storeProvider = useGetAzureWebPubSubProvider({
    loadedParams,
    pagesManaged,
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
      navigate({
        to: "/error",
        search: { errorCode: "room-failed-connection" },
      });
    }

    if (!room && !session && loadedParams) {
      navigate({
        to: "/error",
        search: { errorCode: "room-required-parameters" },
      });
    }

    if (errorFetchConnectionUrl) {
      navigate({ to: "/error", search: { errorCode: "room-connection-url" } });
    }
  }, [navigate, room, session, status, loadedParams, errorFetchConnectionUrl]);

  React.useEffect(() => {
    if (
      !(
        !loadedParams ||
        loadingFetchConnectionUrl ||
        !comBusConnected ||
        status !== WEAVE_INSTANCE_STATUS.RUNNING ||
        (status === WEAVE_INSTANCE_STATUS.RUNNING && !roomLoaded)
      )
    ) {
      const ele = document.getElementById("room-loader-animation");
      if (ele) {
        ele.style.transition = "opacity 0.5s ease";
        ele.style.opacity = "0";
        ele.style.pointerEvents = "none";
      }
    }
  }, [
    loadedParams,
    loadingFetchConnectionUrl,
    comBusConnected,
    status,
    roomLoaded,
  ]);

  React.useEffect(() => {
    if (
      !initialized &&
      pagesManaged &&
      status === WEAVE_INSTANCE_STATUS.RUNNING
    ) {
      setInitialized(true);
    }
  }, [status, initialized, pagesManaged, setInitialized]);

  useLoadRoom();
  useTasksEvents();
  useCommentsHandler();
  useLoadPage();
  useUpdatePageThumbnail();
  useChangePage();

  const isBrowser =
    typeof window !== "undefined" && typeof window.document !== "undefined";

  if (!isBrowser) {
    throw new Error("Weave.js can only be used in a browser environment");
  }

  if (status === WEAVE_INSTANCE_STATUS.CONNECTING_ERROR) {
    return null;
  }

  if (!room && !session && loadedParams) {
    return null;
  }

  if (errorFetchConnectionUrl) {
    return null;
  }

  if (isPending) {
    return (
      <main className="absolute top-0 left-0 right-0 bottom-0 w-full h-full block flex justify-center items-center">
        <div className="flex flex-col gap-3 justify-center items-center">
          <Logo kind="landscape" variant="no-text" />
          <div className="text-lg text-[#757575]">loading</div>
        </div>
      </main>
    );
  }

  return (
    <>
      {roomInfo &&
        loadedParams &&
        room &&
        session &&
        storeProvider &&
        rendererProvider &&
        pagesManaged &&
        comBusConnected && (
          <ChatBotPromptProvider>
            <WeaveProvider
              getContainer={() => {
                return document?.getElementById("weave") as HTMLDivElement;
              }}
              renderer={rendererProvider}
              store={storeProvider}
              fonts={FONTS}
              nodes={NODES()}
              plugins={PLUGINS(getUser)}
              actions={ACTIONS(getUser)}
              performance={performanceConfiguration}
              logModules={[]}
            >
              <UploadImage />
              <UploadImages />
              <UploadVideo />
              <RoomLayout inShadowDom={false} />
              <HelpDrawer />
              <EditRoomDialog />
              <DeleteRoomDialog />
              <EditRoomPageDialog />
              <DeleteRoomPageDialog />
            </WeaveProvider>
          </ChatBotPromptProvider>
        )}
      {!initialized && (
        <main className="absolute top-0 left-0 right-0 bottom-0 w-full h-full block flex justify-center items-center">
          <RoomLoader />
        </main>
      )}
      <SignOverlay />
    </>
  );
};

const Toasts = () => {
  const viewType = useCollaborationRoom((state) => state.viewType);

  const toasterContent = (
    <>
      <Toaster
        expand
        visibleToasts={3}
        offset={{ bottom: 48, right: 8 }}
        // mobileOffset={viewType === "floating" ? 56 : 8}
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "w-full !font-light text-xs drop-shadow",
            content: "w-full",
            title: "w-full !font-light text-sm",
            description: "w-full !font-light text-xs !text-black",
          },
          style: {
            borderRadius: "0px",
            boxShadow: "none",
          },
        }}
      />
      <Toaster
        id="info"
        offset={viewType === "floating" ? 63 : 8}
        mobileOffset={viewType === "floating" ? 63 : 8}
        position="top-center"
        toastOptions={{
          classNames: {
            toast: "w-full !font-light text-xs drop-shadow",
            content: "w-full",
            title: "w-full !font-light text-sm",
            description: "w-full !font-light text-xs !text-black",
          },
          style: {
            borderRadius: "0px",
            boxShadow: "none",
          },
        }}
      />
    </>
  );

  // Only render in the browser
  if (typeof window === "undefined") return null;

  return createPortal(toasterContent, document.body);
};
