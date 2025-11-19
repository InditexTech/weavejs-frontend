// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { toast } from "sonner";
import {
  WeaveImageToolActionOnAddedEvent,
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

  const [positionCalculated, setPositionCalculated] =
    React.useState<boolean>(false);

  const instance = useWeave((state) => state.instance);

  const room = useCollaborationRoom((state) => state.room);
  const setUploadingImage = useCollaborationRoom(
    (state) => state.setUploadingImage
  );
  const workloadsEnabled = useCollaborationRoom(
    (state) => state.features.workloads
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
    (state) => state.setShowSelectFileImage
  );

  React.useEffect(() => {
    const onAddedImageHandler = ({ nodeId }: { nodeId: string }) => {
      setUploadingImage(false);

      if (!addImageRef.current) {
        return;
      }

      if (pastingToastIdRef.current) {
        toast.dismiss(pastingToastIdRef.current);
        pastingToastIdRef.current = null;
      }

      toast.success("Paste successful");

      if (!positionCalculated) {
        return;
      }

      const node = instance?.getStage().findOne(`#${nodeId}`);

      if (node) {
        node?.x(node.x() - node.width() / 2);
        node?.y(node.y() - node.height() / 2);

        const nodeHandle = instance?.getNodeHandler<WeaveNode>(
          node.getAttrs().nodeType
        );

        if (nodeHandle) {
          instance?.updateNode(
            nodeHandle.serialize(node as WeaveElementInstance)
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
        });
      }
    };

    instance?.addEventListener<WeaveImageToolActionOnAddedEvent>(
      "onAddedImage",
      onAddedImageHandler
    );

    return () => {
      instance?.removeEventListener("onAddedImage", onAddedImageHandler);
    };
  }, [instance, positionCalculated, setUploadingImage]);

  React.useEffect(() => {
    const onPasteExternalImage = async ({
      positionCalculated,
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

      let blob: Blob | null = null;
      if (dataList && dataList.length === 1) {
        const item = dataList[0];
        if (item.type === "image/png" || item.type === "image/jpeg") {
          blob = await item.getAsFile();
        }
      }

      if (!blob && isClipboardAPIAvailable() && items?.length === 1) {
        const item = items[0];

        if (
          item.types.includes("image/png") &&
          !item.types.includes("text/plain")
        ) {
          blob = await item.getType("image/png");
        }
        if (
          item.types.includes("image/jpeg") &&
          !item.types.includes("text/plain")
        ) {
          blob = await item.getType("image/jpeg");
        }
        if (
          item.types.includes("image/gif") &&
          !item.types.includes("text/plain")
        ) {
          blob = await item.getType("image/gif");
        }
      }

      if (!blob) {
        return;
      }

      pastingToastIdRef.current = toast.loading("Pasting...");

      setUploadingImage(true);
      const file = new File([blob], "external.image");
      mutationUpload.mutate(file, {
        onSuccess: (data) => {
          const room: string = data.image.fileName.split("/")[0];
          const imageId = data.image.fileName.split("/")[1];

          const queryKey = ["getImages", room];
          queryClient.invalidateQueries({ queryKey });

          instance?.triggerAction(
            "imageTool",
            {
              position,
              forceMainContainer: true,
              imageURL: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${room}/images/${imageId}`,
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ) as any;

          addImageRef.current = imageId;

          setPositionCalculated(positionCalculated);
        },
        onError: (ex) => {
          console.error(ex);
          setUploadingImage(false);
          console.error("Error uploading image");
        },
      });
    };

    if (instance) {
      instance.addEventListener("onPasteExternal", onPasteExternalImage);
    }

    return () => {
      if (instance) {
        instance.removeEventListener("onPasteExternal", onPasteExternalImage);
      }
    };
  }, [
    instance,
    queryClient,
    mutationUpload,
    setShowSelectFileImage,
    setUploadingImage,
  ]);
}
