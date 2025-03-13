"use client";

import React from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { postImage } from "@/api/post-image";
import {
  Weave,
  WeaveRectangleToolAction,
  WeavePenToolAction,
  WeaveBrushToolAction,
  WeaveTextToolAction,
  WeaveImageToolAction,
  WeaveZoomOutToolAction,
  WeaveZoomInToolAction,
  WeaveExportNodeToolAction,
  WeaveExportStageToolAction,
  WeaveFitToScreenToolAction,
  WeaveFitToSelectionToolAction,
  WeaveContextMenuPlugin,
  WeaveCopyPasteNodesPlugin,
  WeaveStageNode,
  WeaveLayerNode,
  WeaveGroupNode,
  WeaveRectangleNode,
  WeaveLineNode,
  WeaveTextNode,
  WeaveImageNode,
  WeaveUser,
  WeaveSelection,
  WEAVE_INSTANCE_STATUS,
  WeaveSelectionToolAction,
} from "@inditextech/weavejs-sdk";
// import { WeaveStoreWebsocketsConnectionStatus, WeaveStoreWebsockets } from "@inditextech/weavejs-store-websockets";
import {
  WeaveStoreAzureWebPubsubConnectionStatus,
  WeaveStoreAzureWebPubsub,
} from "@inditextech/weavejs-store-azure-web-pubsub";
import { PantoneNode } from "@/components/nodes/pantone/pantone";
import { PantoneToolAction } from "@/components/actions/pantone-tool/pantone-tool";
import { FrameNode } from "@/components/nodes/frame/frame";
import { FrameToolAction } from "@/components/actions/frame-tool/frame-tool";
import { ContextMenuOption } from "@/components/room-components/context-menu";
import { useCollaborationRoom } from "@/store/store";
import { useWeave, WeaveProvider } from "@inditextech/weavejs-react";
import { RoomLayout } from "./room.layout";
import { AlignElementsToolAction } from "@/components/actions/align-elements-tool/align-elements-tool";
import { RoomLoader } from "../room-components/room-loader";
import {
  Copy,
  Clipboard,
  Group,
  Ungroup,
  Trash,
  SendToBack,
  BringToFront,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Threads from "../ui/reactbits/Backgrounds/Threads/Threads";

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

  const params = useParams<{ roomId: string }>();
  const [loadedParams, setLoadedParams] = React.useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const instance = useWeave((state) => state.instance);
  const status = useWeave((state) => state.status);
  const roomLoaded = useWeave((state) => state.room.loaded);
  const setConnectionStatus = useWeave((state) => state.setConnectionStatus);

  const room = useCollaborationRoom((state) => state.room);
  const user = useCollaborationRoom((state) => state.user);
  const setRoom = useCollaborationRoom((state) => state.setRoom);
  const setUser = useCollaborationRoom((state) => state.setUser);
  const loadingFetchConnectionUrl = useCollaborationRoom(
    (state) => state.fetchConnectionUrl.loading
  );
  const setFetchConnectionUrlLoading = useCollaborationRoom(
    (state) => state.setFetchConnectionUrlLoading
  );
  const errorFetchConnectionUrl = useCollaborationRoom(
    (state) => state.fetchConnectionUrl.error
  );
  const setFetchConnectionUrlError = useCollaborationRoom(
    (state) => state.setFetchConnectionUrlError
  );
  const setNodePropertiesCreateProps = useCollaborationRoom(
    (state) => state.setNodePropertiesCreateProps
  );

  const setContextMenuShow = useCollaborationRoom(
    (state) => state.setContextMenuShow
  );
  const setContextMenuPosition = useCollaborationRoom(
    (state) => state.setContextMenuPosition
  );
  const setContextMenuOptions = useCollaborationRoom(
    (state) => state.setContextMenuOptions
  );
  const setUploadingImage = useCollaborationRoom(
    (state) => state.setUploadingImage
  );
  const setLoadingImage = useCollaborationRoom(
    (state) => state.setLoadingImage
  );

  const mutationUpload = useMutation({
    mutationFn: async (file: File) => {
      return await postImage(room ?? "", file);
    },
  });

  React.useEffect(() => {
    setFetchConnectionUrlError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const roomId = params.roomId;
    const userName = searchParams.get("userName");
    if (roomId && userName) {
      setRoom(roomId);
      setUser({
        name: userName,
        email: `${userName}@weave.js`,
      });
    }
    setLoadedParams(true);
  }, [params.roomId, searchParams, setRoom, setUser]);

  const getUser = React.useCallback(() => {
    return user as WeaveUser;
  }, [user]);

  const onFetchConnectionUrlHandler = React.useCallback(
    ({ loading, error }: { loading: boolean; error: Error | null }) => {
      setFetchConnectionUrlLoading(loading);
      setFetchConnectionUrlError(error);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onConnectionStatusChangeHandler = React.useCallback(
    (status: WeaveStoreAzureWebPubsubConnectionStatus) => {
      setConnectionStatus(status);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // const onConnectionStatusChangeHandler = React.useCallback(
  //   (status: WeaveStoreWebsocketsConnectionStatus) => {
  //     setConnectionStatus(status);
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [],
  // );

  React.useEffect(() => {
    if (instance && status === WEAVE_INSTANCE_STATUS.RUNNING && roomLoaded) {
      instance.triggerAction("selectionTool");
    }
  }, [instance, status, roomLoaded]);

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
      {(!loadedParams ||
        loadingFetchConnectionUrl ||
        status !== WEAVE_INSTANCE_STATUS.RUNNING ||
        (status === WEAVE_INSTANCE_STATUS.RUNNING && !roomLoaded)) && (
        <div className="w-full h-full bg-white flex justify-center items-center relative">
          <div className="absolute top-0 left-0 right-0 h-full">
            <Threads
              color={[246 / 255, 246 / 255, 246 / 255]}
              amplitude={1}
              distance={0}
              enableMouseInteraction={false}
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-full flex justify-center items-center">
            <RoomLoader
              roomId={room ? room : "-"}
              content="LOADING ROOM"
              description={loadingDescription}
            />
          </div>
        </div>
      )}
      {loadedParams && room && (
        <WeaveProvider
          containerId="weave"
          getUser={getUser}
          store={
            // new WeaveStoreWebsockets({
            //   roomId: room,
            //   wsOptions: {
            //     serverUrl: "ws://localhost:1234",
            //   },
            //   callbacks: {
            //     onConnectionStatusChange: onConnectionStatusChangeHandler,
            //   },
            // })
            new WeaveStoreAzureWebPubsub({
              roomId: room,
              url: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${room}/connect`,
              callbacks: {
                onFetchConnectionUrl: onFetchConnectionUrlHandler,
                onConnectionStatusChange: onConnectionStatusChangeHandler,
              },
            })
          }
          fonts={[
            {
              id: "NotoSans",
              name: "Noto Sans",
            },
            {
              id: "NotoSansMono",
              name: "Noto Sans Mono",
            },
          ]}
          nodes={[
            new WeaveStageNode(),
            new WeaveLayerNode(),
            new WeaveGroupNode(),
            new WeaveRectangleNode(),
            new WeaveLineNode(),
            new WeaveTextNode(),
            new WeaveImageNode(),
            new PantoneNode(),
            new FrameNode(),
          ]}
          actions={[
            new WeaveSelectionToolAction(),
            new WeaveRectangleToolAction({
              onPropsChange: (props) => {
                setNodePropertiesCreateProps(props);
              },
            }),
            new WeavePenToolAction({
              onPropsChange: (props) => {
                setNodePropertiesCreateProps(props);
              },
            }),
            new WeaveBrushToolAction({
              onPropsChange: (props) => {
                setNodePropertiesCreateProps(props);
              },
            }),
            new WeaveTextToolAction(),
            new WeaveImageToolAction({
              onPropsChange: (props) => {
                setNodePropertiesCreateProps(props);
              },
              onUploadImage: async (finished: (imageURL: string) => void) => {
                fileUploadFinishRef.current = finished;
                inputFileRef.current.click();
              },
              onImageLoadStart: () => {
                setLoadingImage(true);
              },
              onImageLoadEnd: () => {
                setLoadingImage(false);
              },
            }),
            new WeaveZoomOutToolAction(),
            new WeaveZoomInToolAction(),
            new WeaveFitToScreenToolAction(),
            new WeaveFitToSelectionToolAction(),
            new PantoneToolAction({
              onPropsChange: (props) => {
                setNodePropertiesCreateProps(props);
              },
            }),
            new FrameToolAction({
              onPropsChange: (props) => {
                setNodePropertiesCreateProps(props);
              },
            }),
            new AlignElementsToolAction(),
            new WeaveExportNodeToolAction(),
            new WeaveExportStageToolAction(),
          ]}
          customPlugins={[
            new WeaveContextMenuPlugin(
              {
                xOffset: 10,
                yOffset: 10,
              },
              {
                onNodeMenu: (
                  actInstance: Weave,
                  nodes: WeaveSelection[],
                  point: { x: number; y: number }
                ) => {
                  const canGroup = nodes.length > 1;
                  const canUnGroup =
                    nodes.length === 1 && nodes[0].node.type === "group";

                  const weaveCopyPasteNodesPlugin =
                    actInstance.getPlugin<WeaveCopyPasteNodesPlugin>(
                      "copyPasteNodes"
                    );

                  const actIsActionActive =
                    typeof actInstance.getActiveAction() !== "undefined";
                  const actCanCopy = weaveCopyPasteNodesPlugin.canCopy();
                  const actCanPaste = weaveCopyPasteNodesPlugin.canPaste();

                  setContextMenuShow(true);
                  setContextMenuPosition(point);
                  const contextMenu: ContextMenuOption[] = [
                    {
                      id: "copy",
                      type: "button",
                      label: "Copy",
                      icon: <Copy size={16} />,
                      disabled: actIsActionActive || !actCanCopy,
                      onClick: () => {
                        const weaveCopyPasteNodesPlugin =
                          actInstance.getPlugin<WeaveCopyPasteNodesPlugin>(
                            "copyPasteNodes"
                          );
                        if (weaveCopyPasteNodesPlugin) {
                          return weaveCopyPasteNodesPlugin.copy();
                        }
                      },
                    },
                    {
                      id: "paste",
                      type: "button",
                      label: "Paste",
                      icon: <Clipboard size={16} />,
                      disabled: actIsActionActive || !actCanPaste,
                      onClick: () => {
                        const weaveCopyPasteNodesPlugin =
                          actInstance.getPlugin<WeaveCopyPasteNodesPlugin>(
                            "copyPasteNodes"
                          );
                        if (weaveCopyPasteNodesPlugin) {
                          return weaveCopyPasteNodesPlugin.paste();
                        }
                      },
                    },
                    {
                      id: "div-1",
                      type: "divider",
                    },
                    {
                      id: "bring-to-front",
                      type: "button",
                      label: "Bring to front",
                      icon: <BringToFront size={16} />,
                      disabled: nodes.length !== 1,
                      onClick: () => {
                        actInstance.bringToFront(nodes[0].instance);
                      },
                    },
                    {
                      id: "move-up",
                      type: "button",
                      label: "Move up",
                      icon: <ArrowUp size={16} />,
                      disabled: nodes.length !== 1,
                      onClick: () => {
                        actInstance.moveUp(nodes[0].instance);
                      },
                    },
                    {
                      id: "move-down",
                      type: "button",
                      label: "Move down",
                      icon: <ArrowDown size={16} />,
                      disabled: nodes.length !== 1,
                      onClick: () => {
                        actInstance.moveDown(nodes[0].instance);
                      },
                    },
                    {
                      id: "send-to-back",
                      type: "button",
                      label: "Send to back",
                      icon: <SendToBack size={16} />,
                      disabled: nodes.length !== 1,
                      onClick: () => {
                        actInstance.sendToBack(nodes[0].instance);
                      },
                    },
                    {
                      id: "div-2",
                      type: "divider",
                    },
                    {
                      id: "group",
                      type: "button",
                      label: "Group",
                      icon: <Group size={16} />,
                      disabled: !canGroup,
                      onClick: () => {
                        actInstance.group(nodes.map((n) => n.node));
                      },
                    },
                    {
                      id: "ungroup",
                      type: "button",
                      label: "Ungroup",
                      icon: <Ungroup size={16} />,
                      disabled: !canUnGroup,
                      onClick: () => {
                        actInstance.unGroup(nodes[0].node);
                      },
                    },
                    {
                      id: "div-3",
                      type: "divider",
                    },
                    {
                      id: "delete",
                      type: "button",
                      label: "Delete",
                      icon: <Trash size={16} />,
                      onClick: () => {
                        for (const node of nodes) {
                          actInstance.removeNode(node.node);
                        }
                      },
                    },
                  ];

                  setContextMenuOptions(contextMenu);
                },
              }
            ),
          ]}
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
                    setUploadingImage(false);
                    const room = data.fileName.split("/")[0];
                    const imageId = data.fileName.split("/")[1];

                    fileUploadFinishRef.current(
                      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${room}/images/${imageId}`
                    );
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
