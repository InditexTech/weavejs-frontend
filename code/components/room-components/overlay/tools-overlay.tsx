"use client";

import React from "react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import {
  Brush,
  ImagePlus,
  PenTool,
  Presentation,
  Square,
  SwatchBook,
  Type,
  Redo2,
  Undo2,
} from "lucide-react";
import { useWeave } from "@inditextech/weavejs-react";
import { Toolbar } from "../toolbar/toolbar";

export function ToolsOverlay() {
  const instance = useWeave((state) => state.instance);

  const isActionActive = useWeave((state) => state.actions.active);
  const actualAction = useWeave((state) => state.actions.actual);

  const canUndo = useWeave((state) => state.undoRedo.canUndo);
  const canRedo = useWeave((state) => state.undoRedo.canRedo);

  const triggerRectangleTool = React.useCallback(() => {
    if (instance && actualAction !== "rectangleTool") {
      instance.triggerAction("rectangleTool");
    }
    if (instance && actualAction === "rectangleTool") {
      instance.cancelAction("rectangleTool");
    }
  }, [instance, actualAction]);

  const triggerPenTool = React.useCallback(() => {
    if (instance && actualAction !== "penTool") {
      instance.triggerAction("penTool");
    }
    if (instance && actualAction === "penTool") {
      instance.cancelAction("penTool");
    }
  }, [instance, actualAction]);

  const triggerBrushTool = React.useCallback(() => {
    if (instance && actualAction !== "brushTool") {
      instance.triggerAction("brushTool");
    }
    if (instance && actualAction === "brushTool") {
      instance.cancelAction("brushTool");
    }
  }, [instance, actualAction]);

  const triggerTextTool = React.useCallback(() => {
    if (instance && actualAction !== "textTool") {
      instance.triggerAction("textTool");
    }
    if (instance && actualAction === "textTool") {
      instance.cancelAction("textTool");
    }
  }, [instance, actualAction]);

  const triggerImageTool = React.useCallback(() => {
    if (instance && actualAction !== "imageTool") {
      instance.triggerAction("imageTool");
    }
    if (instance && actualAction === "imageTool") {
      instance.cancelAction("imageTool");
    }
  }, [instance, actualAction]);

  const triggerPantoneTool = React.useCallback(() => {
    if (instance && actualAction !== "pantoneTool") {
      instance.triggerAction("pantoneTool");
    }
    if (instance && actualAction === "pantoneTool") {
      instance.cancelAction("pantoneTool");
    }
  }, [instance, actualAction]);

  const triggerWorkspaceTool = React.useCallback(() => {
    if (instance && actualAction !== "workspaceTool") {
      instance.triggerAction("workspaceTool");
    }
    if (instance && actualAction === "workspaceTool") {
      instance.cancelAction("workspaceTool");
    }
  }, [instance, actualAction]);

  return (
    <div className="absolute top-[calc(50px+16px)] left-2 bottom-2 flex flex-col gap-1 justify-center items-center">
      <Toolbar>
        <ToolbarButton
          icon={<Square />}
          active={actualAction === "rectangleTool"}
          disabled={isActionActive && actualAction !== "rectangleTool"}
          onClick={triggerRectangleTool}
          label="Draw a Rectangle"
        />
        <ToolbarButton
          icon={<PenTool />}
          active={actualAction === "penTool"}
          disabled={isActionActive && actualAction !== "penTool"}
          onClick={triggerPenTool}
          label="Draw a Line"
        />
        <ToolbarButton
          icon={<Brush />}
          active={actualAction === "brushTool"}
          disabled={isActionActive && actualAction !== "brushTool"}
          onClick={triggerBrushTool}
          label="Free draw"
        />
        <ToolbarButton
          icon={<Type />}
          active={actualAction === "textTool"}
          disabled={isActionActive && actualAction !== "textTool"}
          onClick={triggerTextTool}
          label="Text tool"
        />
        <ToolbarButton
          icon={<ImagePlus />}
          active={actualAction === "imageTool"}
          disabled={isActionActive && actualAction !== "imageTool"}
          onClick={triggerImageTool}
          label="Add an image"
        />
      </Toolbar>
      <Toolbar>
        <ToolbarButton
          icon={<SwatchBook />}
          active={actualAction === "pantoneTool"}
          disabled={isActionActive && actualAction !== "pantoneTool"}
          onClick={triggerPantoneTool}
          label="Add a Pantone color"
        />
        <ToolbarButton
          icon={<Presentation />}
          active={actualAction === "workspaceTool"}
          disabled={isActionActive && actualAction !== "workspaceTool"}
          onClick={triggerWorkspaceTool}
          label="Create a workspace"
        />
      </Toolbar>
      <Toolbar>
        <ToolbarButton
          icon={<Undo2 />}
          disabled={isActionActive || !canUndo}
          onClick={() => {
            if (instance) {
              const actualStore = instance.getStore();
              actualStore.undoStateStep();
            }
          }}
          label="Undo"
          tooltipSide="top"
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
          label="Redo"
          tooltipSide="top"
        />
      </Toolbar>
    </div>
  );
}
