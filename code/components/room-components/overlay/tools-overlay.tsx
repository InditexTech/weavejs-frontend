"use client";

import React from "react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import {
  Brush,
  ImagePlus,
  PenTool,
  Square,
  Type,
  Redo,
  Undo,
  Frame,
  MousePointer,
  SwatchBook,
} from "lucide-react";
import { useWeave } from "@inditextech/weavejs-react";
import { Toolbar } from "../toolbar/toolbar";
import { motion } from "framer-motion";
import { leftElementVariants } from "./variants";
import { useCollaborationRoom } from "@/store/store";

export function ToolsOverlay() {
  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);
  const canUndo = useWeave((state) => state.undoRedo.canUndo);
  const canRedo = useWeave((state) => state.undoRedo.canRedo);

  const setShowSelectFileImage = useCollaborationRoom(
    (state) => state.setShowSelectFileImage
  );

  const triggerTool = React.useCallback(
    (toolName: string) => {
      if (instance && actualAction !== toolName) {
        instance.triggerAction(toolName);
      }
      if (instance && actualAction === toolName) {
        instance.cancelAction(toolName);
      }
    },
    [instance, actualAction]
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={leftElementVariants}
      className="absolute top-[calc(50px+16px)] left-2 bottom-2 flex flex-col gap-2 justify-center items-center"
    >
      <Toolbar>
        <ToolbarButton
          icon={<MousePointer />}
          active={actualAction === "selectionTool"}
          onClick={() => triggerTool("selectionTool")}
          label="Selection"
        />
        <ToolbarButton
          icon={<Square />}
          active={actualAction === "rectangleTool"}
          onClick={() => triggerTool("rectangleTool")}
          label="Add a rectangle"
        />
        <ToolbarButton
          icon={<PenTool />}
          active={actualAction === "penTool"}
          onClick={() => triggerTool("penTool")}
          label="Add a line"
        />
        <ToolbarButton
          icon={<Brush />}
          active={actualAction === "brushTool"}
          onClick={() => triggerTool("brushTool")}
          label="Free draw"
        />
        <ToolbarButton
          icon={<Type />}
          active={actualAction === "textTool"}
          onClick={() => triggerTool("textTool")}
          label="Add text"
        />
        <ToolbarButton
          icon={<ImagePlus />}
          active={actualAction === "imageTool"}
          onClick={() => {
            triggerTool("imageTool");
            setShowSelectFileImage(true);
          }}
          label="Add an image"
        />
        <ToolbarButton
          icon={<Frame />}
          active={actualAction === "frameTool"}
          onClick={() => triggerTool("frameTool")}
          label="Add a frame"
        />
        <div className="w-full justify-center items-center flex">
          <div className="w-[20px] h-[1px] bg-zinc-200 my-1"></div>
        </div>
        <ToolbarButton
          icon={<SwatchBook />}
          active={actualAction === "pantoneTool"}
          onClick={() => triggerTool("pantoneTool")}
          label="Add pantone element"
        />
      </Toolbar>
      <Toolbar>
        <ToolbarButton
          icon={<Undo />}
          disabled={!canUndo}
          onClick={() => {
            if (instance) {
              const actualStore = instance.getStore();
              actualStore.undoStateStep();
            }
          }}
          label="Undo"
        />
        <ToolbarButton
          icon={<Redo />}
          disabled={!canRedo}
          onClick={() => {
            if (instance) {
              const actualStore = instance.getStore();
              actualStore.redoStateStep();
            }
          }}
          label="Redo"
        />
      </Toolbar>
    </motion.div>
  );
}
