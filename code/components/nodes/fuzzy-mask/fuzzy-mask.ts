// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { WeaveNode } from "@inditextech/weave-sdk";
import {
  WEAVE_DEFAULT_TRANSFORM_PROPERTIES,
  WeaveElementAttributes,
  WeaveElementInstance,
} from "@inditextech/weave-types";
import Konva from "konva";
import {
  FuzzyMaskCircle,
  FuzzyMaskProperties,
  FuzzyMaskNodeParams,
} from "./types";

export const FUZZY_MASK_NODE_TYPE = "fuzzy-mask";

export class FuzzyMaskNode extends WeaveNode {
  private config: FuzzyMaskProperties;
  protected nodeType = FUZZY_MASK_NODE_TYPE;

  constructor(params?: FuzzyMaskNodeParams) {
    super();

    const { config } = params ?? {};

    this.config = {
      transform: {
        ...WEAVE_DEFAULT_TRANSFORM_PROPERTIES,
        ...config?.transform,
      },
    };
  }

  getBoundingBox(attributes: WeaveElementAttributes) {
    const circles = attributes.circles as FuzzyMaskCircle[];

    if (circles.length === 0) {
      return { x: 0, y: 0, width: 1, height: 1 };
    }
    const minX = Math.min(...circles.map((c) => c.x - c.radius));
    const maxX = Math.max(...circles.map((c) => c.x + c.radius));
    const minY = Math.min(...circles.map((c) => c.y - c.radius));
    const maxY = Math.max(...circles.map((c) => c.y + c.radius));
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  onRender(props: WeaveElementAttributes) {
    const { id } = props;

    const { circles, fill, ...restProps } = props;
    delete restProps.zIndex;

    const maskGroup = new Konva.Group({
      id,
      nodeType: restProps.nodeType,
      circles,
      fill,
    });

    const boundingBox = this.getBoundingBox(props);

    const bgRect = new Konva.Rect({
      id: `${id}-bg`,
      name: "node",
      nodeId: id,
      fill: "transparent",
      x: boundingBox.x,
      y: boundingBox.y,
      width: boundingBox.width,
      height: boundingBox.height,
      draggable: false,
    });

    maskGroup.add(bgRect);

    const fuzzyMask = new Konva.Shape({
      ...restProps,
      id: `${id}-mask`,
      fill: fill,
      circles,
      sceneFunc: (ctx: CanvasRenderingContext2D, shape: Konva.Shape) => {
        ctx.beginPath();
        (shape.getAttrs().circles as FuzzyMaskCircle[]).forEach((circle) => {
          ctx.moveTo(circle.x + circle.radius, circle.y);
          ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        });
        ctx.closePath();

        ctx.fillStyle = shape.getAttrs().fill;
        ctx.fill();
      },
      draggable: false,
    });

    maskGroup.add(fuzzyMask);

    this.setupDefaultNodeAugmentation(maskGroup);

    maskGroup.getTransformerProperties = () => {
      return this.config.transform;
    };

    this.setupDefaultNodeEvents(maskGroup);

    return maskGroup;
  }

  onUpdate(
    nodeInstance: WeaveElementInstance,
    nextProps: WeaveElementAttributes
  ) {
    const { id } = nextProps;

    const nodeInstanceZIndex = nodeInstance.zIndex();
    nodeInstance.setAttrs({
      ...nextProps,
      zIndex: nodeInstanceZIndex,
    });

    const bg = this.instance.getStage().findOne(`#${id}-bg`);
    const boundingBox = this.getBoundingBox(nextProps);

    if (bg) {
      bg.setAttrs({
        x: boundingBox.x,
        y: boundingBox.y,
        width: boundingBox.width,
        height: boundingBox.height,
      });
    }

    const mask = this.instance.getStage().findOne(`#${id}-mask`);

    if (mask) {
      mask.setAttrs({
        circles: nextProps.circles,
      });
    }
  }
}
