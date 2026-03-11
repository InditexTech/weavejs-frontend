// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import {
  Brush,
  Image,
  Images,
  Square,
  Type,
  MousePointer,
  Tag,
  Undo,
  Redo,
  Eraser,
  Circle,
  Star,
  Hexagon,
  // ChevronRight,
  // ChevronLeft,
  MessageSquare,
  ChevronsLeftRightEllipsis,
  // MapPinned,
  LayoutPanelTop,
  Frame,
  Video,
  PenLine,
  RulerDimensionLine,
  MoveUpRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWeave } from "@inditextech/weave-react";
import { Toolbar } from "../toolbar/toolbar";
import { motion } from "framer-motion";
import { bottomElementVariants } from "./variants";
import { SidebarActive, useCollaborationRoom } from "@/store/store";
import { cn } from "@/lib/utils";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { MoveToolTrigger } from "./tools-triggers/move-tool";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { ToolbarDivider } from "../toolbar/toolbar-divider";
import { useShapesTools } from "./hooks/use-shapes-tools";
import { useStrokesTools } from "./hooks/use-strokes-tools";
import { useImagesTools } from "./hooks/use-images-tools";
import { useIAChat } from "@/store/ia-chat";
import {
  WEAVE_IMAGE_TOOL_ACTION_NAME,
  WEAVE_IMAGES_TOOL_ACTION_NAME,
} from "@inditextech/weave-sdk";

