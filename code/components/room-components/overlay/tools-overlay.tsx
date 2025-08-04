// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postImage } from "@/api/post-image";
import { useWeave } from "@inditextech/weave-react";
import { motion } from "framer-motion";
import { bottomElementVariants } from "./variants";
import { useCollaborationRoom } from "@/store/store";
import { useKeyboardHandler } from "../hooks/use-keyboard-handler";
import { useIACapabilities } from "@/store/ia";
import { ToolsOverlayTouch } from "./tools-overlay.touch";
import { ToolsOverlayMouse } from "./tools-overlay.mouse";
import { ToolsNodeOverlay } from "./tools-node-overlay";
import { ToolsNodesOverlay } from "./tools-nodes-overlay";
import { useNodeActionName } from "./hooks/use-node-action-name";
import { ToolsMaskingOverlay } from "./tools-masking-overlay";
import { isClipboardAPIAvailable } from "@/lib/utils";
import {
  WeaveImageToolActionOnAddedEvent,
  WeaveNodesSelectionPlugin,
} from "@inditextech/weave-sdk";

export function ToolsOverlay() {
  useKeyboardHandler();

  const instance = useWeave((state) => state.instance);

  const room = useCollaborationRoom((state) => state.room);
  const showUI = useCollaborationRoom((state) => state.ui.show);
  const setUploadingImage = useCollaborationRoom(
    (state) => state.setUploadingImage
  );
  const setCroppingImage = useCollaborationRoom(
    (state) => state.setCroppingImage
  );
  const setCroppingNode = useCollaborationRoom(
    (state) => state.setCroppingNode
  );
  const imagesLLMPopupVisible = useIACapabilities(
    (state) => state.llmPopup.visible
  );

  const queryClient = useQueryClient();

  const mutationUpload = useMutation({
    mutationFn: async (file: File) => {
      return await postImage(room ?? "", file);
    },
  });

  const setShowSelectFileImage = useCollaborationRoom(
    (state) => state.setShowSelectFileImage
  );

  React.useEffect(() => {
    if (!instance) return;

    const handlerImageCropStart = ({ instance }: { instance: Konva.Group }) => {
      setCroppingImage(true);
      setCroppingNode(instance);
    };

    const handlerImageCropEnd = () => {
      setCroppingImage(false);
      setCroppingNode(undefined);
    };

    instance.addEventListener("onImageCropStart", handlerImageCropStart);

    instance.addEventListener("onImageCropEnd", handlerImageCropEnd);

    return () => {
      instance.removeEventListener("onImageCropStart", handlerImageCropStart);
      instance.removeEventListener("onImageCropEnd", handlerImageCropEnd);
    };
  }, [instance, setCroppingImage, setCroppingNode]);

  React.useEffect(() => {
    const onPasteExternalImage = async ({
      position,
      items,
      dataList,
    }: {
      position: Vector2d;
      items?: ClipboardItems;
      dataList?: DataTransferItemList;
    }) => {
      if (items?.length === 0 && dataList?.length === 0) {
        return;
      }

      let blob: Blob | null = null;
      if (isClipboardAPIAvailable() && items && items.length === 1) {
        const item = items[0];

        if (item.types.includes("image/png")) {
          blob = await item.getType("image/png");
        }
        if (item.types.includes("image/jpeg")) {
          blob = await item.getType("image/jpeg");
        }
        if (item.types.includes("image/gif")) {
          blob = await item.getType("image/gif");
        }
      }

      if (!blob && dataList && dataList.length === 1) {
        const item = dataList[0];
        if (item.type === "image/png" || item.type === "image/jpeg") {
          blob = await item.getAsFile();
        }
      }

      if (!blob) {
        return;
      }

      instance?.addEventListener<WeaveImageToolActionOnAddedEvent>(
        "onAddedImage",
        ({ nodeId }) => {
          setUploadingImage(false);

          const node = instance?.getStage().findOne(`#${nodeId}`);
          if (node) {
            const selectionPlugin =
              instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
            if (selectionPlugin) {
              selectionPlugin.setSelectedNodes([node]);
            }

            instance?.triggerAction("fitToSelectionTool", {
              previousAction: "selectionTool",
              smartZoom: true,
            });
          }
        }
      );

      setUploadingImage(true);
      const file = new File([blob], "external.image");
      mutationUpload.mutate(file, {
        onSuccess: (data) => {
          const room: string = data.fileName.split("/")[0];
          const imageId = data.fileName.split("/")[1];

          const queryKey = ["getImages", room];
          queryClient.invalidateQueries({ queryKey });

          instance?.triggerAction(
            "imageTool",
            {
              position,
              imageURL: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${room}/images/${imageId}`,
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ) as any;
        },
        onError: () => {
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

  const title = useNodeActionName();

  if (!showUI) {
    return null;
  }

  return (
    <>
      {title !== "Unknown" && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={bottomElementVariants}
          className="pointer-events-none absolute left-[16px] right-[16px] top-[16px] flex flex-col gap-2 justify-center items-center"
        >
          <div className="px-3 py-2 rounded-full font-inter text-xs uppercase bg-white border border-[#c9c9c9]">
            {title}
          </div>
        </motion.div>
      )}
      {!imagesLLMPopupVisible && (
        <>
          <ToolsOverlayTouch />
          <ToolsOverlayMouse />
          <ToolsNodeOverlay />
          <ToolsNodesOverlay />
        </>
      )}
      {imagesLLMPopupVisible && <ToolsMaskingOverlay />}
    </>
  );
}
