// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

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
  MessageSquare,
  ChevronsLeftRightEllipsis,
  LayoutPanelTop,
  Video,
  PenLine,
  RulerDimensionLine,
  MoveUpRight,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Frame,
  EllipsisVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useBreakpoint } from "./hooks/use-breakpoint";
import { useIsRoomReady } from "../hooks/use-is-room-ready";

export function ToolsOverlayMain() {
  const [barOrientation, setBarOrientation] = React.useState<
    "horizontal" | "vertical"
  >("horizontal");

  const [actualShapeTool, setActualShapeTool] = React.useState("rectangleTool");
  const [actualMediaTool, setActualMediaTool] = React.useState(
    WEAVE_IMAGE_TOOL_ACTION_NAME,
  );
  const [actualOtherTool, setActualOtherTool] = React.useState<
    string | undefined
  >(undefined);
  const [shapesMenuOpen, setShapesMenuOpen] = React.useState(false);
  const [mediaMenuOpen, setMediaMenuOpen] = React.useState(false);
  const [otherToolsMenuOpen, setOtherToolsMenuOpen] = React.useState(false);

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
  // const showMinimap = useCollaborationRoom((state) => state.ui.minimap);
  // const setShowMinimap = useCollaborationRoom((state) => state.setShowMinimap);

  React.useEffect(() => {
    if (
      actualAction &&
      ![
        "frameTool",
        "commentTool",
        "connectorTool",
        "imageTemplateTool",
        "measureTool",
      ].includes(actualAction)
    ) {
      setActualOtherTool(undefined);
    }
  }, [actualAction]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setActualOtherTool(undefined);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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

  const breakpoint = useBreakpoint();

  React.useEffect(() => {
    if (["2xl"].includes(breakpoint)) {
      setBarOrientation("vertical");
    } else {
      setBarOrientation("vertical");
    }
  }, [breakpoint]);

  const isRoomReady = useIsRoomReady();

  if (imageCroppingEnabled) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute flex gap-2 justify-center items-center top-[81px] bottom-[48px] xl:top-[16px]] 2xl:left-[16px] 2xl:bottom-[56px] 2xl:right-auto border-r-[#c9c9c9]",
        {
          ["left-[408px] 2xl:left-[408px] drop-shadow"]: viewType === "fixed",
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
          <ToolbarButton
            className="rounded-none !w-[40px]"
            icon={SHAPES_TOOLS[actualShapeTool].icon}
            disabled={!isRoomReady}
            active={SHAPES_TOOLS[actualShapeTool].active()}
            onClick={SHAPES_TOOLS[actualShapeTool].onClick}
            label={SHAPES_TOOLS[actualShapeTool].label}
            tooltipSide={barOrientation === "horizontal" ? "top" : "right"}
            tooltipAlign="center"
            size="medium"
          />
          <DropdownMenu modal={false} open={shapesMenuOpen}>
            <DropdownMenuTrigger
              disabled={!isRoomReady}
              className={cn(
                "relative rounded-none cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                {
                  ["disabled:cursor-default disabled:opacity-50"]: !isRoomReady,
                },
              )}
              asChild
            >
              <ToolbarButton
                className={cn(
                  "rounded bg-white w-[32px] ml-[4px] !border-[0.5px] !border-[#c9c9c9]",
                  {
                    ["h-[20px]"]: barOrientation === "vertical",
                  },
                )}
                icon={
                  shapesMenuOpen ? (
                    barOrientation === "horizontal" ? (
                      <ChevronUp className="px-0" size={20} strokeWidth={1} />
                    ) : (
                      <ChevronLeft className="px-0" size={20} strokeWidth={1} />
                    )
                  ) : barOrientation === "horizontal" ? (
                    <ChevronDown className="px-0" size={20} strokeWidth={1} />
                  ) : (
                    <ChevronRight className="px-0" size={20} strokeWidth={1} />
                  )
                }
                disabled={!isRoomReady}
                onClick={(e) => {
                  e.preventDefault();
                  setShapesMenuOpen((prev) => !prev);
                  setMediaMenuOpen(false);
                  setOtherToolsMenuOpen(false);
                }}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>More shapes tools</p>
                  </div>
                }
                size="small"
                tooltipSideOffset={14}
                tooltipSide={barOrientation === "horizontal" ? "top" : "right"}
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
              side={barOrientation === "horizontal" ? "top" : "right"}
              alignOffset={-45}
              sideOffset={14}
              className="font-inter rounded-none shadow-none"
            >
              <DropdownMenuLabel className="font-light text-xs">
                Shapes
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onPointerDown={() => {
                  setShapesMenuOpen(false);
                  setMediaMenuOpen(false);
                  setOtherToolsMenuOpen(false);
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
                  setMediaMenuOpen(false);
                  setOtherToolsMenuOpen(false);
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
                  setMediaMenuOpen(false);
                  setOtherToolsMenuOpen(false);
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
                  setMediaMenuOpen(false);
                  setOtherToolsMenuOpen(false);
                  setActualShapeTool("starTool");
                  SHAPES_TOOLS["starTool"].onClick();
                }}
              >
                <Star size={20} strokeWidth={1} /> Star tool
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="font-light text-xs">
                Lines
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onClick={() => {
                  if (!instance) {
                    return;
                  }
                  setShapesMenuOpen(false);
                  setMediaMenuOpen(false);
                  setOtherToolsMenuOpen(false);
                  setActualShapeTool("strokeTool");
                  SHAPES_TOOLS["strokeTool"].onClick();
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
                  setMediaMenuOpen(false);
                  setOtherToolsMenuOpen(false);
                  setActualShapeTool("arrowTool");
                  SHAPES_TOOLS["arrowTool"].onClick();
                }}
              >
                <MoveUpRight size={20} strokeWidth={1} /> Arrow tool
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onPointerDown={() => {
                  setShapesMenuOpen(false);
                  setMediaMenuOpen(false);
                  setOtherToolsMenuOpen(false);
                  setActualShapeTool("brushTool");
                  SHAPES_TOOLS["brushTool"].onClick();
                }}
              >
                <Brush size={20} strokeWidth={1} /> Brush tool
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ToolbarButton
            className="rounded-none !w-[40px]"
            icon={MEDIA_TOOLS[actualMediaTool].icon}
            disabled={!isRoomReady}
            active={MEDIA_TOOLS[actualMediaTool].active()}
            onClick={MEDIA_TOOLS[actualMediaTool].onClick}
            label={MEDIA_TOOLS[actualMediaTool].label}
            tooltipSide={barOrientation === "horizontal" ? "top" : "right"}
            tooltipAlign="center"
            size="medium"
          />
          <DropdownMenu modal={false} open={mediaMenuOpen}>
            <DropdownMenuTrigger
              disabled={!isRoomReady}
              className={cn(
                "relative rounded-none cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                {
                  ["disabled:cursor-default disabled:opacity-50"]: !isRoomReady,
                },
              )}
              asChild
            >
              <ToolbarButton
                className={cn(
                  "rounded bg-white w-[32px] ml-[4px] !border-[0.5px] !border-[#c9c9c9]",
                  {
                    ["h-[20px]"]: barOrientation === "vertical",
                  },
                )}
                icon={
                  mediaMenuOpen ? (
                    barOrientation === "horizontal" ? (
                      <ChevronUp className="px-0" size={20} strokeWidth={1} />
                    ) : (
                      <ChevronLeft className="px-0" size={20} strokeWidth={1} />
                    )
                  ) : barOrientation === "horizontal" ? (
                    <ChevronDown className="px-0" size={20} strokeWidth={1} />
                  ) : (
                    <ChevronRight className="px-0" size={20} strokeWidth={1} />
                  )
                }
                disabled={!isRoomReady}
                onClick={() => {
                  setShapesMenuOpen(false);
                  setMediaMenuOpen((prev) => !prev);
                  setOtherToolsMenuOpen(false);
                }}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>More media tools</p>
                  </div>
                }
                size="small"
                tooltipSideOffset={14}
                tooltipSide={barOrientation === "horizontal" ? "top" : "right"}
                tooltipAlign="center"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              onCloseAutoFocus={(e) => {
                e.preventDefault();
              }}
              onFocusOutside={() => {
                setMediaMenuOpen(false);
              }}
              align="start"
              side={barOrientation === "horizontal" ? "top" : "right"}
              alignOffset={-45}
              sideOffset={14}
              className="font-inter rounded-none shadow-none"
            >
              <DropdownMenuLabel className="font-light text-xs">
                Static media
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onPointerDown={() => {
                  setShapesMenuOpen(false);
                  setMediaMenuOpen(false);
                  setOtherToolsMenuOpen(false);
                  setActualMediaTool(WEAVE_IMAGE_TOOL_ACTION_NAME);
                  MEDIA_TOOLS[WEAVE_IMAGE_TOOL_ACTION_NAME].onClick();
                }}
              >
                <Image size={20} strokeWidth={1} /> Image tool
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onPointerDown={() => {
                  setShapesMenuOpen(false);
                  setMediaMenuOpen(false);
                  setOtherToolsMenuOpen(false);
                  setActualMediaTool(WEAVE_IMAGES_TOOL_ACTION_NAME);
                  MEDIA_TOOLS[WEAVE_IMAGES_TOOL_ACTION_NAME].onClick();
                }}
              >
                <Images size={20} strokeWidth={1} /> Images tool
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="font-light text-xs">
                Dynamic media
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onPointerDown={() => {
                  setShapesMenuOpen(false);
                  setMediaMenuOpen(false);
                  setOtherToolsMenuOpen(false);
                  setActualOtherTool("videoTool");
                  OTHER_TOOLS["videoTool"].onClick();
                }}
              >
                <Video size={20} strokeWidth={1} /> Video tool
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ToolbarButton
            className="rounded-none !w-[40px]"
            icon={<Type className="px-2" size={40} strokeWidth={1} />}
            disabled={!isRoomReady}
            active={actualAction === "textTool"}
            onClick={() => triggerTool("textTool")}
            label={
              <div className="flex gap-3 justify-start items-center">
                <p>Text tool</p>
              </div>
            }
            tooltipSide={barOrientation === "horizontal" ? "top" : "right"}
            tooltipAlign="center"
            size="medium"
          />
          <div className="relative flex gap-0 justify-start items-center">
            <DropdownMenu modal={false} open={otherToolsMenuOpen}>
              <DropdownMenuTrigger
                disabled={!isRoomReady}
                className={cn(
                  "relative rounded-none cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                  {
                    ["disabled:cursor-default disabled:opacity-50"]:
                      !isRoomReady,
                  },
                )}
                asChild
              >
                <ToolbarButton
                  className="rounded-none !w-[40px]"
                  icon={
                    actualOtherTool ? (
                      OTHER_TOOLS[actualOtherTool].icon
                    ) : (
                      <EllipsisVertical
                        className="px-2"
                        size={40}
                        strokeWidth={1}
                      />
                    )
                  }
                  disabled={!isRoomReady}
                  active={
                    actualOtherTool
                      ? OTHER_TOOLS[actualOtherTool].active()
                      : undefined
                  }
                  onClick={
                    actualOtherTool
                      ? OTHER_TOOLS[actualOtherTool].onClick
                      : () => {
                          setShapesMenuOpen(false);
                          setMediaMenuOpen(false);
                          setOtherToolsMenuOpen((prev) => !prev);
                        }
                  }
                  label={
                    actualOtherTool
                      ? OTHER_TOOLS[actualOtherTool].label
                      : "Other tools"
                  }
                  tooltipSide={
                    barOrientation === "horizontal" ? "top" : "right"
                  }
                  tooltipAlign="center"
                  size="medium"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                onCloseAutoFocus={(e) => {
                  e.preventDefault();
                }}
                onFocusOutside={() => {
                  setOtherToolsMenuOpen(false);
                }}
                align="start"
                side={barOrientation === "horizontal" ? "top" : "right"}
                alignOffset={0}
                sideOffset={12}
                className="font-inter rounded-none shadow-none"
              >
                <DropdownMenuLabel className="font-light text-xs">
                  Elements
                </DropdownMenuLabel>
                <DropdownMenuItem
                  className="text-foreground cursor-pointer hover:rounded-none w-full"
                  onPointerDown={() => {
                    setShapesMenuOpen(false);
                    setMediaMenuOpen(false);
                    setOtherToolsMenuOpen(false);
                    setActualOtherTool("videoTool");
                    OTHER_TOOLS["videoTool"].onClick();
                  }}
                >
                  <Video size={20} strokeWidth={1} /> Video tool
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-foreground cursor-pointer hover:rounded-none w-full"
                  onPointerDown={() => {
                    setShapesMenuOpen(false);
                    setMediaMenuOpen(false);
                    setOtherToolsMenuOpen(false);
                    setActualShapeTool("colorTokenTool");
                    SHAPES_TOOLS["colorTokenTool"].onClick();
                  }}
                >
                  <Tag size={20} strokeWidth={1} /> Color Reference tool
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-light text-xs">
                  Layout
                </DropdownMenuLabel>
                <DropdownMenuItem
                  className="text-foreground cursor-pointer hover:rounded-none w-full"
                  onPointerDown={() => {
                    setShapesMenuOpen(false);
                    setMediaMenuOpen(false);
                    setOtherToolsMenuOpen(false);
                    setActualOtherTool("frameTool");
                    OTHER_TOOLS["frameTool"].onClick();
                  }}
                >
                  <Frame size={20} strokeWidth={1} /> Frame tool
                </DropdownMenuItem>
                {threadsEnabled && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="font-light text-xs">
                      Collaboration
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      className="text-foreground cursor-pointer hover:rounded-none w-full"
                      onPointerDown={() => {
                        setShapesMenuOpen(false);
                        setMediaMenuOpen(false);
                        setOtherToolsMenuOpen(false);
                        setActualOtherTool("commentTool");
                        OTHER_TOOLS["commentTool"].onClick();
                      }}
                    >
                      <MessageSquare size={20} strokeWidth={1} /> Comment tool
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-light text-xs">
                  Other
                </DropdownMenuLabel>
                <DropdownMenuItem
                  className="text-foreground cursor-pointer hover:rounded-none w-full"
                  onPointerDown={() => {
                    setShapesMenuOpen(false);
                    setMediaMenuOpen(false);
                    setOtherToolsMenuOpen(false);
                    setActualOtherTool("connectorTool");
                    OTHER_TOOLS["connectorTool"].onClick();
                  }}
                >
                  <ChevronsLeftRightEllipsis size={20} strokeWidth={1} />{" "}
                  Connector tool
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-foreground cursor-pointer hover:rounded-none w-full"
                  onPointerDown={() => {
                    setShapesMenuOpen(false);
                    setMediaMenuOpen(false);
                    setOtherToolsMenuOpen(false);
                    setActualOtherTool("imageTemplateTool");
                    OTHER_TOOLS["imageTemplateTool"].onClick();
                  }}
                >
                  <LayoutPanelTop size={20} strokeWidth={1} /> Image Template
                  tool
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-foreground cursor-pointer hover:rounded-none w-full"
                  onPointerDown={() => {
                    setShapesMenuOpen(false);
                    setMediaMenuOpen(false);
                    setOtherToolsMenuOpen(false);
                    setActualOtherTool("measureTool");
                    OTHER_TOOLS["measureTool"].onClick();
                  }}
                >
                  <RulerDimensionLine size={20} strokeWidth={1} /> Measure tool
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
