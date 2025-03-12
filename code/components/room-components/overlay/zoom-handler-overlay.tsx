"use client";

import React from "react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { Fullscreen, Maximize, ZoomIn, ZoomOut } from "lucide-react";
import { useWeave } from "@inditextech/weavejs-react";

export function ZoomHandlerOverlay() {
  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);
  const selectedNodes = useWeave((state) => state.selection.nodes);

  const zoomValue = useWeave((state) => state.zoom.value);
  const canZoomIn = useWeave((state) => state.zoom.canZoomIn);
  const canZoomOut = useWeave((state) => state.zoom.canZoomOut);

  const handleTriggerAction = React.useCallback(
    (actionName: string) => {
      if (instance) {
        const triggerSelection = actualAction === "selectionTool";
        instance.triggerAction(actionName);
        if (triggerSelection) {
          instance.triggerAction("selectionTool");
        }
      }
    },
    [instance, actualAction]
  );

  return (
    <div className="absolute bottom-2 right-2 flex flex-col gap-1 justify-center items-center">
      <div className="w-[320px] p-1 bg-white border border-zinc-200 shadow-xs flex flex-col justify-start items-center">
        <div className="w-full flex justify-between items-center">
          <div className="w-full grid grid-cols-[auto_1fr]">
            <div className="flex justify-start items-center gap-1">
              <ToolbarButton
                icon={<ZoomIn />}
                disabled={!canZoomIn}
                onClick={() => {
                  handleTriggerAction("zoomInTool");
                }}
                label="Zoom in"
                tooltipSide="top"
              />
              <ToolbarButton
                icon={<ZoomOut />}
                disabled={!canZoomOut}
                onClick={() => {
                  handleTriggerAction("zoomOutTool");
                }}
                label="Zoom out"
                tooltipSide="top"
              />
              <ToolbarButton
                icon={<Maximize />}
                onClick={() => {
                  handleTriggerAction("fitToScreenTool");
                }}
                label="Fit to screen"
                tooltipSide="top"
              />
              <ToolbarButton
                icon={<Fullscreen />}
                disabled={selectedNodes.length === 0}
                onClick={() => {
                  handleTriggerAction("fitToSelectionTool");
                }}
                label="Fit to selection"
                tooltipSide="top"
              />
            </div>
            <div className="w-full px-4 font-noto-sans-mono flex justify-end items-center text-muted-foreground">
              {parseFloat(`${zoomValue * 100}`).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
