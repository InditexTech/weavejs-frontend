// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import Konva from "konva";
import { formatDistanceToNow } from "date-fns";
import {
  WeaveStageNode,
  WeaveLayerNode,
  WeaveGroupNode,
  WeaveRectangleNode,
  WeaveEllipseNode,
  WeaveTextNode,
  WeaveImageNode,
  WeaveStarNode,
  WeaveLineNode,
  WeaveRegularPolygonNode,
  WeaveFrameNode,
  WeaveStrokeNode,
  WeaveStrokeSingleNode,
  WeaveCommentNode,
  WeaveVideoNode,
  WeaveMeasureNode,
  WeaveConnectorNode,
  WeaveCommentNodeCreateAction,
  WeaveCommentNodeViewAction,
  WEAVE_COMMENT_STATUS,
} from "@inditextech/weave-sdk";
import { WeaveElementInstance } from "@inditextech/weave-types";
import { PantoneNode } from "@/components/nodes/pantone/pantone";
import { ColorTokenNode } from "@/components/nodes/color-token/color-token";
import { ImageTemplateNode } from "@/components/nodes/image-template/image-template";
import { WEAVE_TRANSFORMER_ANCHORS } from "@inditextech/weave-types";
import {
  createCommentDOM,
  viewCommentDOM,
} from "../../room-components/comment/comment-dom";
import { getUserShort } from "./../users";
import { ThreadEntity } from "../../room-components/hooks/types";
// import resources from "./resources/resources2.json";
import { BACKGROUND_COLOR } from "@/store/store";

const ENABLED_RESOURCES = false;

export const NODES = () => [
  new WeaveStageNode(),
  new WeaveLayerNode(),
  new WeaveGroupNode(),
  new WeaveRectangleNode(),
  new WeaveEllipseNode(),
  new WeaveLineNode(),
  new WeaveStrokeNode(),
  new WeaveStrokeSingleNode(),
  new WeaveTextNode({
    config: {
      outline: {
        enabled: true,
        color: BACKGROUND_COLOR.GRAY,
        width: 2,
      },
    },
  }),
  new WeaveImageNode({
    config: {
      style: {
        cursor: {
          loading: "url(/cursors/cloud-sync.svg) 16 16, wait",
        },
      },
      performance: {
        cache: {
          enabled: false,
          // pixelRatio: 2,
        },
      },
      transform: {
        enabledAnchors: [
          WEAVE_TRANSFORMER_ANCHORS.TOP_LEFT,
          WEAVE_TRANSFORMER_ANCHORS.TOP_RIGHT,
          WEAVE_TRANSFORMER_ANCHORS.BOTTOM_LEFT,
          WEAVE_TRANSFORMER_ANCHORS.BOTTOM_RIGHT,
        ],
        keepRatio: true,
      },
      useFallbackImage: true,
      urlTransformer: (
        url: string,
        //node?: Konva.Node
      ) => {
        if (!ENABLED_RESOURCES) {
          return url;
        }

        // let resourceId: string | null = null;
        // let resource = null;

        // if (node?.getAttrs().resourceId) {
        //   resourceId = node.getAttrs().resourceId;
        //   resource = resources.find((res) => res.resourceId === resourceId);
        // }

        // if (resource) {
        //   return resource.downloadUrl;
        // }

        return url;
      },
      onDblClick: (instance: WeaveImageNode, node: Konva.Group) => {
        instance.triggerCrop(node, { cmdCtrl: { triggered: false } });
      },
    },
  }),
  new WeaveStarNode(),
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
          action: WeaveCommentNodeCreateAction,
        ) => void,
      ) => {
        createCommentDOM({ ele, node, finish });
      },
      viewComment: async (
        ele: HTMLDivElement,
        node: WeaveElementInstance,
        finish: (
          node: WeaveElementInstance,
          content: string,
          action: WeaveCommentNodeViewAction,
        ) => void,
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
  new WeaveConnectorNode(),
  new WeaveMeasureNode(),
  new ColorTokenNode(),
  new ImageTemplateNode(),
  new PantoneNode(),
];
