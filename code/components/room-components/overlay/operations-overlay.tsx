"use client";

import React from "react";
import {
  Clipboard,
  Copy,
  Trash2,
  Group,
  Ungroup,
  MonitorDown,
  ImageDown,
} from "lucide-react";
import { useWeave } from "@inditextech/weavejs-react";
import {
  WeaveCopyPasteNodesPlugin,
  WeaveExportNodeActionParams,
  WeaveExportStageActionParams,
} from "@inditextech/weavejs-sdk";
import { ToolbarButton } from "../toolbar/toolbar-button";

export function OperationsOverlay() {
  const instance = useWeave((state) => state.instance);
  const selectedNodes = useWeave((state) => state.selection.nodes);
  const node = useWeave((state) => state.selection.node);

  const isActionActive = useWeave((state) => state.actions.active);

  const canCopy = useWeave((state) => state.copyPaste.canCopy);
  const canPaste = useWeave((state) => state.copyPaste.canPaste);

  return (
    <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex gap-5 justify-center items-center">
      <div className="p-1 bg-white border border-zinc-200 shadow-xs flex justify-start items-center gap-3">
        <div className="flex justify-start items-center">
          <ToolbarButton
            icon={<Group />}
            disabled={selectedNodes.length < 2}
            onClick={() => {
              if (instance) {
                instance.group(selectedNodes.map((n) => n.node));
              }
            }}
            label="Group selected shapes"
            tooltipSide="top"
          />
          <ToolbarButton
            icon={<Ungroup />}
            disabled={node?.type !== "group"}
            onClick={() => {
              if (instance && node) {
                instance.unGroup(node);
              }
            }}
            label="Ungroup selected shapes"
            tooltipSide="top"
          />
          <div className="w-full flex justify-center items-center">
            <div className="w-[1px] h-4 bg-accent mx-2"></div>
          </div>
          <ToolbarButton
            icon={<Copy />}
            disabled={isActionActive || !canCopy}
            onClick={() => {
              if (instance) {
                const weaveCopyPasteNodesPlugin =
                  instance.getPlugin<WeaveCopyPasteNodesPlugin>(
                    "copyPasteNodes"
                  );
                if (weaveCopyPasteNodesPlugin) {
                  return weaveCopyPasteNodesPlugin.copy();
                }
              }
            }}
            tooltipSide="top"
            label="Copy"
          />
          <ToolbarButton
            icon={<Clipboard />}
            disabled={isActionActive || !canPaste}
            onClick={() => {
              if (instance) {
                const weaveCopyPasteNodesPlugin =
                  instance.getPlugin<WeaveCopyPasteNodesPlugin>(
                    "copyPasteNodes"
                  );
                if (weaveCopyPasteNodesPlugin) {
                  return weaveCopyPasteNodesPlugin.paste();
                }
              }
            }}
            label="Paste"
            tooltipSide="top"
          />
          <div className="w-full flex justify-center items-center">
            <div className="w-[1px] h-4 bg-accent mx-2"></div>
          </div>
          <ToolbarButton
            icon={<ImageDown />}
            disabled={selectedNodes.length !== 1}
            onClick={() => {
              if (instance && selectedNodes.length === 1) {
                instance.triggerAction<WeaveExportNodeActionParams>(
                  "exportNodeTool",
                  {
                    node: selectedNodes[0].instance,
                    options: {
                      padding: 20,
                      pixelRatio: 2,
                    },
                  }
                );
              }
            }}
            tooltipSide="top"
            label="Export selected nodes as image"
          />
          <ToolbarButton
            icon={<MonitorDown />}
            onClick={() => {
              if (instance) {
                instance.triggerAction<WeaveExportStageActionParams>(
                  "exportStageTool",
                  {
                    options: {
                      padding: 20,
                      pixelRatio: 2,
                    },
                  }
                );
              }
            }}
            tooltipSide="top"
            label="Export canvas as image"
          />
          <div className="w-full flex justify-center items-center">
            <div className="w-[1px] h-4 bg-accent mx-2"></div>
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
            tooltipSide="top"
            label="Delete selected shapes"
          />
        </div>
      </div>
    </div>
  );
}
