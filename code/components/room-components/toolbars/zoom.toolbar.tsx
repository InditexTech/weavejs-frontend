// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { formatForDisplay } from "@tanstack/react-hotkeys";
import { useWeave } from "@inditextech/weave-react";
import { Fullscreen, Maximize, ScanEye, ZoomIn, ZoomOut } from "lucide-react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { Badge } from "@/components/ui/badge";
import { Divider } from "../overlay/divider";
import { useIsRoomReady } from "../hooks/use-is-room-ready";

export function ZoomToolbar() {
  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);
  const isRoomSwitching = useWeave((state) => state.room.switching);

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

  const isRoomReady = useIsRoomReady();

  if (!isRoomReady || isRoomSwitching) {
    return null;
  }

  return (
    <>
      <Badge
        variant="outline"
        className="cursor-default w-[60px] font-mono text-xs"
      >
        {parseFloat(`${zoomValue * 100}`).toFixed(0)}%
      </Badge>
      <ToolbarButton
        icon={<ZoomIn size={20} strokeWidth={1} />}
        disabled={!canZoomIn || !isZoomingAllowed || isRoomSwitching}
        onClick={() => {
          handleTriggerActionWithParams("zoomInTool", {
            previousAction: actualAction,
          });
        }}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>Zoom in</p>
            {formatForDisplay("Shift+ArrowDown")}
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
        disabled={!canZoomOut || !isZoomingAllowed || isRoomSwitching}
        onClick={() => {
          handleTriggerActionWithParams("zoomOutTool", {
            previousAction: actualAction,
          });
        }}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>Zoom out</p>
            {formatForDisplay("Shift+ArrowUp")}
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
        disabled={!isZoomingAllowed || isRoomSwitching}
        onClick={() => {
          handleTriggerActionWithParams("fitToScreenTool", {
            previousAction: actualAction,
            overrideZoom: false,
          });
        }}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>Fit to screen</p>
            {formatForDisplay("Shift+1")}
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="bottom"
        tooltipAlign="center"
      />
      <ToolbarButton
        icon={<Fullscreen size={20} strokeWidth={1} />}
        disabled={!isZoomingAllowed || isRoomSwitching}
        onClick={() => {
          handleTriggerActionWithParams("fitToSelectionTool", {
            previousAction: actualAction,
            overrideZoom: false,
          });
        }}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>Fit to selection</p>
            {formatForDisplay("Shift+2")}
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="bottom"
        tooltipAlign="center"
      />
      <ToolbarButton
        icon={<ScanEye size={20} strokeWidth={1} />}
        disabled={!isZoomingAllowed || isRoomSwitching}
        onClick={() => {
          handleTriggerActionWithParams("fitToPageTool", {
            previousAction: actualAction,
            overrideZoom: false,
          });
        }}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>Fit to page</p>
            {formatForDisplay("Shift+3")}
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="bottom"
        tooltipAlign="center"
      />
      <Divider className="h-[20px]" />
    </>
  );
}
