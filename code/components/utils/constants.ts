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
  WeavePenToolAction,
  WeaveRectangleToolAction,
  WeaveEllipseToolAction,
  WeaveTextToolAction,
  WeaveStarToolAction,
  WeaveArrowToolAction,
  WeaveRegularPolygonToolAction,
  WeaveZoomOutToolAction,
  WeaveZoomInToolAction,
  WeaveExportNodesToolAction,
  WeaveExportStageToolAction,
  WeaveFitToScreenToolAction,
  WeaveFitToSelectionToolAction,
  WeaveAlignNodesToolAction,
  WeaveStageNode,
  WeaveLayerNode,
  WeaveGroupNode,
  WeaveRectangleNode,
  WeaveEllipseNode,
  WeaveLineNode,
  WeaveTextNode,
  WeaveImageNode,
  WeaveStarNode,
  WeaveArrowNode,
  WeaveRegularPolygonNode,
  WeaveFrameNode,
  WeaveStrokeNode,
  WeaveStageGridPlugin,
  WeaveNodesSelectionPlugin,
  WeaveStagePanningPlugin,
  WeaveStageResizePlugin,
  WeaveStageZoomPlugin,
  WeaveConnectedUsersPlugin,
  WeaveUsersPointersPlugin,
  WeaveUsersSelectionPlugin,
  WeaveStageDropAreaPlugin,
  WeaveCopyPasteNodesPlugin,
  WeaveContextMenuPlugin,
  WeaveNodesSnappingPlugin,
} from "@inditextech/weave-sdk";
import { type WeaveUser } from "@inditextech/weave-types";
import { Inter } from "next/font/google";
import { ColorTokenNode } from "@/components/nodes/color-token/color-token";
import { WEAVE_TRANSFORMER_ANCHORS } from "@inditextech/weave-types";
import { ColorTokenToolAction } from "../actions/color-token-tool/color-token-tool";
import { ImagesToolAction } from "../actions/images-tool/images-tool";
import { MaskToolAction } from "../actions/mask-tool/mask-tool";
import { FuzzyMaskToolAction } from "../actions/fuzzy-mask-tool/fuzzy-mask-tool";
import { MaskEraserToolAction } from "../actions/mask-eraser-tool/mask-eraser-tool";

const FONTS = [
  {
    id: "Inter",
    name: "Inter, sans-serif",
  },
  {
    id: "Arial",
    name: "Arial, sans-serif",
  },
  {
    id: "Helvetica",
    name: "Helvetica, sans-serif",
  },
  {
    id: "TimesNewRoman",
    name: "Times New Roman, serif",
  },
  {
    id: "Times",
    name: "Times, serif",
  },
  {
    id: "CourierNew",
    name: "Courier New, monospace",
  },
  {
    id: "Courier",
    name: "Courier, monospace",
  },
  {
    id: "Verdana",
    name: "Verdana, sans-serif",
  },
  {
    id: "Georgia",
    name: "Georgia, serif",
  },
  {
    id: "Palatino",
    name: "Palatino, serif",
  },
  {
    id: "Garamond",
    name: "Garamond, serif",
  },
  {
    id: "Bookman",
    name: "Bookman, serif",
  },
  {
    id: "ComicSansMS",
    name: "Comic Sans MS, cursive",
  },
  {
    id: "TrebuchetMS",
    name: "Trebuchet MS, sans-serif",
  },
  {
    id: "ArialBlack",
    name: "Arial Black, sans-serif",
  },
  {
    id: "Impact",
    name: "Impact, sans-serif",
  },
];

const inter = Inter({
  preload: true,
  variable: "--inter",
  subsets: ["latin"],
});

const NODES = () => [
  new WeaveStageNode(),
  new WeaveLayerNode(),
  new WeaveGroupNode(),
  new WeaveRectangleNode(),
  new WeaveEllipseNode(),
  new WeaveLineNode(),
  new WeaveStrokeNode(),
  new WeaveTextNode(),
  new WeaveImageNode({
    config: {
      transform: {
        enabledAnchors: [
          WEAVE_TRANSFORMER_ANCHORS.TOP_LEFT,
          WEAVE_TRANSFORMER_ANCHORS.TOP_RIGHT,
          WEAVE_TRANSFORMER_ANCHORS.BOTTOM_LEFT,
          WEAVE_TRANSFORMER_ANCHORS.BOTTOM_RIGHT,
        ],
        keepRatio: true,
      },
    },
  }),
  new WeaveStarNode(),
  new WeaveArrowNode(),
  new WeaveRegularPolygonNode(),
  new WeaveFrameNode({
    config: {
      fontFamily: inter.style.fontFamily,
      fontStyle: "normal",
      fontSize: 14,
      borderColor: "#9E9994",
      fontColor: "#757575",
      titleMargin: 5,
      transform: {
        rotateEnabled: false,
        resizeEnabled: false,
        enabledAnchors: [] as string[],
      },
    },
  }),
  new ColorTokenNode(),
];

const PLUGINS = (getUser: () => WeaveUser) => [
  new WeaveStageGridPlugin(),
  new WeaveStagePanningPlugin(),
  new WeaveStageResizePlugin(),
  new WeaveStageZoomPlugin({
    config: {
      zoomInertia: {
        friction: 0.9,
        mouseWheelStep: 0.01,
      },
    },
  }),
  new WeaveNodesSelectionPlugin({
    config: {
      selection: {
        ignoreStroke: true,
        padding: 0,
        borderStrokeWidth: 2,
        borderStroke: "#1a1aff",
      },
      hover: {
        ignoreStroke: true,
        padding: 0,
        borderStrokeWidth: 2,
        borderStroke: "#1a1aff",
      },
      selectionArea: {
        fill: "#1a1aff11",
        strokeWidth: 2,
        stroke: "#1a1aff",
        dash: [12, 4],
      },
      behaviors: {
        singleSelection: {
          enabled: true,
        },
        multipleSelection: {
          enabled: true,
        },
      },
    },
  }),
  new WeaveNodesSnappingPlugin(),
  new WeaveStageDropAreaPlugin(),
  new WeaveCopyPasteNodesPlugin(),
  new WeaveConnectedUsersPlugin({
    config: {
      getUser,
    },
  }),
  new WeaveUsersPointersPlugin({
    config: {
      getUser,
    },
  }),
  new WeaveUsersSelectionPlugin({
    config: {
      getUser,
    },
  }),
  new WeaveContextMenuPlugin({
    config: {
      xOffset: 10,
      yOffset: 10,
    },
  }),
];

const ACTIONS = () => [
  new WeaveMoveToolAction(),
  new WeaveSelectionToolAction(),
  new WeaveEraserToolAction(),
  new WeaveRectangleToolAction(),
  new WeaveEllipseToolAction(),
  new WeavePenToolAction(),
  new WeaveBrushToolAction(),
  new WeaveImageToolAction(),
  new WeaveFrameToolAction(),
  new WeaveStarToolAction(),
  new WeaveArrowToolAction(),
  new WeaveRegularPolygonToolAction(),
  new ColorTokenToolAction(),
  new WeaveTextToolAction(),
  new WeaveZoomOutToolAction(),
  new WeaveZoomInToolAction(),
  new WeaveFitToScreenToolAction(),
  new WeaveFitToSelectionToolAction(),
  new WeaveAlignNodesToolAction(),
  new WeaveExportNodesToolAction(),
  new WeaveExportStageToolAction(),
  new ImagesToolAction(),
  new MaskToolAction(),
  new FuzzyMaskToolAction(),
  new MaskEraserToolAction(),
];

export { FONTS, NODES, ACTIONS, PLUGINS };
