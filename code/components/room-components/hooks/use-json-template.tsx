// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Weave } from "@inditextech/weave-sdk";
import { BoundingBox, WeaveSelection } from "@inditextech/weave-types";
import { useWeave } from "@inditextech/weave-react";
import Konva from "konva";

function getGroupTopLeft(instance: Weave, nodes: WeaveSelection[]) {
  if (!nodes.length) return null;

  const stage = instance.getStage();

  let minX = Infinity;
  let minY = Infinity;

  nodes.forEach((node) => {
    const rect = node.instance.getClientRect({ relativeTo: stage });
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
  });

  return { x: minX, y: minY };
}

export const useJsonTemplate = () => {
  const instance = useWeave((state) => state.instance);

  const generateJsonTemplate = React.useCallback(
    (nodes: WeaveSelection[]) => {
      if (!instance)
        throw new Error("Instance is required to generate JSON template", {
          cause: "NoInstance",
        });

      if (nodes.length === 0) {
        throw new Error("No nodes selected to generate JSON template", {
          cause: "NoNodesSelected",
        });
      }

      const topLeft = getGroupTopLeft(instance, nodes);

      const mappedNodes = [];
      for (const node of nodes) {
        mappedNodes.push(
          mapNode(
            instance,
            node.instance,
            topLeft ?? { x: 0, y: 0 },
            instance.getStage() as Konva.Container,
          ),
        );
      }

      return {
        version: "1.0",
        name: "test",
        nodes: mappedNodes,
      };
    },
    [instance],
  );

  return {
    generateJsonTemplate,
  };
};

const mapNode = (
  instance: Weave,
  node: Konva.Node,
  topLeft: Konva.Vector2d,
  relativeTo: Konva.Container,
) => {
  const nodeType = node.getAttrs().nodeType;

  const boundigBox: BoundingBox = node.getClientRect({
    skipStroke: true,
    relativeTo,
  });

  switch (nodeType) {
    case "frame": {
      const containerId = node.getAttrs().containerId;
      const frameContainer = (node as Konva.Group).findOne(`#${containerId}`);

      if (!frameContainer) {
        throw new Error(
          `Container with id ${containerId} not found for frame ${node.id()}`,
        );
      }

      const nodes = (frameContainer as Konva.Group).find(".node");

      return {
        id: node.id(),
        x: Number((boundigBox.x - topLeft.x).toFixed(6)),
        y: Number((boundigBox.y - topLeft.y).toFixed(6)),
        width:
          Number(boundigBox.width.toFixed(6)) - node.getAttrs().strokeWidth * 2,
        height:
          Number(boundigBox.height.toFixed(6)) -
          node.getAttrs().strokeWidth * 2,
        kind: "frame",
        children: nodes.map((childNode) =>
          mapNode(instance, childNode, { x: 0, y: 0 }, frameContainer),
        ),
        editable: true,
        optional: true,
      };
    }

    default: {
      return {
        id: node.id(),
        x: Number((boundigBox.x - topLeft.x).toFixed(6)),
        y: Number((boundigBox.y - topLeft.y).toFixed(6)),
        width: Number(boundigBox.width.toFixed(6)),
        height: Number(boundigBox.height.toFixed(6)),
        kind: nodeType === "rectangle" ? "image" : nodeType,
        editable: true,
        optional: true,
      };
    }
  }
};