export function ToolsOverlayTouch() {
  const [actualShapeTool, setActualShapeTool] = React.useState("rectangleTool");
  const [actualStrokesTool, setActualStrokesTool] =
    React.useState("strokeTool");
  const [actualImagesTool, setActualImagesTool] = React.useState(
    WEAVE_IMAGE_TOOL_ACTION_NAME,
  );
  const [shapesMenuOpen, setShapesMenuOpen] = React.useState(false);
  const [strokesMenuOpen, setStrokesMenuOpen] = React.useState(false);
  const [imagesMenuOpen, setImagesMenuOpen] = React.useState(false);

  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);
  const canUndo = useWeave((state) => state.undoRedo.canUndo);
  const canRedo = useWeave((state) => state.undoRedo.canRedo);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const aiChatEnabled = useIAChat((state) => state.enabled);

  const nodeCreateProps = useCollaborationRoom(
    (state) => state.nodeProperties.createProps,
  );
  const imageCroppingEnabled = useCollaborationRoom(
    (state) => state.images.cropping.enabled,
  );
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive,
  );
  const showUI = useCollaborationRoom((state) => state.ui.show);

  const measurementUnits = useCollaborationRoom(
    (state) => state.measurement.units,
  );
  const measurementReferenceMeasureUnits = useCollaborationRoom(
    (state) => state.measurement.referenceMeasureUnits,
  );
  const measurementReferenceMeasurePixels = useCollaborationRoom(
    (state) => state.measurement.referenceMeasurePixels,
  );

  const threadsEnabled = useCollaborationRoom(
    (state) => state.features.threads,
  );
  const setShowSelectFileVideo = useCollaborationRoom(
    (state) => state.setShowSelectFileVideo,
  );
  // const showMinimap = useCollaborationRoom((state) => state.ui.minimap);
  // const setShowMinimap = useCollaborationRoom((state) => state.setShowMinimap);

  const sidebarToggle = React.useCallback(
    (element: SidebarActive) => {
      setSidebarActive(element);
    },
    [setSidebarActive],
  );

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
  const STROKES_TOOLS = useStrokesTools();
  const IMAGES_TOOLS = useImagesTools();

  if (!showUI || imageCroppingEnabled) {
    return null;
  }

  const barOrientation = "horizontal";

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={bottomElementVariants}
      className={cn(
        "pointer-events-none absolute left-[16px] right-[16px] flex flex-col gap-2 justify-center items-center",
        {
          ["bottom-[148px]"]: aiChatEnabled,
          ["bottom-[16px]"]: !aiChatEnabled,
        },
      )}
    >
      <Toolbar orientation={barOrientation} className="flex !h-[50px]">
        <MoveToolTrigger tooltipSide="top" />
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
              <p>Selection</p>
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
              <p>Erase</p>
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarDivider orientation="vertical" />
        <div className="relative flex gap-0 justify-start items-center">
          <ToolbarButton
            className="rounded-full !w-[40px]"
            icon={SHAPES_TOOLS[actualShapeTool].icon}
            disabled={
              weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
            }
            active={SHAPES_TOOLS[actualShapeTool].active()}
            onClick={SHAPES_TOOLS[actualShapeTool].onClick}
            label={SHAPES_TOOLS[actualShapeTool].label}
            tooltipSide="top"
            tooltipAlign="center"
          />
          <DropdownMenu modal={false} open={shapesMenuOpen}>
            <DropdownMenuTrigger
              disabled={
                weaveConnectionStatus !==
                WEAVE_STORE_CONNECTION_STATUS.CONNECTED
              }
              className={cn(
                "relative rounded-full cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                {
                  ["disabled:cursor-default disabled:opacity-50"]:
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                },
              )}
              asChild
            >
              <ToolbarButton
                className="rounded-full absolute bg-white !w-full !h-[22px] border border-[#c9c9c9] rounded-none rounded-t-lg left-0 top-[-26px]"
                icon={
                  shapesMenuOpen ? (
                    <ChevronDown className="px-0" size={20} strokeWidth={1} />
                  ) : (
                    <ChevronUp className="px-0" size={20} strokeWidth={1} />
                  )
                }
                disabled={
                  weaveConnectionStatus !==
                  WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                }
                onClick={(e) => {
                  e.preventDefault();
                  setShapesMenuOpen((prev) => !prev);
                  setStrokesMenuOpen(false);
                  setImagesMenuOpen(false);
                }}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>More shapes tools</p>
                  </div>
                }
                tooltipSideOffset={4}
                tooltipSide="top"
                tooltipAlign="center"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              onCloseAutoFocus={(e) => {
                e.preventDefault();
              }}
              onFocusOutside={() => {
                setShapesMenuOpen(false);
              }}
              align="start"
              side="top"
              alignOffset={0}
              sideOffset={3}
              className="font-inter rounded-none shadow-none"
            >
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onPointerDown={() => {
                  setShapesMenuOpen(false);
                  setStrokesMenuOpen(false);
                  setImagesMenuOpen(false);
                  setActualShapeTool("rectangleTool");
                  SHAPES_TOOLS["rectangleTool"].onClick();
                }}
              >
                <Square size={20} strokeWidth={1} /> Rectangle tool
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onPointerDown={() => {
                  setShapesMenuOpen(false);
                  setStrokesMenuOpen(false);
                  setImagesMenuOpen(false);
                  setActualShapeTool("ellipseTool");
                  SHAPES_TOOLS["ellipseTool"].onClick();
                }}
              >
                <Circle size={20} strokeWidth={1} /> Ellipse tool
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onPointerDown={() => {
                  setShapesMenuOpen(false);
                  setStrokesMenuOpen(false);
                  setImagesMenuOpen(false);
                  setActualShapeTool("regularPolygonTool");
                  SHAPES_TOOLS["regularPolygonTool"].onClick();
                }}
              >
                <Hexagon size={20} strokeWidth={1} /> Regular Polygon tool
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onPointerDown={() => {
                  setShapesMenuOpen(false);
                  setStrokesMenuOpen(false);
                  setImagesMenuOpen(false);
                  setActualShapeTool("starTool");
                  SHAPES_TOOLS["starTool"].onClick();
                }}
              >
                <Star size={20} strokeWidth={1} /> Star tool
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onPointerDown={() => {
                  setShapesMenuOpen(false);
                  setStrokesMenuOpen(false);
                  setImagesMenuOpen(false);
                  setActualShapeTool("colorTokenTool");
                  SHAPES_TOOLS["colorTokenTool"].onClick();
                }}
              >
                <Tag size={20} strokeWidth={1} /> Color Token Reference tool
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="relative flex gap-0 justify-start items-center">
          <ToolbarButton
            className="rounded-full !w-[40px]"
            icon={STROKES_TOOLS[actualStrokesTool].icon}
            disabled={
              weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
            }
            active={STROKES_TOOLS[actualStrokesTool].active()}
            onClick={STROKES_TOOLS[actualStrokesTool].onClick}
            label={STROKES_TOOLS[actualStrokesTool].label}
            tooltipSide="top"
            tooltipAlign="center"
          />
          <DropdownMenu modal={false} open={strokesMenuOpen}>
            <DropdownMenuTrigger
              disabled={
                weaveConnectionStatus !==
                WEAVE_STORE_CONNECTION_STATUS.CONNECTED
              }
              className={cn(
                "relative rounded-none cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                {
                  ["disabled:cursor-default disabled:opacity-50"]:
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                },
              )}
              asChild
            >
              <ToolbarButton
                className="rounded-full absolute bg-white !w-full !h-[22px] border border-[#c9c9c9] rounded-none rounded-t-lg top-[-26px] left-[0px]"
                icon={
                  strokesMenuOpen ? (
                    <ChevronDown className="px-0" size={20} strokeWidth={1} />
                  ) : (
                    <ChevronUp className="px-0" size={20} strokeWidth={1} />
                  )
                }
                disabled={
                  weaveConnectionStatus !==
                  WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                }
                onClick={() => {
                  setShapesMenuOpen(false);
                  setStrokesMenuOpen((prev) => !prev);
                  setImagesMenuOpen(false);
                }}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>More strokes tools</p>
                  </div>
                }
                tooltipSideOffset={4}
                tooltipSide="top"
                tooltipAlign="center"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              onCloseAutoFocus={(e) => {
                e.preventDefault();
              }}
              onFocusOutside={() => {
                setStrokesMenuOpen(false);
              }}
              align="start"
              side="top"
              alignOffset={0}
              sideOffset={3}
              className="font-inter rounded-none shadow-none"
            >
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onClick={() => {
                  if (!instance) {
                    return;
                  }
                  setShapesMenuOpen(false);
                  setStrokesMenuOpen(false);
                  setImagesMenuOpen(false);
                  setActualStrokesTool("strokeTool");
                  STROKES_TOOLS["strokeTool"].onClick();
                }}
              >
                <PenLine size={20} strokeWidth={1} /> Line tool
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onClick={() => {
                  if (!instance) {
                    return;
                  }
                  setShapesMenuOpen(false);
                  setStrokesMenuOpen(false);
                  setImagesMenuOpen(false);
                  setActualStrokesTool("arrowTool");
                  STROKES_TOOLS["arrowTool"].onClick();
                }}
              >
                <MoveUpRight size={20} strokeWidth={1} /> Arrow tool
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onPointerDown={() => {
                  setShapesMenuOpen(false);
                  setStrokesMenuOpen(false);
                  setImagesMenuOpen(false);
                  setActualStrokesTool("brushTool");
                  STROKES_TOOLS["brushTool"].onClick();
                }}
              >
                <Brush size={20} strokeWidth={1} /> Brush tool
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={
            <ChevronsLeftRightEllipsis
              className="px-2"
              size={40}
              strokeWidth={1}
            />
          }
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "connectorTool"}
          onClick={() => triggerTool("connectorTool", nodeCreateProps)}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Connector Tool</p>
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <div className="relative flex gap-0 justify-start items-center">
          <ToolbarButton
            className="rounded-full !w-[40px]"
            icon={IMAGES_TOOLS[actualImagesTool].icon}
            disabled={
              weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
            }
            active={IMAGES_TOOLS[actualImagesTool].active()}
            onClick={IMAGES_TOOLS[actualImagesTool].onClick}
            label={IMAGES_TOOLS[actualImagesTool].label}
            tooltipSide="top"
            tooltipAlign="center"
          />
          <DropdownMenu modal={false} open={imagesMenuOpen}>
            <DropdownMenuTrigger
              disabled={
                weaveConnectionStatus !==
                WEAVE_STORE_CONNECTION_STATUS.CONNECTED
              }
              className={cn(
                "relative rounded-none cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                {
                  ["disabled:cursor-default disabled:opacity-50"]:
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                },
              )}
              asChild
            >
              <ToolbarButton
                className="rounded-full absolute bg-white !w-full !h-[22px] border border-[#c9c9c9] rounded-none rounded-t-lg left-0 top-[-26px]"
                icon={
                  imagesMenuOpen ? (
                    <ChevronDown className="px-0" size={20} strokeWidth={1} />
                  ) : (
                    <ChevronUp className="px-0" size={20} strokeWidth={1} />
                  )
                }
                disabled={
                  weaveConnectionStatus !==
                  WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                }
                onClick={() => {
                  setShapesMenuOpen(false);
                  setStrokesMenuOpen(false);
                  setImagesMenuOpen((prev) => !prev);
                }}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>More images tools</p>
                  </div>
                }
                tooltipSideOffset={4}
                tooltipSide="top"
                tooltipAlign="center"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              onCloseAutoFocus={(e) => {
                e.preventDefault();
              }}
              onFocusOutside={() => {
                setImagesMenuOpen(false);
              }}
              align="start"
              side="top"
              alignOffset={0}
              sideOffset={3}
              className="font-inter rounded-none shadow-none"
            >
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onPointerDown={() => {
                  setShapesMenuOpen(false);
                  setStrokesMenuOpen(false);
                  setImagesMenuOpen(false);
                  setActualImagesTool(WEAVE_IMAGE_TOOL_ACTION_NAME);
                  IMAGES_TOOLS[WEAVE_IMAGE_TOOL_ACTION_NAME].onClick();
                }}
              >
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image size={20} strokeWidth={1} /> Image tool
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onPointerDown={() => {
                  setShapesMenuOpen(false);
                  setStrokesMenuOpen(false);
                  setImagesMenuOpen(false);
                  setActualImagesTool(WEAVE_IMAGES_TOOL_ACTION_NAME);
                  IMAGES_TOOLS[WEAVE_IMAGES_TOOL_ACTION_NAME].onClick();
                }}
              >
                <Images size={20} strokeWidth={1} /> Images tool
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Video className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "videoTool"}
          onClick={() => {
            triggerTool("videoTool");
            setShowSelectFileVideo(true);
          }}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Video tool</p>
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
          icon={<Frame className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "frameTool"}
          onClick={() => triggerTool("frameTool", nodeCreateProps)}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Frame tool</p>
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<LayoutPanelTop className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "imageTemplateTool"}
          onClick={() => triggerTool("imageTemplateTool")}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Image Template Tool</p>
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        {threadsEnabled && (
          <ToolbarButton
            className="rounded-full !w-[40px]"
            icon={<MessageSquare className="px-2" size={40} strokeWidth={1} />}
            disabled={
              weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
            }
            active={actualAction === "commentTool"}
            onClick={() => {
              triggerTool("commentTool", nodeCreateProps);
              sidebarToggle(SIDEBAR_ELEMENTS.comments);
            }}
            label={
              <div className="flex gap-3 justify-start items-center">
                <p>Comment tool</p>
              </div>
            }
            tooltipSide="top"
            tooltipAlign="center"
          />
        )}
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={
            <RulerDimensionLine className="px-2" size={40} strokeWidth={1} />
          }
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "measureTool"}
          onClick={() => {
            if (!instance) {
              return;
            }
            triggerTool("measureTool", nodeCreateProps);
            const scale = measurementReferenceMeasurePixels
              ? measurementReferenceMeasurePixels /
                measurementReferenceMeasureUnits
              : 1;
            instance.updatePropsAction("measureTool", {
              color: "#FF3366",
              unit: measurementUnits,
              unitPerPixel: scale,
            });
          }}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Measure tool</p>
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        {/* <ToolbarButton
          className="rounded-full !w-[40px]"
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
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarDivider orientation="vertical" /> */}
        <ToolbarDivider orientation="vertical" />
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
    </motion.div>
  );
}
