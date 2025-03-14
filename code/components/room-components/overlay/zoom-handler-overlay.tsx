"use client";

import React from "react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { Fullscreen, Maximize, ZoomIn, ZoomOut, Braces } from "lucide-react";
import { useWeave } from "@inditextech/weavejs-react";
import { HelpDrawer } from "../help-drawer";
import { motion } from "framer-motion";
import { bottomElementVariants } from "./variants";

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
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={bottomElementVariants}
      className="absolute bottom-2 left-2 right-2 flex gap-1 justify-between items-center overflow-hidden"
    >
      <div className="p-1 bg-white border border-zinc-200 shadow-xs flex justify-start items-center">
        <div className="w-full flex justify-between items-center">
          <div className="w-full grid grid-cols-[auto_1fr]">
            <div className="flex justify-start items-center gap-1">
              <HelpDrawer />
            </div>
          </div>
        </div>
      </div>
      <div className="w-[320px] p-1 bg-white border border-zinc-200 shadow-xs flex justify-start items-center">
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
              <ToolbarButton
                icon={<Braces />}
                onClick={() => {
                  if (instance) {
                    // eslint-disable-next-line no-console
                    console.log({
                      appState: JSON.parse(
                        JSON.stringify(instance.getStore().getState())
                      ),
                    });
                  }
                }}
                label="Print model state to browser console"
              />
            </div>
            <div className="w-full px-4 font-noto-sans-mono flex justify-end items-center text-muted-foreground">
              {parseFloat(`${zoomValue * 100}`).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
