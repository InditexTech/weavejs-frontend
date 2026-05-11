// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

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
  WeaveNodesSnappingPlugin,
  WeaveCommentsRendererPlugin,
  // WeaveStageMinimapPlugin,
  WeaveNodesMultiSelectionFeedbackPlugin,
  WeaveStageKeyboardMovePlugin,
  WEAVE_FRAME_NODE_TYPE,
  WEAVE_IMAGE_NODE_TYPE,
  WEAVE_STROKE_SINGLE_NODE_TYPE,
  Weave,
  GUIDE_KIND,
  GUIDE_ORIENTATION,
} from "@inditextech/weave-sdk";
import {
  WEAVE_EXPORT_RETURN_FORMAT,
  WeaveElementInstance,
  type WeaveUser,
} from "@inditextech/weave-types";
import { getContrastTextColor, stringToColor } from "@/lib/utils";
import { ThreadEntity } from "../../room-components/hooks/types";
import { COLOR_TOKEN_ACTION_NAME } from "../../actions/color-token-tool/constants";
import { OPERATIONS_MAP } from "./constants";
import { ExportAreaReferencePlugin } from "@/components/plugins/export-area-reference/export-area-reference";
import { EXPORT_AREA_SIZES } from "@/components/room-components/reference-area-size-selector";
import { EXPORT_AREA_REFERENCE_PLUGIN_KEY } from "@/components/plugins/export-area-reference/constants";

export const PLUGINS = (getUser: () => WeaveUser) => [
  new WeaveStageGridPlugin({
    config: {
      gridColor: "#b3b3b3",
      gridMajorColor: "#b3b3b3",
      gridOriginColor: "#ff746c",
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
        ignoreStroke: false,
        padding: 0,
        borderStrokeWidth: 2,
        borderStroke: "#1a1aff",
      },
      hover: {
        ignoreStroke: false,
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
  new WeaveNodesSnappingPlugin({
    config: {
      getStaticGuides: ({
        instance,
        containerId,
      }: {
        instance: Weave;
        containerId: string;
      }) => {
        if (!instance) {
          return [];
        }

        if (containerId === instance.getMainLayer()?.id()) {
          const stage = instance.getStage();
          const exportAreaReferencePlugin = instance.getPlugin(
            EXPORT_AREA_REFERENCE_PLUGIN_KEY,
          ) as ExportAreaReferencePlugin;

          if (exportAreaReferencePlugin) {
            return exportAreaReferencePlugin.getExportAreaGuides(stage);
          }
        }

        if (containerId !== instance.getMainLayer()?.id()) {
          const stage = instance.getStage();
          const node = stage.findOne(`#${containerId}`);

          if (node && node.getAttrs().containerId) {
            const rectStage = node.getClientRect({
              relativeTo: stage,
            });

            return [
              {
                orientation: GUIDE_ORIENTATION.VERTICAL,
                value: 0,
                kind: GUIDE_KIND.STATIC,
                guideId: `frame-${node.id()}-vertical-start`,
                containerId: node.id(),
              },
              {
                orientation: GUIDE_ORIENTATION.VERTICAL,
                value: rectStage.width / 2,
                kind: GUIDE_KIND.STATIC,
                guideId: `frame-${node.id()}-vertical-middle`,
                containerId: node.id(),
              },
              {
                orientation: GUIDE_ORIENTATION.VERTICAL,
                value: rectStage.width,
                kind: GUIDE_KIND.STATIC,
                guideId: `frame-${node.id()}-vertical-end`,
                containerId: node.id(),
              },
              {
                orientation: GUIDE_ORIENTATION.HORIZONTAL,
                value: 0,
                kind: GUIDE_KIND.STATIC,
                guideId: `frame-${node.id()}-horizontal-start`,
                containerId: node.id(),
              },
              {
                orientation: GUIDE_ORIENTATION.HORIZONTAL,
                value: rectStage.height / 2,
                kind: GUIDE_KIND.STATIC,
                guideId: `frame-${node.id()}-horizontal-middle`,
                containerId: node.id(),
              },
              {
                orientation: GUIDE_ORIENTATION.HORIZONTAL,
                value: rectStage.height,
                kind: GUIDE_KIND.STATIC,
                guideId: `frame-${node.id()}-horizontal-end`,
                containerId: node.id(),
              },
            ];
          }
        }

        return [];
      },
      persistence: {
        enabled: true,
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
    getImageBase64: async (instance, nodes) => {
      try {
        const url = (await instance.exportNodes(
          nodes as WeaveElementInstance[],
          (nodes: Konva.Node[]) => nodes,
          {
            format: "image/png",
            padding: 0,
            pixelRatio: 1,
          },
          WEAVE_EXPORT_RETURN_FORMAT.DATA_URL,
        )) as string;

        return url;
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
  //     width: 300,
  //     fitToContentPadding: 5,
  //   },
  // }),
  new WeaveStageKeyboardMovePlugin({
    config: {
      movementDelta: 0.5,
      shiftMovementDelta: 10,
    },
  }),
  new ExportAreaReferencePlugin({
    config: {
      sizes: EXPORT_AREA_SIZES,
      initialSize: "4K",
    },
  }),
];
