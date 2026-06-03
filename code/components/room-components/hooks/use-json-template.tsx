// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Weave } from "@inditextech/weave-sdk";
import { BoundingBox, WeaveSelection } from "@inditextech/weave-types";
import { useWeave } from "@inditextech/weave-react";
import Konva from "konva";
import { cn } from "@/lib/utils";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractNodesMetadata(template: any, filter: string[] = []): any {
  const templateNodesMetadata = [];

  for (const node of template.nodes) {
    const nodeMetadata = {
      id: node.id,
      kind: node.kind,
      editable: node.editable,
    };

    if (node.children) {
      templateNodesMetadata.push(
        ...extractNodesMetadata({ nodes: node.children }, filter),
      );
    }

    if (filter.length === 0 || filter.includes(node.kind)) {
      templateNodesMetadata.push(nodeMetadata);
    }
  }

  return templateNodesMetadata;
}

function nodeDefaults(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaults: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: Record<string, any>,
) {
  defaults[node.id] = {
    ...defaults[node.id],
    nodeId: node.id,
    kind: node.kind,
    properties: {
      ...node.defaultProperties,
      ...(parameters[node.id] && { ...parameters[node.id]?.properties }),
    },
  };

  if (
    Object.keys(defaults[node.id].properties).length === 0 &&
    ["image", "text"].includes(node.kind)
  ) {
    delete defaults[node.id];
  }

  if (node.children) {
    for (const childNode of node.children) {
      nodeDefaults(defaults, childNode, parameters);
    }
  }
}

function templateSetDefaults(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const defaults: Record<string, any> = {};

  for (const node of template.nodes) {
    nodeDefaults(defaults, node, parameters);
  }

  return defaults;
}

function defineScale(
  nodeSize: { width: number; height: number },
  parentSize: { width: number; height: number },
) {
  const padding = 20;
  const scaleX = (parentSize.width - 2 * padding) / nodeSize.width;
  const scaleY = (parentSize.height - 2 * padding) / nodeSize.height;
  return Math.min(scaleX, scaleY);
}

