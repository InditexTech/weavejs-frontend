"use client";

import React from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
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
} from "@inditextech/weavejs-sdk";
// import { WeaveStoreWebsocketsConnectionStatus, WeaveStoreWebsockets } from "@weavejs/store-websockets";
import { WeaveStoreAzureWebPubsubConnectionStatus, WeaveStoreAzureWebPubsub } from "@weavejs/store-azure-web-pubsub";
import { PantoneNode } from "@/components/nodes/pantone/pantone";
import { PantoneToolAction } from "@/components/actions/pantone-tool/pantone-tool";
import { WorkspaceNode } from "@/components/nodes/workspace/workspace";
import { WorkspaceToolAction } from "@/components/actions/workspace-tool/workspace-tool";
import { ContextMenuOption } from "@/components/room-components/context-menu";
import { useCollaborationRoom } from "@/store/store";
import { useWeave, WeaveProvider } from "@inditextech/weavejs-react";
import { RoomLayout } from "./room.layout";
import { AlignElementsToolAction } from "@/components/actions/align-elements-tool/align-elements-tool";
import { RoomLoader } from "../room-components/room-loader";

export const Room = () => {
  const params = useParams<{ roomId: string }>();
  const [loadedParams, setLoadedParams] = React.useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const setConnectionStatus = useWeave((state) => state.setConnectionStatus);

  const room = useCollaborationRoom((state) => state.room);
  const user = useCollaborationRoom((state) => state.user);
  const setRoom = useCollaborationRoom((state) => state.setRoom);
  const setUser = useCollaborationRoom((state) => state.setUser);
  const setFetchConnectionUrlLoading = useCollaborationRoom((state) => state.setFetchConnectionUrlLoading);
  const setFetchConnectionUrlError = useCollaborationRoom((state) => state.setFetchConnectionUrlError);

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
    [],
  );

  const onConnectionStatusChangeHandler = React.useCallback(
    (status: WeaveStoreAzureWebPubsubConnectionStatus) => {
      setConnectionStatus(status);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // const onConnectionStatusChangeHandler = React.useCallback(
  //   (status: WeaveStoreWebsocketsConnectionStatus) => {
  //     setConnectionStatus(status);
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [],
  // );

  if (!loadedParams) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <RoomLoader content="loadingParams" />
      </div>
    );
  }

  if (!room || !user) {
    router.push("/error?errorCode=missing-required-parameters");
    return <></>;
  }

  return (
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
          url: `http://localhost:3001/api/v1/weavejs/rooms/${room}/connect`,
          callbacks: {
            onFetchConnectionUrl: onFetchConnectionUrlHandler,
            onConnectionStatusChange: onConnectionStatusChangeHandler,
          },
        })
      }
      fonts={[
        {
          id: "NotoSansMono",
          name: "Noto Sans Mono",
        },
        {
          id: "NeueHelveticaZara",
          name: "Neue Helvetica Zara",
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
        new WorkspaceNode(),
      ]}
      actions={[
        new WeaveRectangleToolAction(),
        new WeavePenToolAction(),
        new WeaveBrushToolAction(),
        new WeaveTextToolAction(),
        new WeaveImageToolAction({
          onUploadImage: async (finished: (imageURL: string) => void) => {
            setUploadingImage(true);
            setTimeout(() => {
              setUploadingImage(false);
              finished(
                "https://lostintokyo.co.uk/content/uploads/sites/3/2017/02/test-image-7MB.jpg"
              );
            }, 1000);
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
        new PantoneToolAction(),
        new WorkspaceToolAction(),
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
                  disabled: nodes.length !== 1,
                  onClick: () => {
                    actInstance.bringToFront(nodes[0].instance);
                  },
                },
                {
                  id: "move-up",
                  type: "button",
                  label: "Move up",
                  disabled: nodes.length !== 1,
                  onClick: () => {
                    actInstance.moveUp(nodes[0].instance);
                  },
                },
                {
                  id: "move-down",
                  type: "button",
                  label: "Move down",
                  disabled: nodes.length !== 1,
                  onClick: () => {
                    actInstance.moveDown(nodes[0].instance);
                  },
                },
                {
                  id: "send-to-back",
                  type: "button",
                  label: "Send to back",
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
                  disabled: !canGroup,
                  onClick: () => {
                    actInstance.group(nodes.map((n) => n.node));
                  },
                },
                {
                  id: "ungroup",
                  type: "button",
                  label: "Ungroup",
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
      <RoomLayout />
    </WeaveProvider>
  );
};
