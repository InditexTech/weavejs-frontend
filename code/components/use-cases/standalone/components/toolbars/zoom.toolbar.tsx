// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { Fullscreen, Maximize, ScanEye, ZoomIn, ZoomOut } from "lucide-react";
import { ToolbarButton } from "@/components/room-components/toolbar/toolbar-button";
import { WeaveStageZoomPlugin } from "@inditextech/weave-sdk";
import { Badge } from "@/components/ui/badge";
import { useStandaloneUseCase } from "../../store/store";

export function ZoomToolbar() {
  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);

  const zoomValue = useWeave((state) => state.zoom.value);
  const canZoomIn = useWeave((state) => state.zoom.canZoomIn);
  const canZoomOut = useWeave((state) => state.zoom.canZoomOut);

  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId,
  );
  const instanceLoading = useStandaloneUseCase(
    (state) => state.instanceLoading,
  );

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
    <>
      <Badge variant="outline" className="cursor-default w-[60px]">
        {parseFloat(`${zoomValue * 100}`).toFixed(0)}%
      </Badge>
      <ToolbarButton
        icon={<ZoomIn size={20} strokeWidth={1} />}
        disabled={!canZoomIn || !isZoomingAllowed || instanceLoading}
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
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="bottom"
        tooltipAlign="center"
      />
      <ToolbarButton
        icon={<ZoomOut size={20} strokeWidth={1} />}
        disabled={!canZoomOut || !isZoomingAllowed || instanceLoading}
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
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="bottom"
        tooltipAlign="center"
      />
      <ToolbarButton
        icon={<Maximize size={20} strokeWidth={1} />}
        disabled={!isZoomingAllowed || instanceLoading}
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
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="bottom"
        tooltipAlign="end"
      />
      <ToolbarButton
        icon={<Fullscreen size={20} strokeWidth={1} />}
        disabled={!isZoomingAllowed || instanceLoading}
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
      <ToolbarButton
        icon={<ScanEye size={20} strokeWidth={1} />}
        disabled={!managingImageId || !isZoomingAllowed || instanceLoading}
        onClick={() => {
          if (!instance) return;

          if (!managingImageId) return;

          const stageZoomPlugin =
            instance.getPlugin<WeaveStageZoomPlugin>("stageZoom");

          if (stageZoomPlugin) {
            stageZoomPlugin.fitToNodes([managingImageId]);
          }
        }}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>Fit to content</p>
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="bottom"
        tooltipAlign="center"
      />
      {/* <Divider className="h-[20px]" /> */}
    </>
  );
}
