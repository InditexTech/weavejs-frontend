// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { Vector2d } from "konva/lib/types";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postImage } from "@/api/post-image";
import {
  Brush,
  Image,
  Images,
  PenTool,
  Square,
  Type,
  Frame,
  MousePointer,
  Hand,
  Tags,
  Undo,
  Redo,
  Eraser,
  Circle,
  Star,
  ArrowUpRight,
  Hexagon,
  ImagePlus,
  CircleSlash2,
  SprayCan,
} from "lucide-react";
import { useWeave } from "@inditextech/weave-react";
import { Toolbar } from "../toolbar/toolbar";
import { motion } from "framer-motion";
import { topElementVariants } from "./variants";
import { useCollaborationRoom } from "@/store/store";
import { ShortcutElement } from "../help/shortcut-element";
import { SYSTEM_OS } from "@/lib/utils";
import { useKeyboardHandler } from "../hooks/use-keyboard-handler";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { useIACapabilities } from "@/store/ia";

function ToolbarDivider() {
  return (
    <div className="w-full justify-center items-center flex">
      <div className="w-[1px] h-[20px] bg-zinc-200 mx-1"></div>
    </div>
  );
}

export function ToolsOverlay() {
  useKeyboardHandler();

  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);
  const canUndo = useWeave((state) => state.undoRedo.canUndo);
  const canRedo = useWeave((state) => state.undoRedo.canRedo);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const nodeCreateProps = useCollaborationRoom(
    (state) => state.nodeProperties.createProps
  );
  const room = useCollaborationRoom((state) => state.room);
  const showUI = useCollaborationRoom((state) => state.ui.show);
  const setUploadingImage = useCollaborationRoom(
    (state) => state.setUploadingImage
  );
  const aiEnabled = useIACapabilities((state) => state.enabled);
  const imagesLLMPopupType = useIACapabilities((state) => state.llmPopup.type);
  const imagesLLMPopupVisible = useIACapabilities(
    (state) => state.llmPopup.visible
  );
  const setImagesLLMPopupType = useIACapabilities(
    (state) => state.setImagesLLMPopupType
  );
  const setImagesLLMPopupVisible = useIACapabilities(
    (state) => state.setImagesLLMPopupVisible
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
  const setShowSelectFilesImages = useCollaborationRoom(
    (state) => state.setShowSelectFilesImages
  );

  const triggerTool = React.useCallback(
    (toolName: string, params?: unknown) => {
      if (instance && actualAction !== toolName) {
        instance.triggerAction(toolName, params);
      }
      if (instance && actualAction === toolName) {
        instance.cancelAction(toolName);
      }
    },
    [instance, actualAction]
  );

  React.useEffect(() => {
    const onPasteExternalImage = async ({
      position,
      item,
    }: {
      position: Vector2d;
      item: ClipboardItem;
    }) => {
      let blob: Blob | null = null;
      if (item.types.includes("image/png")) {
        blob = await item.getType("image/png");
      }
      if (item.types.includes("image/jpeg")) {
        blob = await item.getType("image/jpeg");
      }
      if (item.types.includes("image/gif")) {
        blob = await item.getType("image/gif");
      }

      if (!blob) {
        return;
      }

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
          console.error("Error uploading image");
        },
        onSettled: () => {
          setUploadingImage(false);
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

  if (!showUI) {
    return null;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={topElementVariants}
      className="pointer-events-none absolute left-[16px] right-[16px] bottom-[16px] flex flex-col gap-2 justify-center items-center"
    >
      <Toolbar orientation="horizontal">
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Hand className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "moveTool"}
          onClick={() => triggerTool("moveTool")}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Move</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "M",
                  [SYSTEM_OS.OTHER]: "M",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<MousePointer className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "selectionTool"}
          onClick={() => triggerTool("selectionTool")}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Selection</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "S",
                  [SYSTEM_OS.OTHER]: "S",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Eraser className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "eraserTool"}
          onClick={() => triggerTool("eraserTool")}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Erase</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "D",
                  [SYSTEM_OS.OTHER]: "D",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarDivider />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Square className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "rectangleTool"}
          onClick={() => triggerTool("rectangleTool")}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Add a rectangle</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "R",
                  [SYSTEM_OS.OTHER]: "R",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Circle className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "ellipseTool"}
          onClick={() => triggerTool("ellipseTool")}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Add a ellipsis</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "E",
                  [SYSTEM_OS.OTHER]: "E",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Hexagon className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "regularPolygonTool"}
          onClick={() => triggerTool("regularPolygonTool")}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Add a regular polygon</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "P",
                  [SYSTEM_OS.OTHER]: "P",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<PenTool className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "penTool"}
          onClick={() => triggerTool("penTool")}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Add a line</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "L",
                  [SYSTEM_OS.OTHER]: "L",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Brush className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "brushTool"}
          onClick={() => triggerTool("brushTool")}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Free draw</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "B",
                  [SYSTEM_OS.OTHER]: "B",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Type className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "textTool"}
          onClick={() => triggerTool("textTool")}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Add text</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "T",
                  [SYSTEM_OS.OTHER]: "T",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Star className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "starTool"}
          onClick={() => triggerTool("starTool")}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Add a star</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "J",
                  [SYSTEM_OS.OTHER]: "J",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<ArrowUpRight className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "arrowTool"}
          onClick={() => triggerTool("arrowTool")}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Add a arrow</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "A",
                  [SYSTEM_OS.OTHER]: "A",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Frame className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "frameTool"}
          onClick={() => triggerTool("frameTool", nodeCreateProps)}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Add a frame</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "F",
                  [SYSTEM_OS.OTHER]: "F",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarDivider />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Image className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "imageTool"}
          onClick={() => {
            triggerTool("imageTool");
            setShowSelectFileImage(true);
          }}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Add an image</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "I",
                  [SYSTEM_OS.OTHER]: "I",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Images className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "imagesTool"}
          onClick={() => {
            // triggerTool("imagesTool");
            setShowSelectFilesImages(true);
          }}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Add images</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "O",
                  [SYSTEM_OS.OTHER]: "O",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarDivider />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<ImagePlus className="px-2" size={40} strokeWidth={1} />}
          active={imagesLLMPopupVisible && imagesLLMPopupType === "create"}
          disabled={
            !aiEnabled ||
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          onClick={() => {
            setImagesLLMPopupType("create");
            if (imagesLLMPopupType === "create") {
              setImagesLLMPopupVisible(!imagesLLMPopupVisible);
            } else {
              setImagesLLMPopupVisible(true);
            }
          }}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Generate an image from prompt</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "G",
                  [SYSTEM_OS.OTHER]: "G",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<SprayCan className="px-2" size={40} strokeWidth={1} />}
          active={actualAction === "fuzzyMaskTool"}
          disabled={
            !aiEnabled ||
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          onClick={() => {
            triggerTool("fuzzyMaskTool");
          }}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Create a fuzzy mask</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "Q",
                  [SYSTEM_OS.OTHER]: "Q",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<CircleSlash2 className="px-2" size={40} strokeWidth={1} />}
          active={actualAction === "maskTool"}
          disabled={
            !aiEnabled ||
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          onClick={() => {
            triggerTool("maskTool");
          }}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Create a mask</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "W",
                  [SYSTEM_OS.OTHER]: "W",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarDivider />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Tags className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "colorTokenTool"}
          onClick={() => triggerTool("colorTokenTool")}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Add color token reference</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "P",
                  [SYSTEM_OS.OTHER]: "P",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarDivider />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Undo className="px-2" size={40} strokeWidth={1} />}
          disabled={
            !canUndo ||
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          onClick={() => {
            if (instance) {
              const actualStore = instance.getStore();
              actualStore.undoStateStep();
            }
          }}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Undo latest changes</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "⌘ Z",
                  [SYSTEM_OS.OTHER]: "Ctrl Z",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Redo className="px-2" size={40} strokeWidth={1} />}
          disabled={
            !canRedo ||
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          onClick={() => {
            if (instance) {
              const actualStore = instance.getStore();
              actualStore.redoStateStep();
            }
          }}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Redo latest changes</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "⌘ Y",
                  [SYSTEM_OS.OTHER]: "Ctrl Y",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
      </Toolbar>
    </motion.div>
  );
}
