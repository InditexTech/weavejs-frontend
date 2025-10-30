// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { WeaveSelection } from "@inditextech/weave-types";
import { useCollaborationRoom } from "@/store/store";
import { useIACapabilities } from "@/store/ia";

export const useNodeActionName = () => {
  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);
  const node = useWeave((state) => state.selection.node);
  const nodes = useWeave((state) => state.selection.nodes);
  const setNode = useWeave((state) => state.setNode);

  const imagesLLMPopupVisible = useIACapabilities(
    (state) => state.llmPopup.visible
  );

  const nodePropertiesAction = useCollaborationRoom(
    (state) => state.nodeProperties.action
  );

  const nodeType = React.useMemo(() => {
    switch (node?.type) {
      case "group":
        return "Group";
      case "rectangle":
        return "Rectangle";
      case "ellipse":
        return "Ellipse";
      case "regular-polygon":
        return "Regular Polygon";
      case "stroke":
        return "Stroke";
      case "line":
        return "Vector path";
      case "connector":
        return "Connector";
      case "text":
        return "Text";
      case "video":
        return "Video";
      case "image":
        return imagesLLMPopupVisible ? "Unknown" : "Image";
      case "star":
        return "Star";
      case "arrow":
        return "Arrow";
      case "color-token":
        return "Color Token";
      case "frame":
        return "Frame";
      case "mask":
        return "Mask";
      case "fuzzy-mask":
        return "Mask";
      default:
        return "Unknown";
    }
  }, [node, imagesLLMPopupVisible]);

  const actionType = React.useMemo(() => {
    switch (actualAction) {
      case "rectangleTool":
        return "Rectangle";
      case "ellipseTool":
        return "Ellipse";
      case "regularPolygonTool":
        return "Regular Polygon";
      case "brushTool":
        return "Stroke";
      case "penTool":
        return "Vector path";
      case "imageTool":
        return "Image";
      case "starTool":
        return "Star";
      case "arrowTool":
        return "Arrow";
      case "colorTokenTool":
        return "Color Token";
      case "frameTool":
        return "Frame";
      case "textTool":
        return "Text";
      case "maskTool":
        return "Mask";
      case "fuzzyMaskTool":
        return "Mask";
      case "moveTool":
        return imagesLLMPopupVisible ? "Move" : "Unknown";
      case "maskEraserTool":
        return "Eraser";
      default:
        return "Unknown";
    }
  }, [actualAction, imagesLLMPopupVisible]);

  React.useEffect(() => {
    if (!instance) return;

    function handleOnNodeChange({ node }: WeaveSelection) {
      setNode(node);
    }

    instance.addEventListener("onNodeChange", handleOnNodeChange);

    return () => {
      instance.removeEventListener("onNodeChange", handleOnNodeChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node, instance]);

  const name = React.useMemo(() => {
    if (nodes && nodes.length > 1) {
      return "Selection";
    }
    if (nodePropertiesAction === "create") {
      return actionType;
    }
    if (imagesLLMPopupVisible) {
      return actionType;
    }
    return nodeType;
  }, [
    nodes,
    nodeType,
    actionType,
    imagesLLMPopupVisible,
    nodePropertiesAction,
  ]);

  return name;
};
