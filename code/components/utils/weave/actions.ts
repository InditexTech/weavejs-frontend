// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import {
  WeaveMoveToolAction,
  WeaveSelectionToolAction,
  WeaveEraserToolAction,
  WeaveBrushToolAction,
  WeaveFrameToolAction,
  WeaveImageToolAction,
  WeaveImagesToolAction,
  WeavePenToolAction,
  WeaveRectangleToolAction,
  WeaveEllipseToolAction,
  WeaveTextToolAction,
  WeaveStarToolAction,
  WeaveStrokeToolAction,
  WeaveRegularPolygonToolAction,
  WeaveZoomOutToolAction,
  WeaveZoomInToolAction,
  WeaveFitToScreenToolAction,
  WeaveFitToSelectionToolAction,
  WeaveAlignNodesToolAction,
  WeaveCommentToolAction,
  WeaveExportNodesToolAction,
  WeaveVideoToolAction,
  WeaveMeasureToolAction,
  WeaveConnectorToolAction,
} from "@inditextech/weave-sdk";
import { type WeaveUser } from "@inditextech/weave-types";
import { ColorTokenToolAction } from "../../actions/color-token-tool/color-token-tool";
import { ImageTemplateToolAction } from "../../actions/image-template-tool/image-template-tool";
import { MaskToolAction } from "../../actions/mask-tool/mask-tool";
import { FuzzyMaskToolAction } from "../../actions/fuzzy-mask-tool/fuzzy-mask-tool";
import { MaskEraserToolAction } from "../../actions/mask-eraser-tool/mask-eraser-tool";
import { getContrastTextColor, stringToColor } from "@/lib/utils";
import { ThreadEntity } from "../../room-components/hooks/types";

export const ACTIONS = (getUser: () => WeaveUser) => [
  new WeaveMoveToolAction(),
  new WeaveSelectionToolAction(),
  new WeaveEraserToolAction(),
  new WeaveRectangleToolAction(),
  new WeaveEllipseToolAction(),
  new WeavePenToolAction(),
  new WeaveBrushToolAction(),
  new WeaveImageToolAction(),
  new WeaveImagesToolAction(),
  new WeaveFrameToolAction(),
  new WeaveStarToolAction(),
  new WeaveStrokeToolAction(),
  new WeaveRegularPolygonToolAction(),
  new ColorTokenToolAction(),
  new ImageTemplateToolAction(),
  new WeaveTextToolAction(),
  new WeaveVideoToolAction(),
  new WeaveConnectorToolAction(),
  new WeaveZoomOutToolAction(),
  new WeaveZoomInToolAction(),
  new WeaveFitToScreenToolAction(),
  new WeaveFitToSelectionToolAction(),
  new WeaveAlignNodesToolAction(),
  new WeaveExportNodesToolAction(),
  new WeaveMeasureToolAction(),
  new MaskToolAction(),
  new FuzzyMaskToolAction(),
  new MaskEraserToolAction(),
  new WeaveCommentToolAction({
    config: {
      style: {
        cursor: {
          add: "url(/cursors/message-square-plus.svg) 0 20, crosshair",
          block: "url(/cursors/message-square-off.svg) 0 20, not-allowed",
        },
      },
      model: {
        getCreateModel: () => {
          const createDate = new Date();

          return {
            userMetadata: getUser(),
            createdAt: createDate,
            updatedAt: createDate,
          } as Partial<ThreadEntity>;
        },
      },
      getUser,
      getUserBackgroundColor: (user: WeaveUser) =>
        stringToColor(user?.name ?? "#000000"),
      getUserForegroundColor: (user: WeaveUser) => {
        const bgColor = stringToColor(user?.name ?? "#ffffff");
        return getContrastTextColor(bgColor);
      },
    },
  }),
];
