// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import {
  getDownscaleRatio,
  getImageSizeFromFile,
  WEAVE_IMAGE_TOOL_ACTION_NAME,
  WEAVE_IMAGE_TOOL_UPLOAD_TYPE,
  WeaveImageToolActionOnAddedEvent,
  WeaveImageToolActionTriggerParams,
  WeaveImageToolActionTriggerReturn,
  WeaveNode,
  WeaveNodesSelectionPlugin,
} from "@inditextech/weave-sdk";
import { WeaveElementInstance } from "@inditextech/weave-types";
import { Vector2d } from "konva/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postImage } from "@/api/post-image";
import { postImage as postImageV2 } from "@/api/v2/post-image";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { isClipboardAPIAvailable } from "@/lib/utils";

export function useOnPasteExternalImage() {
  const addImageRef = React.useRef<string | null>(null);
  const pastingToastIdRef = React.useRef<string | number | null>(null);

  const instance = useWeave((state) => state.instance);

  const room = useCollaborationRoom((state) => state.room);
  const workloadsEnabled = useCollaborationRoom(
    (state) => state.features.workloads,
  );

  const queryClient = useQueryClient();

  const mutationUpload = useMutation({
    mutationFn: async (file: File) => {
      if (workloadsEnabled) {
        return await postImageV2(room ?? "", file);
      }
      return await postImage(room ?? "", file);
    },
  });

  const setShowSelectFileImage = useCollaborationRoom(
    (state) => state.setShowSelectFileImage,
  );

  React.useEffect(() => {
    const onAddedImageHandler = ({ nodeId }: { nodeId: string }) => {
      if (!addImageRef.current) {
        return;
      }

      if (pastingToastIdRef.current) {
        toast.dismiss(pastingToastIdRef.current);
        pastingToastIdRef.current = null;
      }

      toast.success("Paste successful");

      const node = instance?.getStage().findOne(`#${nodeId}`);

      if (node) {
        node?.x(node.x() - node.width() / 2);
        node?.y(node.y() - node.height() / 2);

        const nodeHandle = instance?.getNodeHandler<WeaveNode>(
          node.getAttrs().nodeType,
        );

        if (nodeHandle) {
          instance?.updateNode(
            nodeHandle.serialize(node as WeaveElementInstance),
          );
        }

        const selectionPlugin =
          instance?.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
        if (selectionPlugin) {
          selectionPlugin.setSelectedNodes([node]);
        }

        instance?.triggerAction("fitToSelectionTool", {
          previousAction: "selectionTool",
          smartZoom: true,
          overrideZoom: false,
        });
      }
    };

    instance?.addEventListener<WeaveImageToolActionOnAddedEvent>(
      "onAddedImage",
      onAddedImageHandler,
    );

    return () => {
      instance?.removeEventListener("onAddedImage", onAddedImageHandler);
    };
  }, [instance]);

  React.useEffect(() => {
    const onPasteExternalImage = async ({
      position,
      items,
      dataList,
    }: {
      positionCalculated: boolean;
      position: Vector2d;
      items?: ClipboardItems;
      dataList?: DataTransferItemList;
    }) => {
      if (items?.length === 0 && dataList?.length === 0) {
        return;
      }

      const files: File[] = [];
      if (dataList) {
        for (const item of dataList) {
          if (item.type === "image/png" || item.type === "image/jpeg") {
            const file = await item.getAsFile();
            if (file) {
              files.push(file);
            }
          }
        }
      }

      if (files.length === 0 && isClipboardAPIAvailable() && items) {
        for (const item of items) {
          if (
            item.types.includes("image/png") &&
            !item.types.includes("text/plain")
          ) {
            const blob = await item.getType("image/png");
            const file = new File([blob], "external.image");
            files.push(file);
          }
          if (
            item.types.includes("image/jpeg") &&
            !item.types.includes("text/plain")
          ) {
            const blob = await item.getType("image/jpeg");
            const file = new File([blob], "external.image");
            files.push(file);
          }
          if (
            item.types.includes("image/gif") &&
            !item.types.includes("text/plain")
          ) {
            const blob = await item.getType("image/gif");
            const file = new File([blob], "external.image");
            files.push(file);
          }
        }
      }

      if (files.length === 0) {
        return;
      }

      if (!instance) {
        return;
      }

      if (files.length === 1) {
        const resourceId = uuidv4();

        pastingToastIdRef.current = toast.loading("Pasting...");

        const imageSize = await getImageSizeFromFile(files[0]);
        const downscaleRatio = getDownscaleRatio(
          imageSize.width,
          imageSize.height,
        );

        const uploadImageFunction = async (file: File) => {
          const toastId = toast.loading("Uploading image...", {
            duration: Infinity,
            dismissible: false,
          });

          const data = await mutationUpload.mutateAsync(file, {
            onSuccess: async () => {
              toast.dismiss(toastId);
              toast.success("Image uploaded successfully");
            },
            onError: (ex) => {
              toast.dismiss(toastId);
              toast.error("Error uploading image");

              console.error(ex);
              console.error("Error uploading image");
            },
          });

          const room = data.image.roomId;
          const imageId = data.image.imageId;

          const queryKey = ["getImages", room];
          queryClient.invalidateQueries({ queryKey });

          const apiEndpoint = import.meta.env.VITE_API_V2_ENDPOINT;

          return `${apiEndpoint}/weavejs/rooms/${room}/images/${imageId}`;
        };

        instance.triggerAction<
          WeaveImageToolActionTriggerParams,
          WeaveImageToolActionTriggerReturn
        >(WEAVE_IMAGE_TOOL_ACTION_NAME, {
          type: WEAVE_IMAGE_TOOL_UPLOAD_TYPE.FILE,
          image: {
            file: files[0],
            downscaleRatio,
          },
          uploadImageFunction,
          imageId: resourceId,
          forceMainContainer: false,
          ...(position && { position }),
        });
      }
    };

    if (instance) {
      instance.addEventListener("onPasteExternal", onPasteExternalImage);
    }

    return () => {
      if (instance) {
        instance.removeEventListener("onPasteExternal", onPasteExternalImage);
      }
    };
  }, [instance, queryClient, mutationUpload, setShowSelectFileImage]);
}
