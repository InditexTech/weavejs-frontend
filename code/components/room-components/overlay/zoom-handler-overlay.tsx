"use client";

import React from "react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { Fullscreen, Maximize, ZoomIn, ZoomOut } from "lucide-react";
import { useWeave } from "@weavejs/react";

export function ZoomHandlerOverlay() {
  const instance = useWeave((state) => state.instance);
  const selectedNodes = useWeave((state) => state.selection.nodes);

  const zoomValue = useWeave((state) => state.zoom.value);
  const canZoomIn = useWeave((state) => state.zoom.canZoomIn);
  const canZoomOut = useWeave((state) => state.zoom.canZoomOut);

  return (
    <div className="w-full py-1 flex justify-between items-center border-t border-light-border-3">
      <div className="w-full grid grid-cols-[auto_1fr]">
        <div className="flex justify-start items-center">
          <ToolbarButton
            icon={<ZoomIn />}
            disabled={!canZoomIn}
            onClick={() => {
              if (instance) {
                instance.triggerAction("zoomInTool");
              }
            }}
            label="Zoom in"
            tooltipSide="top"
          />
          <ToolbarButton
            icon={<ZoomOut />}
            disabled={!canZoomOut}
            onClick={() => {
              if (instance) {
                instance.triggerAction("zoomOutTool");
              }
            }}
            label="Zoom out"
            tooltipSide="top"
          />
          <ToolbarButton
            icon={<Maximize />}
            onClick={() => {
              if (instance) {
                instance.triggerAction("fitToScreenTool");
              }
            }}
            label="Fit to screen"
            tooltipSide="top"
          />
          <ToolbarButton
            icon={<Fullscreen />}
            disabled={selectedNodes.length === 0}
            onClick={() => {
              if (instance) {
                instance.triggerAction("fitToSelectionTool");
              }
            }}
            label="Fit to selection"
            tooltipSide="top"
          />
        </div>
        <div className="w-full px-4 font-mono flex justify-end items-center bg-light-background-1">
          {parseFloat(`${zoomValue * 100}`).toFixed(2)}%
        </div>
      </div>
    </div>
  );
}
