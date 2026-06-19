// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { Image, Images, Video } from "lucide-react";
import { useCollaborationRoom } from "@/store/store";
import {
  WEAVE_IMAGE_TOOL_ACTION_NAME,
  WEAVE_IMAGES_TOOL_ACTION_NAME,
} from "@inditextech/weave-sdk";
import { formatForDisplay } from "@tanstack/react-hotkeys";
import { IMAGE_WITH_TITLE_ACTION_NAME } from "@/components/actions/image-with-title-tool/constants";

export const useMediaTools = () => {
  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);

  const setShowSelectFileImage = useCollaborationRoom(
    (state) => state.setShowSelectFileImage,
  );
  const setShowSelectFileWithTitleImage = useCollaborationRoom(
    (state) => state.setShowSelectFileWithTitleImage,
  );
  const setShowSelectFilesImages = useCollaborationRoom(
    (state) => state.setShowSelectFilesImages,
  );
  const setShowSelectFileVideo = useCollaborationRoom(
    (state) => state.setShowSelectFileVideo,
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
    [instance, actualAction],
  );

  const MEDIA_TOOLS: Record<
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
        icon: <Image className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Image tool</p>
            {formatForDisplay("I")}
          </div>
        ),
        onClick: () => {
          setShowSelectFileImage(true);
        },
        active: () => actualAction === WEAVE_IMAGE_TOOL_ACTION_NAME,
      },
      imagesTool: {
        icon: <Images className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Images tool</p>
            {formatForDisplay("O")}
          </div>
        ),
        onClick: () => {
          setShowSelectFilesImages(true);
        },
        active: () => actualAction === WEAVE_IMAGES_TOOL_ACTION_NAME,
      },
      imageWithTitleTool: {
        icon: <Image className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Image with Title tool</p>
          </div>
        ),
        onClick: () => {
          setShowSelectFileWithTitleImage(true);
        },
        active: () => actualAction === IMAGE_WITH_TITLE_ACTION_NAME,
      },
      videoTool: {
        icon: <Video className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Video tool</p>
          </div>
        ),
        onClick: () => {
          triggerTool("videoTool");
          setShowSelectFileVideo(true);
        },
        active: () => actualAction === "videoTool",
      },
    }),
    [
      actualAction,
      setShowSelectFileVideo,
      triggerTool,
      setShowSelectFileImage,
      setShowSelectFilesImages,
    ],
  );

  return MEDIA_TOOLS;
};
