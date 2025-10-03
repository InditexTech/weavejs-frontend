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
  PenTool,
  Square,
  Type,
  MousePointer,
  Tag,
  Undo,
  Redo,
  Eraser,
  Circle,
  Star,
  ArrowUpRight,
  Hexagon,
  ImagePlus,
  ChevronRight,
  ChevronLeft,
  PencilRuler,
  ListTree,
  SwatchBook,
  Projector,
  MessageSquare,
  // MapPinned,
  Frame,
  Video,
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
import { leftElementVariants } from "./variants";
import { SidebarActive, useCollaborationRoom } from "@/store/store";
import { cn } from "@/lib/utils";
import { useKeyboardHandler } from "../hooks/use-keyboard-handler";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { useIACapabilities } from "@/store/ia";
import { MoveToolTrigger } from "./tools-triggers/move-tool";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { ToolbarDivider } from "../toolbar/toolbar-divider";
import { useShapesTools } from "./hooks/use-shapes-tools";
import { useStrokesTools } from "./hooks/use-strokes-tools";
import { useImagesTools } from "./hooks/use-images-tools";
import { useIACapabilitiesV2 } from "@/store/ia-v2";

export function ToolsOverlayTouch() {
  useKeyboardHandler();

  const [actualShapeTool, setActualShapeTool] = React.useState("rectangleTool");
  const [actualStrokesTool, setActualStrokesTool] = React.useState("penTool");
  const [actualImagesTool, setActualImagesTool] = React.useState("imageTool");
  const [shapesMenuOpen, setShapesMenuOpen] = React.useState(false);
  const [strokesMenuOpen, setStrokesMenuOpen] = React.useState(false);
  const [imagesMenuOpen, setImagesMenuOpen] = React.useState(false);
  const [sidebarsMenuOpen, setSidebarsMenuOpen] = React.useState(false);

  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);
  const canUndo = useWeave((state) => state.undoRedo.canUndo);
  const canRedo = useWeave((state) => state.undoRedo.canRedo);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const nodeCreateProps = useCollaborationRoom(
    (state) => state.nodeProperties.createProps
  );
  const imageCroppingEnabled = useCollaborationRoom(
    (state) => state.images.cropping.enabled
  );
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive
  );
  const showUI = useCollaborationRoom((state) => state.ui.show);

  const aiEnabled = useIACapabilities((state) => state.enabled);
  const imagesLLMPopupType = useIACapabilities((state) => state.llmPopup.type);
  const imagesLLMPopupVisible = useIACapabilities(
    (state) => state.llmPopup.visible
  );
  const setImagesLLMPopupType = useIACapabilities(
    (state) => state.setImagesLLMPopupType
  );
  const setImagesLLMPopupVisible = useIACapabilities(
    (state) => state.setImagesLLMPopupVisible
  );
  const aiEnabledV2 = useIACapabilitiesV2((state) => state.enabled);
  const imagesLLMPopupTypeV2 = useIACapabilitiesV2(
    (state) => state.llmPopup.type
  );
  const imagesLLMPopupVisibleV2 = useIACapabilitiesV2(
    (state) => state.llmPopup.visible
  );
  const setImagesLLMPopupTypeV2 = useIACapabilitiesV2(
    (state) => state.setImagesLLMPopupType
  );
  const setImagesLLMPopupVisibleV2 = useIACapabilitiesV2(
    (state) => state.setImagesLLMPopupVisible
  );
  const threadsEnabled = useCollaborationRoom(
    (state) => state.features.threads
  );
  // const showMinimap = useCollaborationRoom((state) => state.ui.minimap);
  // const setShowMinimap = useCollaborationRoom((state) => state.setShowMinimap);

  const sidebarToggle = React.useCallback(
    (element: SidebarActive) => {
      setSidebarActive(element);
    },
    [setSidebarActive]
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
    [instance, actualAction]
  );

  const SHAPES_TOOLS = useShapesTools();
  const STROKES_TOOLS = useStrokesTools();
  const IMAGES_TOOLS = useImagesTools();

  if (!showUI || imageCroppingEnabled) {
    return null;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={leftElementVariants}
      className="pointer-events-none absolute left-[16px] top-[16px] bottom-[16px] flex flex-col gap-2 justify-center items-center"
    >
      <Toolbar orientation="vertical" className="flex 2xl:hidden">
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
          tooltipSide="right"
          tooltipAlign="center"
        />
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
          tooltipSide="right"
          tooltipAlign="center"
        />
        <ToolbarDivider orientation="horizontal" />
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
        <ToolbarDivider orientation="horizontal" /> */}
        <DropdownMenu modal={false} open={sidebarsMenuOpen}>
          <DropdownMenuTrigger
            disabled={
              weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
            }
            className={cn(
              "rounded-none cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
              {
                ["font-normal"]: sidebarsMenuOpen,
                ["font-extralight"]: !sidebarsMenuOpen,
                ["disabled:cursor-default disabled:opacity-50"]:
                  weaveConnectionStatus !==
                  WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
              }
            )}
            asChild
          >
            <ToolbarButton
              className="rounded-full !w-[40px]"
              icon={<PencilRuler className="px-2" size={40} strokeWidth={1} />}
              disabled={
                weaveConnectionStatus !==
                WEAVE_STORE_CONNECTION_STATUS.CONNECTED
              }
              onClick={() => {
                setShapesMenuOpen(false);
                setStrokesMenuOpen(false);
                setImagesMenuOpen(false);
                setSidebarsMenuOpen((prev) => !prev);
              }}
              label={
                <div className="flex gap-3 justify-start items-center">
                  <p>Toolbars</p>
                </div>
              }
              tooltipSide="right"
              tooltipAlign="center"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            onCloseAutoFocus={(e) => {
              e.preventDefault();
            }}
            onFocusOutside={() => {
              setSidebarsMenuOpen(false);
            }}
            align="start"
            side="left"
            alignOffset={0}
            sideOffset={8}
            className="font-inter rounded-none shadow-none"
          >
            <DropdownMenuItem
              className="text-foreground cursor-pointer hover:rounded-none w-full"
              onPointerDown={() => {
                setShapesMenuOpen(false);
                setStrokesMenuOpen(false);
                setImagesMenuOpen(false);
                setSidebarsMenuOpen(false);
                sidebarToggle(SIDEBAR_ELEMENTS.images);
              }}
            >
              <Images /> Images
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-foreground cursor-pointer hover:rounded-none w-full"
              onPointerDown={() => {
                setShapesMenuOpen(false);
                setStrokesMenuOpen(false);
                setImagesMenuOpen(false);
                setSidebarsMenuOpen(false);
                sidebarToggle(SIDEBAR_ELEMENTS.frames);
              }}
            >
              <Projector /> Frames
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-foreground cursor-pointer hover:rounded-none w-full"
              onPointerDown={() => {
                setShapesMenuOpen(false);
                setStrokesMenuOpen(false);
                setImagesMenuOpen(false);
                setSidebarsMenuOpen(false);
                sidebarToggle(SIDEBAR_ELEMENTS.colorTokens);
              }}
            >
              <SwatchBook /> Color tokens
            </DropdownMenuItem>
            {threadsEnabled && (
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onPointerDown={() => {
                  setShapesMenuOpen(false);
                  setStrokesMenuOpen(false);
                  setImagesMenuOpen(false);
                  setSidebarsMenuOpen(false);
                  sidebarToggle(SIDEBAR_ELEMENTS.comments);
                }}
              >
                <MessageSquare /> Comments
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-foreground cursor-pointer hover:rounded-none w-full"
              onPointerDown={() => {
                setShapesMenuOpen(false);
                setStrokesMenuOpen(false);
                setImagesMenuOpen(false);
                setSidebarsMenuOpen(false);
                sidebarToggle(SIDEBAR_ELEMENTS.nodesTree);
              }}
            >
              <ListTree /> Elements tree
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
          icon={<Frame className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "frameTool"}
          onClick={() => triggerTool("frameTool", nodeCreateProps)}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Add a Frame</p>
            </div>
          }
          tooltipSide="right"
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
              <p>Add text</p>
            </div>
          }
          tooltipSide="right"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Video className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          active={actualAction === "videoTool"}
          onClick={() => triggerTool("videoTool")}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Add video</p>
            </div>
          }
          tooltipSide="right"
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
            tooltipSide="right"
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
                }
              )}
              asChild
            >
              <ToolbarButton
                className="rounded-full !w-[20px] absolute bg-white !w-[20px] border border-[#c9c9c9] rounded-none rounded-r-lg left-[44px] top-0"
                icon={
                  imagesMenuOpen ? (
                    <ChevronLeft className="px-0" size={20} strokeWidth={1} />
                  ) : (
                    <ChevronRight className="px-0" size={20} strokeWidth={1} />
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
                  setSidebarsMenuOpen(false);
                }}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>More images tools</p>
                  </div>
                }
                tooltipSide="right"
                tooltipAlign="start"
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
              side="right"
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
                  setSidebarsMenuOpen(false);
                  setActualImagesTool("imageTool");
                  IMAGES_TOOLS["imageTool"].onClick();
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
                  setSidebarsMenuOpen(false);
                  setActualImagesTool("imagesTool");
                  IMAGES_TOOLS["imagesTool"].onClick();
                }}
              >
                <Images size={20} strokeWidth={1} /> Images tool
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                disabled={!aiEnabled}
                onPointerDown={() => {
                  setShapesMenuOpen(false);
                  setStrokesMenuOpen(false);
                  setImagesMenuOpen(false);
                  setSidebarsMenuOpen(false);
                  setActualImagesTool("generateImageTool");

                  if (aiEnabled) {
                    setImagesLLMPopupType("create");
                    if (imagesLLMPopupType === "create") {
                      setImagesLLMPopupVisible(!imagesLLMPopupVisible);
                    } else {
                      setImagesLLMPopupVisible(true);
                    }
                  }

                  if (aiEnabledV2) {
                    setImagesLLMPopupTypeV2("create");
                    if (imagesLLMPopupTypeV2 === "create") {
                      setImagesLLMPopupVisibleV2(!imagesLLMPopupVisibleV2);
                    } else {
                      setImagesLLMPopupVisibleV2(true);
                    }
                  }
                }}
              >
                <ImagePlus size={20} strokeWidth={1} /> Generate Image tool
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
            tooltipSide="right"
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
                }
              )}
              asChild
            >
              <ToolbarButton
                className="rounded-full !w-[20px] absolute bg-white !w-[20px] border border-[#c9c9c9] rounded-none rounded-r-lg left-[44px] top-0"
                icon={
                  strokesMenuOpen ? (
                    <ChevronLeft className="px-0" size={20} strokeWidth={1} />
                  ) : (
                    <ChevronRight className="px-0" size={20} strokeWidth={1} />
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
                  setSidebarsMenuOpen(false);
                }}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>More strokes tools</p>
                  </div>
                }
                tooltipSide="right"
                tooltipAlign="start"
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
              side="right"
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
                  setSidebarsMenuOpen(false);
                  setActualStrokesTool("penTool");
                  STROKES_TOOLS["penTool"].onClick();
                }}
              >
                <PenTool size={20} strokeWidth={1} /> Pen tool
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onPointerDown={() => {
                  setShapesMenuOpen(false);
                  setStrokesMenuOpen(false);
                  setImagesMenuOpen(false);
                  setSidebarsMenuOpen(false);
                  setActualStrokesTool("brushTool");
                  STROKES_TOOLS["brushTool"].onClick();
                }}
              >
                <Brush size={20} strokeWidth={1} /> Brush tool
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onPointerDown={() => {
                  setShapesMenuOpen(false);
                  setStrokesMenuOpen(false);
                  setImagesMenuOpen(false);
                  setSidebarsMenuOpen(false);
                  setActualStrokesTool("arrowTool");
                  STROKES_TOOLS["arrowTool"].onClick();
                }}
              >
                <ArrowUpRight size={20} strokeWidth={1} /> Arrow tool
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
            tooltipSide="right"
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
                }
              )}
              asChild
            >
              <ToolbarButton
                className="rounded-full !w-[20px] absolute bg-white !w-[20px] border border-[#c9c9c9] rounded-none rounded-r-lg left-[44px] top-0"
                icon={
                  shapesMenuOpen ? (
                    <ChevronLeft className="px-0" size={20} strokeWidth={1} />
                  ) : (
                    <ChevronRight className="px-0" size={20} strokeWidth={1} />
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
                  setSidebarsMenuOpen(false);
                }}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>More shapes tools</p>
                  </div>
                }
                tooltipSide="right"
                tooltipAlign="start"
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
              side="right"
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
                  setSidebarsMenuOpen(false);
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
                  setSidebarsMenuOpen(false);
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
                  setSidebarsMenuOpen(false);
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
                  setSidebarsMenuOpen(false);
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
                  setSidebarsMenuOpen(false);
                  setActualShapeTool("colorTokenTool");
                  SHAPES_TOOLS["colorTokenTool"].onClick();
                }}
              >
                <Tag size={20} strokeWidth={1} /> Color Token Reference tool
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ToolbarDivider orientation="horizontal" />
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
          tooltipSide="right"
          tooltipAlign="center"
        />
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
          tooltipSide="right"
          tooltipAlign="center"
        />
        <MoveToolTrigger tooltipSide="right" />
      </Toolbar>
    </motion.div>
  );
}
