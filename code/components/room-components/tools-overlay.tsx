"use client";

import React from "react";
import { ToolbarButton } from "./toolbar-button";
import { Brush, ImagePlus, PenTool, Presentation, Square, SwatchBook, Type } from "lucide-react";
import { useWeave } from "@weavejs/react";
import { Toolbar } from "./toolbar";

export function ToolsOverlay() {
  const instance = useWeave((state) => state.instance);

  const isActionActive = useWeave((state) => state.actions.active);
  const actualAction = useWeave((state) => state.actions.actual);

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
    <div className="pointer-events-none absolute top-[20px] left-[20px] bottom-[20px] flex flex-col gap-5 justify-center items-center">
      <Toolbar>
        <ToolbarButton
          icon={<Square />}
          active={actualAction === "rectangleTool"}
          disabled={isActionActive && actualAction !== "rectangleTool"}
          onClick={triggerRectangleTool}
        />
        <ToolbarButton
          icon={<PenTool />}
          active={actualAction === "penTool"}
          disabled={isActionActive && actualAction !== "penTool"}
          onClick={triggerPenTool}
        />
        <ToolbarButton
          icon={<Brush />}
          active={actualAction === "brushTool"}
          disabled={isActionActive && actualAction !== "brushTool"}
          onClick={triggerBrushTool}
        />
        <ToolbarButton
          icon={<Type />}
          active={actualAction === "textTool"}
          disabled={isActionActive && actualAction !== "textTool"}
          onClick={triggerTextTool}
        />
        <ToolbarButton
          icon={<ImagePlus />}
          active={actualAction === "imageTool"}
          disabled={isActionActive && actualAction !== "imageTool"}
          onClick={triggerImageTool}
        />
        <div className="w-full flex justify-center items-center">
          <div className="w-[30px] h-[1px] bg-light-background-3 my-1"></div>
        </div>
        <ToolbarButton
          icon={<SwatchBook />}
          active={actualAction === "pantoneTool"}
          disabled={isActionActive && actualAction !== "pantoneTool"}
          onClick={triggerPantoneTool}
        />
        <ToolbarButton
          icon={<Presentation />}
          active={actualAction === "workspaceTool"}
          disabled={isActionActive && actualAction !== "workspaceTool"}
          onClick={triggerWorkspaceTool}
        />
      </Toolbar>
    </div>
  );
}
