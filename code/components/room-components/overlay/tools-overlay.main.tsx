// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import {
  MousePointer,
  Undo,
  Redo,
  Eraser,
  EllipsisVertical,
} from "lucide-react";
import { useWeave } from "@inditextech/weave-react";
import { Toolbar } from "../toolbar/toolbar";
import { useCollaborationRoom } from "@/store/store";
import { cn } from "@/lib/utils";
import { MoveToolTrigger } from "./tools-triggers/move-tool";
import { ToolbarDivider } from "../toolbar/toolbar-divider";
import { useShapesTools } from "./hooks/use-shapes-tools";
import { useMediaTools } from "./hooks/use-media-tools";
import {
  WEAVE_IMAGE_TOOL_ACTION_NAME,
  WEAVE_IMAGES_TOOL_ACTION_NAME,
} from "@inditextech/weave-sdk";
import { useOtherTools } from "./hooks/use-other-tools";
import { useTextTools } from "./hooks/use-text-tools";
import { ToolGroup, type ToolGroupItem } from "./tool-group";
import { useBreakpoint } from "./hooks/use-breakpoint";
import { useIsRoomReady } from "../hooks/use-is-room-ready";
import { formatForDisplay } from "@tanstack/react-hotkeys";
import { STICKY_NOTE_ENABLED } from "@/lib/sticky-note";
import { IMAGE_WITH_TITLE_ACTION_NAME } from "@/components/actions/image-with-title-tool/constants";