function nodeToHTML(
  scale: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: Record<string, any>,
  selectedNode: string | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (params: any) => void,
  params: {
    readOnly: boolean;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  switch (node.kind) {
    case "frame": {
      return (
        <div
          key={node.id}
          style={{
            width: node.width,
            height: node.height,
            position: "absolute",
            top: node.y,
            left: node.x,
            background: "#ffffff",
          }}
        >
          {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            node.children.map((childNode: any) =>
              nodeToHTML(
                scale,
                childNode,
                parameters,
                selectedNode,
                action,
                params,
              ),
            )
          }
        </div>
      );
    }

    case "image": {
      if (
        parameters[node.id] &&
        parameters[node.id]?.properties?.image?.source
      ) {
        return (
          <img
            role="button"
            key={node.id}
            src={parameters[node.id].properties.image.source}
            onClick={
              !params.readOnly
                ? () => {
                    action(node.id);
                  }
                : undefined
            }
            className={cn({
              ["cursor-default"]: params.readOnly,
              ["cursor-pointer hover:ring-4 hover:ring-blue-500"]:
                !params.readOnly,
              ["ring-4 ring-red-500"]:
                selectedNode === node.id && !params.readOnly,
            })}
            style={{
              width: node.width,
              height: node.height,
              position: "absolute",
              top: node.y,
              left: node.x,
              background: !params.readOnly ? "#333333" : "transparent",
              objectFit: parameters[node.id].properties.fit,
            }}
          />
        );
      }

      if (params.readOnly) {
        return null;
      }

      return (
        <div
          role="button"
          key={node.id}
          onClick={() => {
            action(node.id);
          }}
          className={cn("cursor-pointer hover:ring-4 hover:ring-blue-500", {
            ["ring-4 ring-red-500"]: selectedNode === node.id,
          })}
          style={{
            width: node.width,
            height: node.height,
            position: "absolute",
            top: node.y,
            left: node.x,
            background: "#333333",
            cursor: "pointer",
          }}
        />
      );
    }

    case "text": {
      let textToRender = node.defaultProperties.text;
      if (parameters[node.id]) {
        textToRender = parameters[node.id].properties.text || textToRender;
      }

      return (
        <div
          role="button"
          key={node.id}
          onClick={() => {
            action(node.id);
          }}
          className={cn("hover:ring-4 hover:ring-blue-500", {
            ["ring-4 ring-red-500"]: selectedNode === node.id,
          })}
          style={{
            width: node.width,
            height: node.height,
            position: "absolute",
            fontFamily: node.defaultProperties.fontFamily,
            fontSize: node.defaultProperties.fontSize,
            textAlign: node.defaultProperties.align,
            verticalAlign: node.defaultProperties.verticalAlign,
            color: node.defaultProperties.fill,
            top: node.y,
            left: node.x,
            lineHeight: 1,
            cursor: "pointer",
          }}
        >
          {textToRender}
        </div>
      );
    }

    default: {
      return <div key={node.id}>{`Unknown node kind: ${node.kind}`}</div>;
    }
  }
}

function templateToHTMLRepresentation(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: any,
  parentSize: { width: number; height: number },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: Record<string, any>,
  selectedNode: string | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (params: any) => void,
  params: {
    readOnly: boolean;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const structure = [];

  const maxSize = { width: -Infinity, height: -Infinity };

  if (template.nodes.length === 0) {
    return { structure: [], size: { width: 0, height: 0 } };
  }

  for (const node of template.nodes) {
    maxSize.width = Math.max(maxSize.width, node.x + node.width);
    maxSize.height = Math.max(maxSize.height, node.y + node.height);
  }

  const scale = defineScale(maxSize, parentSize);

  for (const node of template.nodes) {
    structure.push(
      nodeToHTML(scale, node, parameters, selectedNode, action, params),
    );
    maxSize.width = Math.max(maxSize.width, node.x + node.width);
    maxSize.height = Math.max(maxSize.height, node.y + node.height);
  }

  return { structure, scale, size: maxSize };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findNodeById(template: any, nodeId: string): any | null {
  for (const node of template.nodes) {
    if (node.id === nodeId) {
      return node;
    }

    if (node.children) {
      const foundInChildren = findNodeById({ nodes: node.children }, nodeId);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
  }

  return null;
}

const mapNode = (
  instance: Weave,
  node: Konva.Node,
  topLeft: Konva.Vector2d,
  relativeTo: Konva.Container,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  const nodeType = node.getAttrs().nodeType;

  const boundingBox: BoundingBox = node.getClientRect({
    skipStroke: true,
    relativeTo,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeHandler = instance.getNodeHandler<any>(nodeType);

  if (!nodeHandler) {
    throw new Error(`No node handler found for node type ${nodeType}`);
  }

  const nodeSerialized = nodeHandler.serialize(node);

  return {
    ...nodeSerialized,
    props: {
      ...nodeSerialized.props,
      x: Number((boundingBox.x - topLeft.x).toFixed(6)),
      y: Number((boundingBox.y - topLeft.y).toFixed(6)),
    },
  };
};

const mapImageNode = (
  instance: Weave,
  node: Konva.Node,
  topLeft: Konva.Vector2d,
  relativeTo: Konva.Container,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  const nodeType = node.getAttrs().nodeType;

  const boundingBox: BoundingBox = node.getClientRect({
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
        x: Number((boundingBox.x - topLeft.x).toFixed(6)),
        y: Number((boundingBox.y - topLeft.y).toFixed(6)),
        width:
          Number(boundingBox.width.toFixed(6)) -
          node.getAttrs().borderWidth * 2,
        height:
          Number(boundingBox.height.toFixed(6)) -
          node.getAttrs().borderWidth * 2,
        kind: "frame",
        children: nodes.map((childNode) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          mapImageNode(
            instance,
            childNode,
            { x: 0, y: 0 },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            frameContainer as any,
          ),
        ),
        defaultProperties: {
          name: "",
          width:
            Number(boundingBox.width.toFixed(6)) -
            node.getAttrs().borderWidth * 2,
          height:
            Number(boundingBox.height.toFixed(6)) -
            node.getAttrs().borderWidth * 2,
        },
        editable: false,
        optional: false,
      };
    }

    case "image": {
      return {
        id: node.id(),
        x: Number((boundingBox.x - topLeft.x).toFixed(6)),
        y: Number((boundingBox.y - topLeft.y).toFixed(6)),
        width:
          Number(boundingBox.width.toFixed(6)) -
          node.getAttrs().strokeWidth * 2,
        height:
          Number(boundingBox.height.toFixed(6)) -
          node.getAttrs().strokeWidth * 2,
        kind: "image",
        editable: true,
        optional: true,
      };
    }

    case "text": {
      return {
        id: node.id(),
        x: Number((boundingBox.x - topLeft.x).toFixed(6)),
        y: Number((boundingBox.y - topLeft.y).toFixed(6)),
        width:
          Number(boundingBox.width.toFixed(6)) -
          node.getAttrs().strokeWidth * 2,
        height:
          Number(boundingBox.height.toFixed(6)) -
          node.getAttrs().strokeWidth * 2,
        kind: "text",
        defaultProperties: {
          fontFamily: node.getAttrs().fontFamily,
          fontSize: node.getAttrs().fontSize,
          align: node.getAttrs().align,
          verticalAlign: node.getAttrs().verticalAlign,
          fill: node.getAttrs().fill,
          layout: "smart",
          text: node.getAttrs().text,
        },
        editable: true,
        optional: true,
      };
    }

    default: {
      return {
        id: node.id(),
        x: Number((boundingBox.x - topLeft.x).toFixed(6)),
        y: Number((boundingBox.y - topLeft.y).toFixed(6)),
        width: Number(boundingBox.width.toFixed(6)),
        height: Number(boundingBox.height.toFixed(6)),
        kind: nodeType,
        editable: false,
        optional: false,
      };
    }
  }
};

export const useJsonTemplate = () => {
  const instance = useWeave((state) => state.instance);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getNodeMetadata = React.useCallback((template: any, nodeId: string) => {
    return findNodeById(template, nodeId);
  }, []);

  const getTemplateToHTML = React.useCallback(
    (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      template: any,
      parentSize: { width: number; height: number },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parameters: Record<string, any>,
      selectedNode: string | null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      action: (params: any) => void,
      params: {
        readOnly: boolean;
      },
    ) => {
      return templateToHTMLRepresentation(
        template,
        parentSize,
        parameters,
        selectedNode,
        action,
        params,
      );
    },
    [],
  );

  const setupTemplateDefaults = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (template: any, parameters: Record<string, any>) => {
      return templateSetDefaults(template, parameters);
    },
    [],
  );

  const getTemplateNodesMetadata = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (template: any, filter: string[] = []) => {
      return extractNodesMetadata(template, filter);
    },
    [],
  );

  const generateTemplate = React.useCallback(
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

      return mappedNodes;
    },
    [instance],
  );

  const generateImageTemplate = React.useCallback(
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
          mapImageNode(
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
    setupTemplateDefaults,
    getNodeMetadata,
    getTemplateToHTML,
    getTemplateNodesMetadata,
    generateTemplate,
    generateImageTemplate,
  };
};
