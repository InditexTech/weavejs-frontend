// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { ShortcutElement } from "../../help/shortcut-element";
import { SYSTEM_OS } from "@/lib/utils";
import { useWeave } from "@inditextech/weave-react";
import { Image, ImagePlus, Images } from "lucide-react";
import { useIACapabilities } from "@/store/ia";
import { useCollaborationRoom } from "@/store/store";

export const useImagesTools = () => {
  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);

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
        return;
      }
      if (instance && actualAction === toolName) {
        instance.cancelAction(toolName);
      }
    },
    [instance, actualAction]
  );

  const IMAGES_TOOLS: Record<
    string,
    {
      icon: React.JSX.Element;
      label: React.JSX.Element;
      onClick: () => void;
      active: () => boolean;
    }
  > = React.useMemo(
    () => ({
      imageTool: {
        // eslint-disable-next-line jsx-a11y/alt-text
        icon: <Image className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Image tool</p>
            <ShortcutElement
              shortcuts={{
                [SYSTEM_OS.MAC]: "I",
                [SYSTEM_OS.OTHER]: "I",
              }}
            />
          </div>
        ),
        onClick: () => {
          triggerTool("imageTool");
          setShowSelectFileImage(true);
        },
        active: () => actualAction === "imageTool",
      },
      imagesTool: {
        icon: <Images className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Images tool</p>
            <ShortcutElement
              shortcuts={{
                [SYSTEM_OS.MAC]: "O",
                [SYSTEM_OS.OTHER]: "O",
              }}
            />
          </div>
        ),
        onClick: () => {
          setShowSelectFilesImages(true);
        },
        active: () => actualAction === "imagesTool",
      },
      generateImageTool: {
        icon: <ImagePlus className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Generate Image tool</p>
            <ShortcutElement
              shortcuts={{
                [SYSTEM_OS.MAC]: "G",
                [SYSTEM_OS.OTHER]: "G",
              }}
            />
          </div>
        ),
        onClick: () => {
          setImagesLLMPopupType("create");
          if (imagesLLMPopupType === "create") {
            setImagesLLMPopupVisible(!imagesLLMPopupVisible);
          } else {
            setImagesLLMPopupVisible(true);
          }
        },
        active: () => imagesLLMPopupVisible && imagesLLMPopupType === "create",
      },
    }),
    [
      actualAction,
      imagesLLMPopupType,
      imagesLLMPopupVisible,
      setImagesLLMPopupType,
      setImagesLLMPopupVisible,
      setShowSelectFileImage,
      setShowSelectFilesImages,
      triggerTool,
    ]
  );

  return IMAGES_TOOLS;
};
