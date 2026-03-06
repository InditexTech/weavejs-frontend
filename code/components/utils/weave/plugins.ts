// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import Konva from "konva";
import {
  WeaveStageGridPlugin,
  WeaveNodesSelectionPlugin,
  WeaveStagePanningPlugin,
  WeaveStageResizePlugin,
  WeaveStageZoomPlugin,
  WeaveConnectedUsersPlugin,
  WeaveUsersPointersPlugin,
  WeaveUsersPresencePlugin,
  WeaveUsersSelectionPlugin,
  WeaveStageDropAreaPlugin,
  WeaveCopyPasteNodesPlugin,
  WeaveContextMenuPlugin,
  WeaveNodesEdgeSnappingPlugin,
  // WeaveNodesDistanceSnappingPlugin,
  WeaveCommentsRendererPlugin,
  // WeaveStageMinimapPlugin,
  WeaveNodesMultiSelectionFeedbackPlugin,
  WeaveStageKeyboardMovePlugin,
  WEAVE_FRAME_NODE_TYPE,
  WEAVE_IMAGE_NODE_TYPE,
  WEAVE_STROKE_SINGLE_NODE_TYPE,
} from "@inditextech/weave-sdk";
import { type WeaveUser } from "@inditextech/weave-types";
import { getContrastTextColor, stringToColor } from "@/lib/utils";
import { ThreadEntity } from "../../room-components/hooks/types";
import { getImageBase64 } from "./../images";
import { COLOR_TOKEN_ACTION_NAME } from "../../actions/color-token-tool/constants";
import { OPERATIONS_MAP } from "./constants";

export const PLUGINS = (getUser: () => WeaveUser) => [
  new WeaveStageGridPlugin({
    config: {
      gridColor: "rgba(0,0,0,0.3)",
      gridOriginColor: "rgba(255,0,0,0.5)",
    },
  }),
  new WeaveStagePanningPlugin(),
  new WeaveStageResizePlugin(),
  new WeaveStageZoomPlugin({
    config: {
      zoomSteps: [
        0.01, 0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 1, 1.25, 1.5, 1.75, 2, 3, 4, 6,
        8, 10,
      ],
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
            (node) => node.getAttrs().nodeType === COLOR_TOKEN_ACTION_NAME,
          );

          const containsFrame = nodes.some(
            (node) => node.getAttrs().nodeType === WEAVE_FRAME_NODE_TYPE,
          );

          if (containsColorToken || containsFrame) {
            return {
              resizeEnabled: false,
              rotateEnabled: false,
              enabledAnchors: [],
            };
          }

          const containsArrow = nodes.some(
            (node) =>
              node.getAttrs().nodeType === WEAVE_STROKE_SINGLE_NODE_TYPE,
          );

          if (containsArrow) {
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

          const containsImage = nodes.some(
            (node) => node.getAttrs().nodeType === WEAVE_IMAGE_NODE_TYPE,
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
  // new WeaveNodesDistanceSnappingPlugin({
  //   config: {
  //     ui: {
  //       label: {
  //         fontSize: 12,
  //         fontFamily: "'Inter', sans-serif",
  //       },
  //     },
  //   },
  // }),
  new WeaveStageDropAreaPlugin(),
  new WeaveCopyPasteNodesPlugin({
    config: {
      paddingOnPaste: {
        enabled: true,
        paddingX: 20,
        paddingY: 20,
      },
    },
    getImageBase64: async (instance, nodes) => {
      try {
        const res = await getImageBase64({
          instance: instance,
          nodes: nodes.map((node) => node.getAttrs().id ?? ""),
          options: { format: "image/png", padding: 0, pixelRatio: 1 },
        });
        return res.url;
      } catch (error) {
        console.error("Error getting image base64:", error);
        throw error;
      }
    },
  }),
  new WeaveConnectedUsersPlugin({
    config: {
      getUser,
    },
  }),
  new WeaveUsersPointersPlugin({
    config: {
      getOperationName: (operation: string) =>
        OPERATIONS_MAP[operation] ?? operation,
      getUser,
      getUserBackgroundColor: (user: WeaveUser) =>
        stringToColor(user?.name ?? "#000000"),
      getUserForegroundColor: (user: WeaveUser) => {
        const bgColor = stringToColor(user?.name ?? "#000000");
        return getContrastTextColor(bgColor);
      },
    },
  }),
  new WeaveUsersPresencePlugin({
    config: {
      getUser,
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
  new WeaveNodesMultiSelectionFeedbackPlugin(),
  // new WeaveStageMinimapPlugin({
  //   config: {
  //     getContainer: () => {
  //       return document?.getElementById("minimap") as HTMLElement;
  //     },
  //     id: "weave_stage_minimap",
  //     width: window.innerWidth * 0.2,
  //     fitToContentPadding: 5,
  //   },
  // }),
  new WeaveStageKeyboardMovePlugin({
    config: {
      movementDelta: 5,
    },
  }),
];
