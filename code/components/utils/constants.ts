// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import Konva from "konva";
import { formatDistanceToNow } from "date-fns";
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
  // WeaveExportNodesToolAction,
  // WeaveExportStageToolAction,
  WeaveFitToScreenToolAction,
  WeaveFitToSelectionToolAction,
  WeaveAlignNodesToolAction,
  WeaveCommentToolAction,
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
  WeaveCommentNode,
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
  WeaveNodesEdgeSnappingPlugin,
  WeaveNodesDistanceSnappingPlugin,
  WeaveCommentsRendererPlugin,
  WeaveStageMinimapPlugin,
  WeaveCommentNodeCreateAction,
  WeaveCommentNodeViewAction,
  WEAVE_COMMENT_STATUS,
} from "@inditextech/weave-sdk";
import { WeaveElementInstance, type WeaveUser } from "@inditextech/weave-types";
import { Inter } from "next/font/google";
import { ColorTokenNode } from "@/components/nodes/color-token/color-token";
import { WEAVE_TRANSFORMER_ANCHORS } from "@inditextech/weave-types";
import { ColorTokenToolAction } from "../actions/color-token-tool/color-token-tool";
import { ImagesToolAction } from "../actions/images-tool/images-tool";
import { MaskToolAction } from "../actions/mask-tool/mask-tool";
import { FuzzyMaskToolAction } from "../actions/fuzzy-mask-tool/fuzzy-mask-tool";
import { MaskEraserToolAction } from "../actions/mask-eraser-tool/mask-eraser-tool";
import { getContrastTextColor, stringToColor } from "@/lib/utils";
import {
  createCommentDOM,
  viewCommentDOM,
} from "../room-components/comment/comment-dom";
import { getUserShort } from "./users";
import { ThreadEntity } from "../room-components/hooks/types";

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
      onDblClick: (instance: WeaveImageNode, node: Konva.Group) => {
        instance.triggerCrop(node);
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
  new WeaveCommentNode<ThreadEntity>({
    config: {
      style: {
        contracted: {
          userName: {
            fontFamily: inter.style.fontFamily,
          },
        },
        expanded: {
          userName: {
            fontFamily: inter.style.fontFamily,
          },
          date: {
            fontFamily: inter.style.fontFamily,
          },
          content: {
            fontFamily: inter.style.fontFamily,
          },
        },
      },
      model: {
        getDate: (comment: ThreadEntity) => {
          return (comment.updatedAt as unknown as string) ?? "";
        },
        getId: (comment: ThreadEntity) => {
          return comment.threadId;
        },
        getUserId: (comment: ThreadEntity) => {
          return comment.userMetadata.name;
        },
        getStatus: (comment: ThreadEntity) => {
          return comment.status;
        },
        getUserShortName: (comment: ThreadEntity) => {
          return getUserShort(comment.userMetadata.name).toUpperCase();
        },
        getUserFullName: (comment: ThreadEntity) => {
          return comment.userMetadata.name;
        },
        canUserDrag: () => {
          return true;
        },
        getContent: (comment: ThreadEntity) => {
          return comment.content;
        },
        setMarkResolved: (comment: ThreadEntity) => {
          return { ...comment, status: WEAVE_COMMENT_STATUS.RESOLVED };
        },
        setContent: (comment: ThreadEntity, content: string) => {
          return { ...comment, content };
        },
      },
      formatDate: (date: string) => {
        return formatDistanceToNow(new Date(date).toISOString(), {
          addSuffix: true,
        });
      },
      createComment: async (
        ele: HTMLDivElement,
        node: WeaveElementInstance,
        finish: (
          node: WeaveElementInstance,
          content: string,
          action: WeaveCommentNodeCreateAction
        ) => void
      ) => {
        createCommentDOM({ ele, node, finish });
      },
      viewComment: async (
        ele: HTMLDivElement,
        node: WeaveElementInstance,
        finish: (
          node: WeaveElementInstance,
          content: string,
          action: WeaveCommentNodeViewAction
        ) => void
      ) => {
        viewCommentDOM({ ele, node, finish });
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
        onMultipleSelection: (nodes: Konva.Node[]) => {
          const containsColorToken = nodes.some(
            (node) => node.getAttrs().nodeType === "color-token"
          );

          const containsFrame = nodes.some(
            (node) => node.getAttrs().nodeType === "frame"
          );

          if (containsColorToken || containsFrame) {
            return {
              resizeEnabled: false,
              rotateEnabled: false,
              enabledAnchors: [],
            };
          }

          const containsImage = nodes.some(
            (node) => node.getAttrs().nodeType === "image"
          );

          if (containsImage) {
            return {
              resizeEnabled: true,
              rotateEnabled: true,
              enabledAnchors: [
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
              ],
            };
          }

          return {
            resizeEnabled: true,
            rotateEnabled: true,
            enabledAnchors: [
              "top-left",
              "top-center",
              "top-right",
              "middle-right",
              "middle-left",
              "bottom-left",
              "bottom-center",
              "bottom-right",
            ],
          };
        },
      },
    },
  }),
  new WeaveNodesEdgeSnappingPlugin(),
  new WeaveNodesDistanceSnappingPlugin({
    config: {
      ui: {
        label: {
          fontSize: 12,
          fontFamily: inter.style.fontFamily,
        },
      },
    },
  }),
  new WeaveStageDropAreaPlugin(),
  new WeaveCopyPasteNodesPlugin({
    config: {
      paddingOnPaste: {
        enabled: true,
        paddingX: 20,
        paddingY: 20,
      },
    },
  }),
  new WeaveConnectedUsersPlugin({
    config: {
      getUser,
    },
  }),
  new WeaveUsersPointersPlugin({
    config: {
      getUser,
      getUserBackgroundColor: (user: WeaveUser) =>
        stringToColor(user?.name ?? "#000000"),
      getUserForegroundColor: (user: WeaveUser) => {
        const bgColor = stringToColor(user?.name ?? "#ffffff");
        return getContrastTextColor(bgColor);
      },
    },
  }),
  new WeaveUsersSelectionPlugin({
    config: {
      getUser,
      getUserColor: (user: WeaveUser) => stringToColor(user?.name ?? "#000000"),
    },
  }),
  new WeaveContextMenuPlugin({
    config: {
      xOffset: 10,
      yOffset: 10,
    },
  }),
  new WeaveCommentsRendererPlugin({
    config: {
      model: {
        getId: (comment: ThreadEntity) => comment.threadId,
        getPosition: (comment: ThreadEntity) => ({
          x: comment.x,
          y: comment.y,
        }),
        getUser: (comment: ThreadEntity) => comment.userMetadata,
        getStatus: (comment: ThreadEntity) => comment.status,
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
  new WeaveStageMinimapPlugin({
    config: {
      getContainer: () => {
        return document?.getElementById("minimap") as HTMLElement;
      },
      id: "weave_stage_minimap",
      width: window.innerWidth * 0.2,
      fitToContentPadding: 40,
    },
  }),
];

const ACTIONS = (getUser: () => WeaveUser) => [
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
  // new WeaveExportNodesToolAction(),
  // new WeaveExportStageToolAction(),
  new ImagesToolAction(),
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

export { FONTS, NODES, ACTIONS, PLUGINS };
