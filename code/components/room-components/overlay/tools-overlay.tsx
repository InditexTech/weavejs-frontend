"use client";

import React from "react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import {
  Brush,
  Images,
  Braces,
  ImagePlus,
  PenTool,
  Square,
  SwatchBook,
  Type,
  Redo,
  Undo,
  Frame,
  MousePointer,
} from "lucide-react";
import { useWeave } from "@inditextech/weavejs-react";
import { Toolbar } from "../toolbar/toolbar";
import { useCollaborationRoom } from "@/store/store";

export function ToolsOverlay() {
  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);
  const canUndo = useWeave((state) => state.undoRedo.canUndo);
  const canRedo = useWeave((state) => state.undoRedo.canRedo);

  const workspacesLibraryVisible = useCollaborationRoom(
    (state) => state.workspaces.library.visible
  );
  const setWorkspacesLibraryVisible = useCollaborationRoom(
    (state) => state.setWorkspacesLibraryVisible
  );
  const imagesLibraryVisible = useCollaborationRoom(
    (state) => state.images.library.visible
  );
  const setImagesLibraryVisible = useCollaborationRoom(
    (state) => state.setImagesLibraryVisible
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
    <div className="absolute top-[calc(50px+16px)] left-2 bottom-2 flex flex-col gap-1 justify-center items-center">
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
          onClick={() => triggerTool("imageTool")}
          label="Add an image"
        />
        <ToolbarButton
          icon={<Frame />}
          active={actualAction === "workspaceTool"}
          onClick={() => triggerTool("workspaceTool")}
          label="Add a frame"
        />
      </Toolbar>
      <Toolbar>
        <ToolbarButton
          icon={<SwatchBook />}
          active={actualAction === "pantoneTool"}
          onClick={() => triggerTool("pantoneTool")}
          label="Add a pantone color"
        />
        <ToolbarButton
          icon={<Images />}
          active={imagesLibraryVisible}
          onClick={() => {
            setWorkspacesLibraryVisible(false);
            setImagesLibraryVisible(!imagesLibraryVisible);
          }}
          label="Images library"
        />
        <ToolbarButton
          icon={<Frame />}
          active={workspacesLibraryVisible}
          onClick={() => {
            setImagesLibraryVisible(false);
            setWorkspacesLibraryVisible(!workspacesLibraryVisible);
          }}
          label="Frames library"
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
      <Toolbar>
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
      </Toolbar>
    </div>
  );
}