export function ToolsOverlayMain() {
  const [barOrientation, setBarOrientation] = React.useState<
    "horizontal" | "vertical"
  >("horizontal");

  const [openGroup, setOpenGroup] = React.useState<string | null>(null);

  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);
  const canUndo = useWeave((state) => state.undoRedo.canUndo);
  const canRedo = useWeave((state) => state.undoRedo.canRedo);

  const viewType = useCollaborationRoom((state) => state.viewType);
  const imageCroppingEnabled = useCollaborationRoom(
    (state) => state.images.cropping.enabled,
  );
  const threadsEnabled = useCollaborationRoom(
    (state) => state.features.threads,
  );
  const afterLoadFit = useCollaborationRoom((state) => state.afterLoadFit);
  const roomPageFetching = useCollaborationRoom(
    (state) => state.pages.fetching,
  );
  const roomPageAdding = useCollaborationRoom((state) => state.pages.adding);
  const roomPageRemoving = useCollaborationRoom(
    (state) => state.pages.removing,
  );

  const showContent = React.useMemo(() => {
    return (
      afterLoadFit && !roomPageFetching && !roomPageAdding && !roomPageRemoving
    );
  }, [afterLoadFit, roomPageFetching, roomPageAdding, roomPageRemoving]);

  // const showMinimap = useCollaborationRoom((state) => state.ui.minimap);
  // const setShowMinimap = useCollaborationRoom((state) => state.setShowMinimap);

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
    [instance, actualAction],
  );

  const SHAPES_TOOLS = useShapesTools();
  const MEDIA_TOOLS = useMediaTools();
  const OTHER_TOOLS = useOtherTools();
  const TEXT_TOOLS = useTextTools();

  const shapesItems = React.useMemo<ToolGroupItem[]>(
    () => [
      {
        id: "rectangleTool",
        name: "Rectangle",
        section: "Shapes",
        shortcut: "R",
        ...SHAPES_TOOLS.rectangleTool,
      },
      {
        id: "ellipseTool",
        name: "Ellipse",
        section: "Shapes",
        shortcut: "E",
        ...SHAPES_TOOLS.ellipseTool,
      },
      {
        id: "polygonTool",
        name: "Polygon",
        section: "Shapes",
        shortcut: "P",
        ...SHAPES_TOOLS.polygonTool,
      },
      {
        id: "starTool",
        name: "Star",
        section: "Shapes",
        shortcut: "J",
        ...SHAPES_TOOLS.starTool,
      },
      {
        id: "strokeTool",
        name: "Line",
        section: "Lines",
        shortcut: "L",
        ...SHAPES_TOOLS.strokeTool,
      },
      {
        id: "arrowTool",
        name: "Arrow",
        section: "Lines",
        ...SHAPES_TOOLS.arrowTool,
      },
      {
        id: "brushTool",
        name: "Brush",
        section: "Lines",
        shortcut: "B",
        ...SHAPES_TOOLS.brushTool,
      },
    ],
    [SHAPES_TOOLS],
  );

  const mediaItems = React.useMemo<ToolGroupItem[]>(
    () => [
      {
        id: WEAVE_IMAGE_TOOL_ACTION_NAME,
        name: "Image",
        section: "Images",
        shortcut: "I",
        ...MEDIA_TOOLS[WEAVE_IMAGE_TOOL_ACTION_NAME],
      },
      {
        id: WEAVE_IMAGES_TOOL_ACTION_NAME,
        name: "Images",
        section: "Images",
        shortcut: "O",
        ...MEDIA_TOOLS[WEAVE_IMAGES_TOOL_ACTION_NAME],
      },
      {
        id: IMAGE_WITH_TITLE_ACTION_NAME,
        name: "Image with title",
        section: "Images",
        ...MEDIA_TOOLS[IMAGE_WITH_TITLE_ACTION_NAME],
      },
      {
        id: "videoTool",
        name: "Video",
        section: "Video",
        ...MEDIA_TOOLS.videoTool,
      },
    ],
    [MEDIA_TOOLS],
  );

  const textItems = React.useMemo<ToolGroupItem[]>(
    () => [
      {
        id: "richTextTool",
        name: "Rich text",
        shortcut: "Shift+T",
        ...TEXT_TOOLS.richTextTool,
      },
      { id: "textTool", name: "Text", shortcut: "T", ...TEXT_TOOLS.textTool },
    ],
    [TEXT_TOOLS],
  );

  const otherItems = React.useMemo<ToolGroupItem[]>(
    () => [
      {
        id: "colorTokenTool",
        name: "Color reference",
        section: "Elements",
        ...OTHER_TOOLS.colorTokenTool,
      },
      {
        id: "frameTool",
        name: "Frame",
        section: "Layout",
        ...OTHER_TOOLS.frameTool,
      },
      {
        id: "commentTool",
        name: "Comment",
        section: "Collaboration",
        hidden: !threadsEnabled,
        ...OTHER_TOOLS.commentTool,
      },
      {
        id: "measureTool",
        name: "Measure",
        section: "Other",
        ...OTHER_TOOLS.measureTool,
      },
    ],
    [OTHER_TOOLS, threadsEnabled],
  );

  const breakpoint = useBreakpoint();

  React.useEffect(() => {
    if (["2xl"].includes(breakpoint)) {
      setBarOrientation("vertical");
    } else {
      setBarOrientation("vertical");
    }
  }, [breakpoint]);

  const isRoomReady = useIsRoomReady();

  if (!isRoomReady || !showContent) {
    return null;
  }

  if (imageCroppingEnabled) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute flex gap-2 justify-center items-center top-[81px] bottom-[48px] xl:top-[16px]] 2xl:left-[16px] 2xl:bottom-[56px] 2xl:right-auto border-r-[#c9c9c9] pointer-events-none",
        {
          ["left-[508px] 2xl:left-[508px] drop-shadow"]: viewType === "fixed",
          ["!left-[8px] bg-transparent !top-[0px] !bottom-[0px] z-1"]:
            viewType === "floating",
        },
      )}
    >
      <div className="drop-shadow">
        <Toolbar
          orientation={barOrientation}
          className={cn({
            ["!h-[50px]"]: barOrientation === "horizontal",
            ["!w-[50px]"]: barOrientation === "vertical",
          })}
        >
          <MoveToolTrigger
            tooltipSide={barOrientation === "horizontal" ? "top" : "right"}
          />
          <ToolbarButton
            className="rounded-none !w-[40px]"
            icon={<MousePointer className="px-2" size={40} strokeWidth={1} />}
            disabled={!isRoomReady}
            active={actualAction === "selectionTool"}
            onClick={() => triggerTool("selectionTool")}
            label={
              <div className="flex gap-3 justify-start items-center">
                <p>Selection</p>
              </div>
            }
            tooltipSide={barOrientation === "horizontal" ? "top" : "right"}
            tooltipAlign="center"
            size="medium"
          />
          <ToolbarButton
            className="rounded-none !w-[40px]"
            icon={<Eraser className="px-2" size={40} strokeWidth={1} />}
            disabled={!isRoomReady}
            active={actualAction === "eraserTool"}
            onClick={() => triggerTool("eraserTool")}
            label={
              <div className="flex gap-3 justify-start items-center">
                <p>Erase</p>
              </div>
            }
            tooltipSide={barOrientation === "horizontal" ? "top" : "right"}
            tooltipAlign="center"
            size="medium"
          />
          <ToolbarDivider
            orientation={
              barOrientation === "horizontal" ? "vertical" : "horizontal"
            }
          />
          <ToolGroup
            id="shapes"
            items={shapesItems}
            defaultItemId="rectangleTool"
            orientation={barOrientation}
            disabled={!isRoomReady}
            openGroup={openGroup}
            onOpenGroupChange={setOpenGroup}
          />
          <ToolGroup
            id="media"
            items={mediaItems}
            defaultItemId={WEAVE_IMAGE_TOOL_ACTION_NAME}
            orientation={barOrientation}
            disabled={!isRoomReady}
            openGroup={openGroup}
            onOpenGroupChange={setOpenGroup}
          />
          <ToolGroup
            id="text"
            items={textItems}
            defaultItemId="richTextTool"
            orientation={barOrientation}
            disabled={!isRoomReady}
            openGroup={openGroup}
            onOpenGroupChange={setOpenGroup}
          />
          {STICKY_NOTE_ENABLED && (
            <ToolbarButton
              className="rounded-none !w-[40px]"
              icon={SHAPES_TOOLS["stickyNoteTool"].icon}
              disabled={!isRoomReady}
              active={SHAPES_TOOLS["stickyNoteTool"].active()}
              onClick={SHAPES_TOOLS["stickyNoteTool"].onClick}
              label={SHAPES_TOOLS["stickyNoteTool"].label}
              tooltipSide={barOrientation === "horizontal" ? "top" : "right"}
              tooltipAlign="center"
              size="medium"
            />
          )}
          <ToolGroup
            id="other"
            items={otherItems}
            rememberLast={false}
            orientation={barOrientation}
            disabled={!isRoomReady}
            openGroup={openGroup}
            onOpenGroupChange={setOpenGroup}
            fallbackIcon={
              <EllipsisVertical className="px-2" size={40} strokeWidth={1} />
            }
            fallbackLabel="Other tools"
          />
          {/* <ToolbarButton
          className="rounded-none !w-[40px]"
          icon={<MapPinned className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={showMinimap}
          onClick={() => {
            setShowMinimap(!showMinimap);
          }}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Minimap</p>
            </div>
          }
          tooltipSide={barOrientation === "horizontal" ? "top" : "right"}
          tooltipAlign="center"
        />
        <ToolbarDivider orientation={barOrientation === "horizontal" ? "vertical" : "horizontal"} /> */}
          <ToolbarDivider
            orientation={
              barOrientation === "horizontal" ? "vertical" : "horizontal"
            }
          />
          <ToolbarButton
            className="rounded-none !w-[40px]"
            icon={<Undo className="px-2" size={40} strokeWidth={1} />}
            disabled={!canUndo || !isRoomReady}
            onClick={() => {
              if (instance) {
                const actualStore = instance.getStore();
                actualStore.undoStateStep();
              }
            }}
            label={
              <div className="flex gap-3 justify-start items-center">
                <p>Undo latest changes</p>
                {formatForDisplay("Mod+Z")}
              </div>
            }
            tooltipSide={barOrientation === "horizontal" ? "top" : "right"}
            tooltipAlign="center"
            size="medium"
          />
          <ToolbarButton
            className="rounded-none !w-[40px]"
            icon={<Redo className="px-2" size={40} strokeWidth={1} />}
            disabled={!canRedo || !isRoomReady}
            onClick={() => {
              if (instance) {
                const actualStore = instance.getStore();
                actualStore.redoStateStep();
              }
            }}
            label={
              <div className="flex gap-3 justify-start items-center">
                <p>Redo latest changes</p>
                {formatForDisplay("Mod+Y")}
              </div>
            }
            tooltipSide={barOrientation === "horizontal" ? "top" : "right"}
            tooltipAlign="center"
            size="medium"
          />
        </Toolbar>
      </div>
    </div>
  );
}
