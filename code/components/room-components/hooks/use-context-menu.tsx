import {
  Weave,
  WeaveContextMenuPlugin,
  WeaveCopyPasteNodesPlugin,
  WeaveSelection,
} from "@inditextech/weavejs-sdk";
// import { useMutation } from "@tanstack/react-query";
// import { postImage } from "@/api/post-image";
// import { removeBackground, preload } from "@imgly/background-removal";
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
  // ImageMinus,
} from "lucide-react";
import { useCollaborationRoom } from "@/store/store";
import React from "react";
import { ContextMenuOption } from "../context-menu";
// import Konva from "konva";

function useContextMenu() {
  // const room = useCollaborationRoom((state) => state.room);
  const setContextMenuShow = useCollaborationRoom(
    (state) => state.setContextMenuShow
  );
  const setContextMenuPosition = useCollaborationRoom(
    (state) => state.setContextMenuPosition
  );
  const setContextMenuOptions = useCollaborationRoom(
    (state) => state.setContextMenuOptions
  );
  // const setTransformingImage = useCollaborationRoom(
  //   (state) => state.setTransformingImage
  // );
  // const setUploadingImage = useCollaborationRoom(
  //   (state) => state.setUploadingImage
  // );

  // const mutationUpload = useMutation({
  //   mutationFn: async (file: File) => {
  //     return await postImage(room ?? "", file);
  //   },
  // });

  // React.useEffect(() => {
  //   preload({
  //     progress: (key, current, total) => {
  //       console.log(`Downloading ${key}: ${current} of ${total}`);
  //     },
  //     publicPath: `${window.location.origin}/background-remover/`,
  //     model: "isnet_quint8",
  //     output: {
  //       format: "image/png",
  //       quality: 1,
  //     },
  //   })
  //     .then(() => {
  //       console.log("Asset preloading succeeded");
  //     })
  //     .catch((ex) => {
  //       console.error(ex);
  //     });
  // }, []);

  const getContextMenu = React.useCallback(
    ({
      actInstance,
      actIsActionActive,
      actCanCopy,
      actCanPaste,
      canUnGroup,
      nodes,
      canGroup,
    }: {
      actInstance: Weave;
      actIsActionActive: boolean;
      actCanCopy: boolean;
      actCanPaste: boolean;
      canUnGroup: boolean;
      canGroup: boolean;
      nodes: WeaveSelection[];
    }): ContextMenuOption[] => {
      const options: ContextMenuOption[] = [
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

      // if (nodes.length === 1 && nodes[0].node.type === "image") {
      //   options.unshift({
      //     id: "div-image",
      //     type: "divider",
      //   });
      //   options.unshift({
      //     id: "removeBackground",
      //     type: "button",
      //     label: "Remove background",
      //     icon: <ImageMinus size={16} />,
      //     onClick: () => {
      //       if (actInstance) {
      //         const nodeImage = nodes[0].instance as Konva.Group | undefined;
      //         if (nodeImage) {
      //           const nodeImageInternal = nodeImage?.findOne(
      //             `#${nodeImage.getAttrs().id}-image`
      //           );
      //           if (nodeImageInternal) {
      //             const image = nodeImageInternal.getAttr(
      //               "image"
      //             ) as HTMLImageElement;
      //             if (image) {
      //               setTransformingImage(true);

      //               const res = actInstance.triggerAction("imageTool");
      //               // eslint-disable-next-line @typescript-eslint/no-explicit-any
      //               const { finishUploadCallback } = res as any;

      //               removeBackground(image.src, {
      //                 progress: (key, current, total) => {
      //                   console.log(
      //                     `Downloading ${key}: ${current} of ${total}`
      //                   );
      //                 },
      //                 publicPath: `${window.location.origin}/background-remover/`,
      //                 model: "isnet_quint8",
      //                 output: {
      //                   format: "image/png",
      //                   quality: 1,
      //                 },
      //               })
      //                 .then((blob: Blob) => {
      //                   setTransformingImage(false);
      //                   const myFile = new File([blob], "removedBg.png", {
      //                     type: blob.type,
      //                   });
      //                   setUploadingImage(true);
      //                   mutationUpload.mutate(myFile as File, {
      //                     // eslint-disable-next-line @typescript-eslint/no-explicit-any
      //                     onSuccess: (data: any) => {
      //                       const room = data.fileName.split("/")[0];
      //                       const imageId = data.fileName.split("/")[1];

      //                       finishUploadCallback?.(
      //                         `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${room}/images/${imageId}`
      //                       );
      //                     },
      //                     onError: () => {
      //                       console.error("Error uploading image");
      //                     },
      //                     onSettled: () => {
      //                       setUploadingImage(false);
      //                     },
      //                   });
      //                 })
      //                 .catch((ex) => {
      //                   setTransformingImage(false);
      //                   console.error(ex);
      //                 });
      //             }
      //           }
      //         }
      //       }
      //     },
      //   });
      // }

      return options;
    },
    []
    // [mutationUpload, setTransformingImage, setUploadingImage]
  );

  const onNodeMenu = React.useCallback(
    (
      actInstance: Weave,
      nodes: WeaveSelection[],
      point: { x: number; y: number }
    ) => {
      const canGroup = nodes.length > 1;
      const canUnGroup = nodes.length === 1 && nodes[0].node.type === "group";

      const weaveCopyPasteNodesPlugin =
        actInstance.getPlugin<WeaveCopyPasteNodesPlugin>("copyPasteNodes");

      const actIsActionActive =
        typeof actInstance.getActiveAction() !== "undefined";
      const actCanCopy = weaveCopyPasteNodesPlugin.canCopy();
      const actCanPaste = weaveCopyPasteNodesPlugin.canPaste();

      setContextMenuShow(true);
      setContextMenuPosition(point);

      const contextMenu = getContextMenu({
        actInstance,
        actIsActionActive,
        actCanCopy,
        actCanPaste,
        canUnGroup,
        nodes,
        canGroup,
      });
      setContextMenuOptions(contextMenu);
    },
    [
      getContextMenu,
      setContextMenuOptions,
      setContextMenuPosition,
      setContextMenuShow,
    ]
  );

  const contextMenu = React.useMemo(
    () =>
      new WeaveContextMenuPlugin(
        {
          xOffset: 10,
          yOffset: 10,
        },
        {
          onNodeMenu,
        }
      ),
    [onNodeMenu]
  );

  return { contextMenu };
}

export default useContextMenu;
