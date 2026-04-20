// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { WeaveUser, WEAVE_INSTANCE_STATUS } from "@inditextech/weave-types";
import { useCollaborationRoom } from "@/store/store";
import { useWeave, WeaveProvider } from "@inditextech/weave-react";
import { RoomLayout } from "./room.layout";
import { RoomLoader } from "../room-components/room-loader/room-loader";
import useGetAzureWebPubSubProvider from "../room-components/hooks/use-get-azure-web-pubsub-provider";
// import useGetWebsocketsProvider from "../room-components/hooks/use-get-websockets-provider";
import { UploadImage } from "../room-components/upload-image";
import { UploadImages } from "../room-components/upload-images";
import { HelpDrawer } from "../room-components/help/help-drawer";
import { UploadVideo } from "../room-components/upload-video";
import { FONTS } from "../utils/weave/fonts";
import { NODES } from "../utils/weave/nodes";
import { PLUGINS } from "../utils/weave/plugins";
import { ACTIONS } from "../utils/weave/actions";
import useGetRendererKonvaBase from "../room-components/hooks/use-get-renderer-konva-base";
import { AppProviders } from "@/src/providers";
import { useGetSession } from "../room-components/hooks/use-get-session";
import { useManageRoomPages } from "../room-components/hooks/use-manage-room-pages";
import useHandleRouteParams from "../room-components/hooks/use-handle-route-params";
import { Logo } from "../utils/logo";
import { useLoadRoom } from "../room-components/hooks/use-load-room";
import { useTasksEvents } from "../room-components/hooks/use-tasks-events";
import { useCommentsHandler } from "../room-components/hooks/use-comments-handler";
import { useLoadPage } from "../room-components/hooks/use-load-page";
import { useUpdatePageThumbnail } from "../room-components/hooks/use-update-page-thumbnail";
import { useChangePage } from "../room-components/hooks/use-change-page";
// import useGetRendererKonvaReactReconciler from "../room-components/hooks/use-get-renderer-konva-react-reconciler";

type RoomWrapperProps = {
  children: React.ReactNode;
};

export function RoomWrapper({ children }: Readonly<RoomWrapperProps>) {
  return <AppProviders>{children}</AppProviders>;
}

export const RoomShadowDom = () => {
  return (
    <RoomWrapper>
      <Room />
    </RoomWrapper>
  );
};

export const Room = () => {
  const [initialized, setInitialized] = React.useState(false);

  const instance = useWeave((state) => state.instance);
  const status = useWeave((state) => state.status);
  const roomLoaded = useWeave((state) => state.room.loaded);

  const room = useCollaborationRoom((state) => state.room);
  const roomInfo = useCollaborationRoom((state) => state.roomInfo.data);
  const comBusConnected = useCollaborationRoom(
    (state) => state.commBus.connected,
  );
  const errorFetchConnectionUrl = useCollaborationRoom(
    (state) => state.fetchConnectionUrl.error,
  );
  const setFetchConnectionUrlError = useCollaborationRoom(
    (state) => state.setFetchConnectionUrlError,
  );

  const { loadedParams } = useHandleRouteParams();

  const pagesManaged = useManageRoomPages(room ?? "");

  const { session, isPending } = useGetSession();

  const getUser = React.useCallback(() => {
    return {
      id: `${session?.user.id}-${uuidv4()}`,
      name: session?.user.name,
      email: session?.user.email,
      image: session?.user.image,
    } as WeaveUser;
  }, [session]);

  const rendererProvider = useGetRendererKonvaBase();
  // const rendererProvider = useGetRendererKonvaReactReconciler();

  const storeProvider = useGetAzureWebPubSubProvider({
    loadedParams: true,
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
    // if (status === WEAVE_INSTANCE_STATUS.CONNECTING_ERROR) {
    //   router.push("/error?errorCode=room-failed-connection");
    // }
    // if (!room && !user && loadedParams) {
    //   router.push("/error?errorCode=room-required-parameters");
    // }
    // if (errorFetchConnectionUrl) {
    //   router.push("/error?errorCode=room-failed-connection");
    // }
  }, [
    // router,
    room,
    session,
    status,
    errorFetchConnectionUrl,
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
          <WeaveProvider
            getContainer={() => {
              const shadowHost = document.getElementById("shadow-host");
              return shadowHost?.shadowRoot?.querySelector(
                "#weave",
              ) as HTMLDivElement;
            }}
            store={storeProvider}
            renderer={rendererProvider}
            fonts={FONTS}
            nodes={NODES()}
            plugins={PLUGINS(getUser)}
            actions={ACTIONS(getUser)}
          >
            <UploadImage />
            <UploadImages />
            <UploadVideo />
            <RoomLayout inShadowDom />
            <HelpDrawer />
          </WeaveProvider>
        )}
      {!initialized && (
        <main className="absolute top-0 left-0 right-0 bottom-0 w-full h-full block flex justify-center items-center">
          <RoomLoader />
        </main>
      )}
      <Toaster
        offset={16}
        mobileOffset={16}
        toastOptions={{
          classNames: {
            toast: "font-inter font-light text-xs",
            title: "w-full font-inter font-semibold text-sm",
            description: "w-full font-inter font-light text-xs !text-black",
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
