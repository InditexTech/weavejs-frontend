// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import {
  containerOverCursor,
  getBoundingBox,
  Weave,
  WeaveNode,
  WeaveNodesSelectionPlugin,
  WeavePasteModel,
  WeaveStageGridPlugin,
} from "@inditextech/weave-sdk";
import { WeaveStateElement } from "@inditextech/weave-types";
import Konva from "konva";

const getNodesSelectionPlugin = (
  instance: Weave,
): WeaveNodesSelectionPlugin | undefined => {
  return instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
};

const getStageGridPlugin = (
  instance: Weave,
): WeaveStageGridPlugin | undefined => {
  return instance.getPlugin<WeaveStageGridPlugin>("stageGrid");
};

export const getSelectionAsTemplate = (
  instance: Weave,
): WeavePasteModel | undefined => {
  const stage = instance.getStage();

  stage.container().style.cursor = "default";
  stage.container().focus();

  const nodesSelectionPlugin = getNodesSelectionPlugin(instance);
  const selectedNodes = nodesSelectionPlugin?.getSelectedNodes();
  if (!selectedNodes || selectedNodes.length === 0) {
    return;
  }

  const box = getBoundingBox(selectedNodes, {
    relativeTo: stage,
  });

  const selectionTemplate: WeavePasteModel = {
    weaveInstanceId: instance.getId(),
    weave: {},
    weaveMinPoint: { x: 0, y: 0 },
  };

  for (const node of selectedNodes) {
    const nodeHandler = instance.getNodeHandler<WeaveNode>(
      node.getAttrs().nodeType,
    );

    if (!nodeHandler) {
      continue;
    }

    const parentNode = node.getParent();
    let parentId = parentNode?.getAttrs().id;
    if (parentNode?.getAttrs().nodeId) {
      const realParent = instance
        .getStage()
        .findOne(`#${parentNode.getAttrs().nodeId}`);
      if (realParent) {
        parentId = realParent.getAttrs().id;
      }
    }

    if (!parentId) {
      continue;
    }

    const serializedNode = nodeHandler.serialize(node);
    const nodeBox = node.getClientRect({ relativeTo: stage });

    selectionTemplate.weave[serializedNode.key ?? ""] = {
      element: serializedNode,
      posRelativeToSelection: {
        x: nodeBox.x - (box?.x ?? 0),
        y: nodeBox.y - (box?.y ?? 0),
      },
      containerId: parentId,
    };
  }

  return selectionTemplate;
};

const recursivelyUpdateKeys = (nodes: WeaveStateElement[]) => {
  for (const child of nodes) {
    const newNodeId = uuidv4();
    child.key = newNodeId;
    child.props.id = newNodeId;
    if (child.props.children) {
      recursivelyUpdateKeys(child.props.children);
    }
  }
};

export const setTemplateOnPosition = (
  instance: Weave,
  template: WeavePasteModel,
  position: Konva.Vector2d,
  relativePosition?: Konva.Vector2d,
) => {
  const stage = instance.getStage();
  const nodesToSelect = [];

  const container = containerOverCursor(instance, [], relativePosition);

  for (const element of Object.keys(template.weave)) {
    const node = template.weave[element].element;
    const posRelativeToSelection =
      template.weave[element].posRelativeToSelection;
    let containerId = template.weave[element].containerId;

    if (node.props.children) {
      recursivelyUpdateKeys(node.props.children);
    }

    const newNodeId = uuidv4();
    delete node.props.containerId;
    node.key = newNodeId;
    node.props.id = newNodeId;

    let localPos = position;

    if (!container) {
      containerId = instance.getMainLayer()?.getAttrs().id ?? "";

      const scale = stage.scaleX(); // assume uniform scale
      const stagePos = stage.position(); // stage position (pan)

      localPos = {
        x: (localPos.x - stagePos.x) / scale,
        y: (localPos.y - stagePos.y) / scale,
      };
    }
    if (container && container.getAttrs().nodeType === "frame") {
      containerId = container.getAttrs().id ?? "";

      localPos = container
        .getAbsoluteTransform()
        .copy()
        .invert()
        .point(position);
    }

    const nodeHandler = instance.getNodeHandler<WeaveNode>(
      node.props.nodeType ?? "",
    );

    if (nodeHandler) {
      const realOffset = nodeHandler.realOffset(node);

      node.props.x = localPos.x + realOffset.x + posRelativeToSelection.x;
      node.props.y = localPos.y + realOffset.y + posRelativeToSelection.y;
    }

    instance.addNode(node, containerId);

    const realNode = instance.getStage().findOne(`#${newNodeId}`);
    if (realNode) {
      nodesToSelect.push(realNode);
    }

    getStageGridPlugin(instance)?.onRender();
  }

  const nodesSelectionPlugin = getNodesSelectionPlugin(instance);
  nodesSelectionPlugin?.setSelectedNodes(nodesToSelect);

  stage.container().focus();
};
