// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { ToolbarButton } from "@/components/room-components/toolbar/toolbar-button";
import {
  Brush,
  Square,
  Type,
  MousePointer,
  Undo,
  Redo,
  Eraser,
  MessageSquare,
  RulerDimensionLine,
} from "lucide-react";
import { useWeave } from "@inditextech/weave-react";
import { Toolbar } from "@/components/room-components/toolbar/toolbar";
import { ToolbarDivider } from "@/components/room-components/toolbar/toolbar-divider";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { MoveToolTrigger } from "@/components/room-components/overlay/tools-triggers/move-tool";

export function Tools() {
  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);
  const canUndo = useWeave((state) => state.undoRedo.canUndo);
  const canRedo = useWeave((state) => state.undoRedo.canRedo);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const triggerTool = React.useCallback(
    (toolName: string, params?: unknown) => {
      if (instance && actualAction !== toolName) {
        instance.triggerAction(toolName, params);
        return;
      }
      if (instance && actualAction === toolName) {
        instance.cancelAction(toolName);
      }
    },
    [instance, actualAction]
  );

  return (
    <div className="pointer-events-none absolute left-5 right-5 bottom-5 flex flex-col gap-2 justify-center items-center">
      <Toolbar orientation="horizontal" className="hidden 2xl:flex">
        <MoveToolTrigger />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<MousePointer className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "selectionTool"}
          onClick={() => triggerTool("selectionTool")}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Selection tool</p>
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Eraser className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "eraserTool"}
          onClick={() => triggerTool("eraserTool")}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Eraser tool</p>
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarDivider />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Square className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "rectangleTool"}
          onClick={() => triggerTool("rectangleTool")}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Rectangle tool</p>
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Brush className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "brushTool"}
          onClick={() => triggerTool("brushTool")}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Brush tool</p>
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Type className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "textTool"}
          onClick={() => triggerTool("textTool")}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Text tool</p>
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<MessageSquare className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "commentTool"}
          onClick={() => {
            triggerTool("commentTool", {});
          }}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Comment tool</p>
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={
            <RulerDimensionLine className="px-2" size={40} strokeWidth={1} />
          }
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "customMeasureTool"}
          onClick={() => {
            if (!instance) {
              return;
            }
            if (actualAction === "customMeasureTool") {
              return;
            }
            triggerTool("customMeasureTool", {});
          }}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Measure tool</p>
            </div>
          }
          tooltipSide="right"
          tooltipAlign="center"
        />
        <ToolbarDivider />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Undo className="px-2" size={40} strokeWidth={1} />}
          disabled={
            !canUndo ||
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          onClick={() => {
            if (instance) {
              const actualStore = instance.getStore();
              actualStore.undoStateStep();
            }
          }}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Undo latest changes</p>
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Redo className="px-2" size={40} strokeWidth={1} />}
          disabled={
            !canRedo ||
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          onClick={() => {
            if (instance) {
              const actualStore = instance.getStore();
              actualStore.redoStateStep();
            }
          }}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Redo latest changes</p>
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
      </Toolbar>
    </div>
  );
}
