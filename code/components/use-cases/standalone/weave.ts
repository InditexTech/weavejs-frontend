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
  WeaveImageToolAction,
  WeaveLineToolAction,
  WeaveRectangleToolAction,
  WeaveEllipseToolAction,
  WeaveTextToolAction,
  WeaveArrowToolAction,
  WeaveZoomOutToolAction,
  WeaveZoomInToolAction,
  WeaveFitToScreenToolAction,
  WeaveFitToSelectionToolAction,
  WeaveCommentToolAction,
  WeaveExportNodesToolAction,
  WeaveMeasureToolAction,
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
  WeaveMeasureNode,
  WeaveRegularPolygonNode,
  WeaveFrameNode,
  WeaveStrokeNode,
  WeaveCommentNode,
  WeaveVideoNode,
  WeaveNodesSelectionPlugin,
  WeaveStagePanningPlugin,
  WeaveStageResizePlugin,
  WeaveStageZoomPlugin,
  WeaveCopyPasteNodesPlugin,
  WeaveContextMenuPlugin,
  WeaveCommentsRendererPlugin,
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
import { PantoneNode } from "@/components/nodes/pantone/pantone";
import { ColorTokenNode } from "@/components/nodes/color-token/color-token";
import { ImageTemplateNode } from "@/components/nodes/image-template/image-template";
import { WEAVE_TRANSFORMER_ANCHORS } from "@inditextech/weave-types";
import { getContrastTextColor, stringToColor } from "@/lib/utils";
import { getUserShort } from "@/components/utils/users";
import { ThreadEntity } from "@/components/room-components/hooks/types";
import { getImageBase64 } from "@/components/utils/images";
import {
  createCommentDOM,
  viewCommentDOM,
} from "./components/comment/comment-dom";

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

  const notoSansRegular = new FontFace(
    "NotoSansMono",
    "url(/fonts/NotoSansMono-Regular.ttf)",
    { weight: "400", style: "normal" }
  );
  await notoSansRegular.load();
  document.fonts.add(notoSansRegular);

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
      name: "Arial",
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
    {
      id: "NotoSansMono",
      name: "NotoSansMono, monospace",
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
  new WeaveMeasureNode(),
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
  new ImageTemplateNode(),
  new PantoneNode(),
];

const PLUGINS = (getUser: () => WeaveUser) => [
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
  new WeaveLineToolAction(),
  new WeaveBrushToolAction(),
  new WeaveImageToolAction(),
  new WeaveArrowToolAction(),
  new WeaveTextToolAction(),
  new WeaveZoomOutToolAction(),
  new WeaveZoomInToolAction(),
  new WeaveFitToScreenToolAction(),
  new WeaveFitToSelectionToolAction(),
  new WeaveExportNodesToolAction(),
  new WeaveMeasureToolAction(),
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
