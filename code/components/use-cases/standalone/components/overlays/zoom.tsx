// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { Fullscreen, Maximize, ZoomIn, ZoomOut } from "lucide-react";
import { ToolbarButton } from "@/components/room-components/toolbar/toolbar-button";
import { WeaveStageZoomPlugin } from "@inditextech/weave-sdk";

export function Zoom() {
  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);

  const zoomValue = useWeave((state) => state.zoom.value);
  const canZoomIn = useWeave((state) => state.zoom.canZoomIn);
  const canZoomOut = useWeave((state) => state.zoom.canZoomOut);

  const handleTriggerActionWithParams = React.useCallback(
    (actionName: string, params: unknown) => {
      if (instance) {
        const triggerSelection = actualAction === "selectionTool";
        instance.triggerAction(actionName, params);
        if (triggerSelection) {
          instance.triggerAction("selectionTool");
        }
      }
    },
    [instance, actualAction],
  );

  const isZoomingAllowed = React.useMemo(() => {
    const allowedZoomActions = ["selectionTool", "moveTool", "eraserTool"];
    if (typeof actualAction === "undefined") {
      return true;
    }
    if (allowedZoomActions.includes(actualAction)) {
      return true;
    }
    return false;
  }, [actualAction]);

  return (
    <div className="bg-white px-5 flex justify-end gap-2 items-center">
      <div className="gap-1 flex justify-end items-center">
        <div className="w-full grid grid-cols-[auto_1fr]">
          <div className="flex justify-start items-center gap-[16px]">
            <ToolbarButton
              icon={<ZoomIn size={20} strokeWidth={1} />}
              disabled={!canZoomIn || !isZoomingAllowed}
              onClick={() => {
                handleTriggerActionWithParams("zoomInTool", {
                  previousAction: actualAction,
                });
              }}
              label={
                <div className="flex gap-3 justify-start items-center">
                  <p>Zoom in</p>
                </div>
              }
              variant="squared"
              tooltipSide="bottom"
              tooltipAlign="end"
            />
            <ToolbarButton
              icon={<ZoomOut size={20} strokeWidth={1} />}
              disabled={!canZoomOut || !isZoomingAllowed}
              onClick={() => {
                handleTriggerActionWithParams("zoomOutTool", {
                  previousAction: actualAction,
                });
              }}
              label={
                <div className="flex gap-3 justify-start items-center">
                  <p>Zoom out</p>
                </div>
              }
              variant="squared"
              tooltipSide="bottom"
              tooltipAlign="end"
            />
            <ToolbarButton
              icon={<Maximize size={20} strokeWidth={1} />}
              disabled={!isZoomingAllowed}
              onClick={() => {
                if (!instance) return;

                handleTriggerActionWithParams("fitToScreenTool", {
                  previousAction: actualAction,
                  overrideZoom: false,
                });

                const weaveStageZoomPlugin =
                  instance.getPlugin<WeaveStageZoomPlugin>("stageZoom");

                if (weaveStageZoomPlugin) {
                  weaveStageZoomPlugin.setZoom(1);
                }
              }}
              label={
                <div className="flex gap-3 justify-start items-center">
                  <p>Fit to screen</p>
                </div>
              }
              variant="squared"
              tooltipSide="bottom"
              tooltipAlign="end"
            />
            <ToolbarButton
              icon={<Fullscreen size={20} strokeWidth={1} />}
              disabled={!isZoomingAllowed}
              onClick={() => {
                handleTriggerActionWithParams("fitToSelectionTool", {
                  previousAction: actualAction,
                  overrideZoom: false,
                });
              }}
              label={
                <div className="flex gap-3 justify-start items-center">
                  <p>Fit to selection</p>
                </div>
              }
              variant="squared"
              tooltipSide="bottom"
              tooltipAlign="end"
            />
          </div>
          <div className="w-[75px] px-4 pr-0 font-inter flex justify-center items-center text-muted-foreground">
            {parseFloat(`${zoomValue * 100}`).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
}
