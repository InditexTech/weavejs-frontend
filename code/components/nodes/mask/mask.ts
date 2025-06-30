// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import Konva from "konva";
import {
  WEAVE_DEFAULT_TRANSFORM_PROPERTIES,
  type WeaveElementAttributes,
  type WeaveElementInstance,
} from "@inditextech/weave-types";
import { WeaveNode, WeaveNodesSelectionPlugin } from "@inditextech/weave-sdk";
import { MASK_NODE_TYPE } from "./constants";
import type { MaskNodeParams, MaskProperties } from "./types";

export class MaskNode extends WeaveNode {
  private config: MaskProperties;
  protected nodeType: string = MASK_NODE_TYPE;

  constructor(params?: MaskNodeParams) {
    super();

    const { config } = params ?? {};

    this.config = {
      transform: {
        ...WEAVE_DEFAULT_TRANSFORM_PROPERTIES,
        ...config?.transform,
      },
    };
  }

  onRender(props: WeaveElementAttributes): WeaveElementInstance {
    const line = new Konva.Line({
      ...props,
      nodeType: "mask",
      name: "node",
    });

    this.setupDefaultNodeAugmentation(line);

    line.getTransformerProperties = () => {
      return this.config.transform;
    };

    this.setupDefaultNodeEvents(line);

    return line;
  }

  onUpdate(
    nodeInstance: WeaveElementInstance,
    nextProps: WeaveElementAttributes
  ): void {
    nodeInstance.setAttrs({
      ...nextProps,
    });

    const nodesSelectionPlugin =
      this.instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");

    if (nodesSelectionPlugin) {
      nodesSelectionPlugin.getTransformer().forceUpdate();
    }
  }

  protected scaleReset(node: Konva.Node): void {
    // for lines, adjust points to scale
    if (node.getAttrs().nodeType === "mask") {
      const lineNode = node as Konva.Line;
      const oldPoints = lineNode.points();
      const newPoints = [];
      for (let i = 0; i < oldPoints.length / 2; i++) {
        const point = {
          x: oldPoints[i * 2] * lineNode.scaleX(),
          y: oldPoints[i * 2 + 1] * lineNode.scaleY(),
        };
        newPoints.push(point.x, point.y);
      }
      lineNode.points(newPoints);
    }

    node.width(Math.max(5, node.width() * node.scaleX()));
    node.height(Math.max(5, node.height() * node.scaleY()));

    // reset scale to 1
    node.scaleX(1);
    node.scaleY(1);
  }
}
