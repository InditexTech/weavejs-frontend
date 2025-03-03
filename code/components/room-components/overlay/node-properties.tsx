"use client";

import React from "react";
import { useWeave } from "@weavejs/react";
import { useCollaborationRoom } from "@/store/store";
import PantoneOverlayOptions from "./pantone-overlay-options";
import WorkspaceOverlayOptions from "./workspace-overlay-options";
import ImageOverlayOptions from "./image-overlay-options";
import TextOverlayOptions from "./text-overlay-options";
import RectangleOverlayOptions from "./rectangle-overlay-options";
import StrokeOverlayOptions from "./stroke-overlay-options";
import ExtraImageOverlayOptions from "./extra-image-overlay-options";
import CommonOverlayOptions from "./common-overlay-options";

export const NodeProperties = () => {
  const instance = useWeave((state) => state.instance);
  const node = useWeave((state) => state.selection.node);
  const nodePropertiesVisible = useCollaborationRoom(
    (state) => state.nodeProperties.visible
  );

  const nodeType = React.useMemo(() => {
    switch (node?.type) {
      case "group":
        return "Group";
      case "rectangle":
        return "Rectangle";
      case "line":
        return "Vector path";
      case "text":
        return "Text";
      case "image":
        return "Image";
      case "pantone":
        return "Pantone";
      case "workspace":
        return "Workspace";
      default:
        return "Unknown";
    }
  }, [node]);

  if (!instance) {
    return null;
  }

  if (!node) {
    return null;
  }

  if (!nodePropertiesVisible) {
    return null;
  }

  return (
    <div className="w-full justify-center items-center">
      <div className="w-full p-3 border-b bg-muted/40">
        <h2 className="text-sm font-medium">{nodeType}</h2>
      </div>
      <div className="flex-1">
        <PantoneOverlayOptions />
        <WorkspaceOverlayOptions />
        <ImageOverlayOptions />
        <CommonOverlayOptions />
        <TextOverlayOptions />
        <RectangleOverlayOptions />
        <StrokeOverlayOptions />
        <ExtraImageOverlayOptions />
      </div>
    </div>
  );
};
