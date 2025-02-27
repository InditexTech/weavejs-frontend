"use client";

import React from "react";
import { ToolbarButton } from "./toolbar-button";
import { Clipboard, Copy, Trash2, Redo2, Undo2, Group, Ungroup, MonitorDown, ImageDown } from "lucide-react";
import { useWeave } from "@weavejs/react";
import { WeaveCopyPasteNodesPlugin, WeaveExportNodeActionParams, WeaveExportStageActionParams } from "@weavejs/sdk";

export function OperationsOverlay() {
  const instance = useWeave((state) => state.instance);
  const selectedNodes = useWeave((state) => state.selection.nodes);
  const node = useWeave((state) => state.selection.node);

  const isActionActive = useWeave((state) => state.actions.active);

  const canCopy = useWeave((state) => state.copyPaste.canCopy);
  const canPaste = useWeave((state) => state.copyPaste.canPaste);

  const canUndo = useWeave((state) => state.undoRedo.canUndo);
  const canRedo = useWeave((state) => state.undoRedo.canRedo);

  return (
    <div className="pointer-events-none absolute bottom-[20px] left-[20px] right-[20px] flex gap-5 justify-center items-center">
      <div className="p-1 bg-light-background-1 rounded-lg border border-light-border-3 shadow-md flex justify-start items-center gap-3">
        <div className="flex justify-start items-center">
          <ToolbarButton
            icon={<Group />}
            disabled={selectedNodes.length < 2}
            onClick={() => {
              if (instance) {
                instance.group(selectedNodes.map((n) => n.node));
              }
            }}
          />
          <ToolbarButton
            icon={<Ungroup />}
            disabled={node?.type !== "group"}
            onClick={() => {
              if (instance && node) {
                instance.unGroup(node);
              }
            }}
          />
          <div className="w-full flex justify-center items-center">
            <div className="w-[1px] h-[30px] bg-light-background-3 mx-1"></div>
          </div>
          <ToolbarButton
            icon={<Copy />}
            disabled={isActionActive || !canCopy}
            onClick={() => {
              if (instance) {
                const weaveCopyPasteNodesPlugin = instance.getPlugin<WeaveCopyPasteNodesPlugin>("copyPasteNodes");
                if (weaveCopyPasteNodesPlugin) {
                  return weaveCopyPasteNodesPlugin.copy();
                }
              }
            }}
          />
          <ToolbarButton
            icon={<Clipboard />}
            disabled={isActionActive || !canPaste}
            onClick={() => {
              if (instance) {
                const weaveCopyPasteNodesPlugin = instance.getPlugin<WeaveCopyPasteNodesPlugin>("copyPasteNodes");
                if (weaveCopyPasteNodesPlugin) {
                  return weaveCopyPasteNodesPlugin.paste();
                }
              }
            }}
          />
          <div className="w-full flex justify-center items-center">
            <div className="w-[1px] h-[30px] bg-light-background-3 mx-1"></div>
          </div>
          <ToolbarButton
            icon={<Undo2 />}
            disabled={isActionActive || !canUndo}
            onClick={() => {
              if (instance) {
                const actualStore = instance.getStore();
                actualStore.undoStateStep();
              }
            }}
          />
          <ToolbarButton
            icon={<Redo2 />}
            disabled={isActionActive || !canRedo}
            onClick={() => {
              if (instance) {
                const actualStore = instance.getStore();
                actualStore.redoStateStep();
              }
            }}
          />
          <div className="w-full flex justify-center items-center">
            <div className="w-[1px] h-[30px] bg-light-background-3 mx-1"></div>
          </div>
          <ToolbarButton
            icon={<ImageDown />}
            disabled={selectedNodes.length !== 1}
            onClick={() => {
              if (instance && selectedNodes.length === 1) {
                instance.triggerAction<WeaveExportNodeActionParams>("exportNodeTool", {
                  node: selectedNodes[0].instance,
                  options: {
                    padding: 20,
                    pixelRatio: 2,
                  },
                });
              }
            }}
          />
          <ToolbarButton
            icon={<MonitorDown />}
            onClick={() => {
              if (instance) {
                instance.triggerAction<WeaveExportStageActionParams>("exportStageTool", {
                  options: {
                    padding: 20,
                    pixelRatio: 2,
                  },
                });
              }
            }}
          />
          <div className="w-full flex justify-center items-center">
            <div className="w-[1px] h-[30px] bg-light-background-3 mx-1"></div>
          </div>
          <ToolbarButton
            icon={<Trash2 />}
            disabled={isActionActive || selectedNodes.length === 0}
            onClick={() => {
              if (instance) {
                for (const node of selectedNodes) {
                  instance.removeNode(node.node);
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
