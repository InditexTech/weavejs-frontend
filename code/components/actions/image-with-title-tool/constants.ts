// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { ImageWithTitleToolActionConfig } from "./types";

export const IMAGE_WITH_TITLE_ACTION_NAME = "imageWithTitleTool";

export const IMAGE_WITH_TITLE_TOOL_UPLOAD_TYPE = {
  ["FILE"]: "file",
} as const;

export const IMAGE_WITH_TITLE_TOOL_STATE = {
  ["IDLE"]: "idle",
  ["DEFINING_POSITION"]: "definingPosition",
  ["SELECTED_POSITION"]: "selectedPosition",
  ["ADDING"]: "adding",
  ["FINISHED"]: "finished",
} as const;

export const IMAGE_WITH_TITLE_TOOL_CONFIG_DEFAULT: ImageWithTitleToolActionConfig =
  {
    style: {
      cursor: {
        padding: 5,
        imageThumbnail: {
          width: 250,
          height: 250,
          shadowColor: "#aaaaaa",
          shadowBlur: 10,
          shadowOffset: { x: 2, y: 2 },
          shadowOpacity: 0.5,
        },
      },
    },
  };
