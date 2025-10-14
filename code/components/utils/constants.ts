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
  WeaveFitToScreenToolAction,
  WeaveFitToSelectionToolAction,
  WeaveAlignNodesToolAction,
  WeaveCommentToolAction,
  WeaveExportNodesToolAction,
  WeaveVideoToolAction,
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
  WeaveVideoNode,
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
  WeaveStageKeyboardMovePlugin,
  WeaveCommentNodeCreateAction,
  WeaveCommentNodeViewAction,
  WEAVE_COMMENT_STATUS,
} from "@inditextech/weave-sdk";
import {
  WeaveElementInstance,
  WeaveFont,
  type WeaveUser,
} from "@inditextech/weave-types";
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

const FONTS = async (): Promise<WeaveFont[]> => {
  const interRegular = new FontFace("Inter", "url(/fonts/inter-regular.ttf)", {
    weight: "400",
    style: "normal",
  });
  await interRegular.load();
  document.fonts.add(interRegular);

  const interBold = new FontFace("Inter", "url(/fonts/inter-bold.ttf)", {
    weight: "700",
    style: "normal",
  });
  await interBold.load();
  document.fonts.add(interBold);

  const interItalic = new FontFace("Inter", "url(/fonts/inter-italic.ttf)", {
    weight: "400",
    style: "italic",
  });
  await interItalic.load();
  document.fonts.add(interItalic);

  const interItalicBold = new FontFace(
    "Inter",
    "url(/fonts/inter-italic-bold.ttf)",
    { weight: "700", style: "italic" }
  );
  await interItalicBold.load();
  document.fonts.add(interItalicBold);

  const sansitaRegular = new FontFace(
    "Sansita",
    "url(/fonts/sansita-regular.ttf)",
    { weight: "400", style: "normal" }
  );
  await sansitaRegular.load();
  document.fonts.add(sansitaRegular);

  const sansitaBold = new FontFace("Sansita", "url(/fonts/sansita-bold.ttf)", {
    weight: "700",
    style: "normal",
  });
  await sansitaBold.load();
  document.fonts.add(sansitaBold);

  return [
    {
      id: "Inter",
      name: `Inter, sans-serif`,
      offsetY: -1.4,
    },
    {
      id: "Sansita",
      name: `Sansita, sans-serif`,
      offsetY: -1.6,
    },
    {
      id: "Arial",
      name: "Arial, sans-serif",
      offsetY: -1.6,
    },
    {
      id: "Helvetica",
      name: "Helvetica, sans-serif",
      offsetY: -1,
    },
    {
      id: "TimesNewRoman",
      name: '"Times New Roman", serif',
      offsetY: -1.6,
    },
    {
      id: "Times",
      name: "Times, serif",
      offsetY: -1.6,
    },
    {
      id: "CourierNew",
      name: '"Courier New", monospace',
    },
    {
      id: "Courier",
      name: "Courier, monospace",
      offsetY: -1.2,
    },
    {
      id: "Verdana",
      name: "Verdana, sans-serif",
      offsetY: -2.2,
    },
    {
      id: "Georgia",
      name: "Georgia, serif",
      offsetY: -1.6,
    },
    {
      id: "Palatino",
      name: "Palatino, serif",
      offsetY: -0.8,
    },
    {
      id: "Garamond",
      name: "Garamond, serif",
      offsetY: -1.6,
    },
    {
      id: "Bookman",
      name: "Bookman, serif",
      offsetY: -1.6,
    },
    {
      id: "ComicSansMS",
      name: '"Comic Sans MS", cursive',
      offsetY: -3.6,
    },
    {
      id: "TrebuchetMS",
      name: '"Trebuchet MS", sans-serif',
      offsetY: -1.6,
    },
    {
      id: "ArialBlack",
      name: '"Arial Black", sans-serif',
      offsetY: -2.4,
    },
    {
      id: "Impact",
      name: "Impact, sans-serif",
      offsetY: -0.6,
    },
  ];
};

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
      fontFamily: "'Inter', sans-serif",
      fontStyle: "normal",
      fontSize: 14,
      borderColor: "#757575",
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
            fontFamily: "'Inter', sans-serif",
          },
        },
        expanded: {
          userName: {
            fontFamily: "'Inter', sans-serif",
          },
          date: {
            fontFamily: "'Inter', sans-serif",
          },
          content: {
            fontFamily: "'Inter', sans-serif",
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
  new WeaveVideoNode({
    config: {
      style: {
        track: {
          resetOnEnd: true,
          onlyOnHover: false,
        },
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
          fontFamily: "'Inter', sans-serif",
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
      fitToContentPadding: 5,
    },
  }),
  new WeaveStageKeyboardMovePlugin({
    config: {
      movementDelta: 5,
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
  new WeaveVideoToolAction(),
  new WeaveZoomOutToolAction(),
  new WeaveZoomInToolAction(),
  new WeaveFitToScreenToolAction(),
  new WeaveFitToSelectionToolAction(),
  new WeaveAlignNodesToolAction(),
  new WeaveExportNodesToolAction(),
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
