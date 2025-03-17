"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { postImage } from "@/api/post-image";
import { WeaveUser, WEAVE_INSTANCE_STATUS } from "@inditextech/weavejs-sdk";
import { useCollaborationRoom } from "@/store/store";
import { useWeave, WeaveProvider } from "@inditextech/weavejs-react";
import { RoomLayout } from "./room.layout";
import { RoomLoader } from "../room-components/room-loader/room-loader";
import { AnimatePresence } from "framer-motion";
import useGetWeaveJSProps from "../room-components/hooks/use-get-weave-js-props";
import useGetWsProvider from "../room-components/hooks/use-get-ws-provider";
import useHandleRouteParams from "../room-components/hooks/use-handle-route-params";

const statusMap = {
  ["idle"]: "Idle",
  ["starting"]: "Starting Weave...",
  ["loadingFonts"]: "Fetching custom fonts...",
  ["running"]: "Running",
};

export const Room = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputFileRef = React.useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileUploadFinishRef = React.useRef<any>(null);

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

  const setUploadingImage = useCollaborationRoom(
    (state) => state.setUploadingImage
  );

  const mutationUpload = useMutation({
    mutationFn: async (file: File) => {
      return await postImage(room ?? "", file);
    },
  });

  const { loadedParams } = useHandleRouteParams();

  const getUser = React.useCallback(() => {
    return user as WeaveUser;
  }, [user]);

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

  const { fonts, nodes, customPlugins, actions } = useGetWeaveJSProps({
    inputFileRef,
    fileUploadFinishRef,
  });

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

  if ((!room || !user) && loadedParams) {
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
          <RoomLoader
            roomId={room ? room : "-"}
            content="LOADING ROOM"
            description={loadingDescription}
          />
        )}
      </AnimatePresence>
      {loadedParams && room && wsStoreProvider && (
        <WeaveProvider
          containerId="weave"
          getUser={getUser}
          store={wsStoreProvider}
          fonts={fonts}
          nodes={nodes}
          actions={actions}
          customPlugins={customPlugins}
        >
          <input
            type="file"
            accept="image/png,image/gif,image/jpeg"
            name="image"
            ref={inputFileRef}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setUploadingImage(true);
                mutationUpload.mutate(file, {
                  onSuccess: (data) => {
                    inputFileRef.current.value = null;
                    const room = data.fileName.split("/")[0];
                    const imageId = data.fileName.split("/")[1];

                    fileUploadFinishRef.current(
                      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${room}/images/${imageId}`
                    );
                  },
                  onError: () => {
                    console.error("Error uploading image");
                  },
                  onSettled: () => {
                    setUploadingImage(false);
                  },
                });
              }
            }}
          />
          <RoomLayout />
        </WeaveProvider>
      )}
    </>
  );
};
