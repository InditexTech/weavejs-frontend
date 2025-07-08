// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { Vector2d } from "konva/lib/types";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postImage } from "@/api/post-image";
import { Eraser, CircleSlash2, SprayCan } from "lucide-react";
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
import { ToolsOverlayTouch } from "./tools-overlay.touch";
import { MoveToolTrigger } from "./tools-triggers/move-tool";
import { ToolbarDivider } from "../toolbar/toolbar-divider";
import { ToolsOverlayMouse } from "./tools-overlay.mouse";

export function ToolsOverlay() {
  useKeyboardHandler();

  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

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

  const queryClient = useQueryClient();

  const mutationUpload = useMutation({
    mutationFn: async (file: File) => {
      return await postImage(room ?? "", file);
    },
  });

  const setShowSelectFileImage = useCollaborationRoom(
    (state) => state.setShowSelectFileImage
  );

  const triggerTool = React.useCallback(
    (toolName: string, params?: unknown) => {
      if (instance && actualAction !== toolName) {
        instance.triggerAction(toolName, params);
        return;
      }
      if (instance && actualAction === toolName) {
        instance.cancelAction(toolName);
        return;
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

  if (imagesLLMPopupVisible && imagesLLMPopupType !== "edit-mask") {
    return;
  }

  if (imagesLLMPopupVisible && imagesLLMPopupType === "edit-mask") {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={topElementVariants}
        className="pointer-events-none absolute left-[16px] right-[16px] bottom-[16px] flex flex-col gap-2 justify-center items-center"
      >
        <Toolbar orientation="horizontal">
          <MoveToolTrigger />
          <ToolbarDivider />
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
                <p>Free Hand Mask tool</p>
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
                <p>Regular Mask tool</p>
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
            icon={<Eraser className="px-2" size={40} strokeWidth={1} />}
            disabled={
              weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
            }
            active={actualAction === "maskEraserTool"}
            onClick={() => triggerTool("maskEraserTool")}
            label={
              <div className="flex gap-3 justify-start items-center">
                <p>Erase Mask tool</p>
              </div>
            }
            tooltipSide="top"
            tooltipAlign="center"
          />
        </Toolbar>
      </motion.div>
    );
  }

  return (
    <>
      <ToolsOverlayTouch />
      <ToolsOverlayMouse />
    </>
  );
}
