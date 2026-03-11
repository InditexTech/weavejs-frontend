// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { ShortcutElement } from "../../help/shortcut-element";
import { SYSTEM_OS } from "@/lib/utils";
import { useWeave } from "@inditextech/weave-react";
import { Image, Images } from "lucide-react";
import { useCollaborationRoom } from "@/store/store";
import {
  WEAVE_IMAGE_TOOL_ACTION_NAME,
  WEAVE_IMAGES_TOOL_ACTION_NAME,
} from "@inditextech/weave-sdk";

export const useImagesTools = () => {
  // const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);

  const setShowSelectFileImage = useCollaborationRoom(
    (state) => state.setShowSelectFileImage,
  );
  const setShowSelectFilesImages = useCollaborationRoom(
    (state) => state.setShowSelectFilesImages,
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
          // triggerTool(WEAVE_IMAGE_TOOL_ACTION_NAME);
          setShowSelectFileImage(true);
        },
        active: () => actualAction === WEAVE_IMAGE_TOOL_ACTION_NAME,
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
        active: () => actualAction === WEAVE_IMAGES_TOOL_ACTION_NAME,
      },
    }),
    [actualAction, setShowSelectFileImage, setShowSelectFilesImages],
  );

  return IMAGES_TOOLS;
};
