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
  Frame,
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
  PencilRuler,
  ListTree,
  SwatchBook,
  Projector,
  ChevronDown,
  ChevronUp,
  ListTodo,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { useWeave } from "@inditextech/weave-react";
import { Toolbar } from "../toolbar/toolbar";
import { motion } from "framer-motion";
import { topElementVariants } from "./variants";
import { SidebarActive, useCollaborationRoom } from "@/store/store";
import { ShortcutElement } from "../help/shortcut-element";
import { cn, SYSTEM_OS } from "@/lib/utils";
import { useKeyboardHandler } from "../hooks/use-keyboard-handler";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { useIACapabilities } from "@/store/ia";
import { MoveToolTrigger } from "./tools-triggers/move-tool";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { ToolbarDivider } from "../toolbar/toolbar-divider";
import { useShapesTools } from "./hooks/use-shapes-tools";
import { useStrokesTools } from "./hooks/use-strokes-tools";
import { useImagesTools } from "./hooks/use-images-tools";

export function ToolsOverlayMouse() {
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
      variants={topElementVariants}
      className="pointer-events-none absolute left-[16px] right-[16px] bottom-[16px] flex flex-col gap-2 justify-center items-center"
    >
      <Toolbar orientation="horizontal" className="hidden 2xl:flex">
        <MoveToolTrigger />
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
              <p>Selection tool</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "S",
                  [SYSTEM_OS.OTHER]: "S",
                }}
              />
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
              <p>Erase tool</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "D",
                  [SYSTEM_OS.OTHER]: "D",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
        <ToolbarDivider />
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
                className="rounded-full !w-[40px] !h-[20px] absolute bg-white !w-[40px] border border-[#c9c9c9] rounded-t-lg rounded-br-none rounded-bl-none left-0 top-[-24px]"
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
                  setSidebarsMenuOpen(false);
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
              onFocusOutside={() => {
                setShapesMenuOpen(false);
              }}
              onCloseAutoFocus={(e) => {
                e.preventDefault();
              }}
              align="start"
              side="bottom"
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
                  setSidebarsMenuOpen(false);
                  setActualShapeTool("rectangleTool");
                  SHAPES_TOOLS["rectangleTool"].onClick();
                }}
              >
                <Square size={20} strokeWidth={1} /> Rectangle tool
                <DropdownMenuShortcut>R</DropdownMenuShortcut>
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
                  setSidebarsMenuOpen(false);
                  setActualShapeTool("ellipseTool");
                  SHAPES_TOOLS["ellipseTool"].onClick();
                }}
              >
                <Circle size={20} strokeWidth={1} /> Ellipse tool
                <DropdownMenuShortcut>E</DropdownMenuShortcut>
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
                  setSidebarsMenuOpen(false);
                  setActualShapeTool("regularPolygonTool");
                  SHAPES_TOOLS["regularPolygonTool"].onClick();
                }}
              >
                <Hexagon size={20} strokeWidth={1} /> Regular Polygon tool
                <DropdownMenuShortcut>P</DropdownMenuShortcut>
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
                  setSidebarsMenuOpen(false);
                  setActualShapeTool("starTool");
                  SHAPES_TOOLS["starTool"].onClick();
                }}
              >
                <Star size={20} strokeWidth={1} /> Star tool
                <DropdownMenuShortcut>J</DropdownMenuShortcut>
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
                  setSidebarsMenuOpen(false);
                  setActualShapeTool("colorTokenTool");
                  SHAPES_TOOLS["colorTokenTool"].onClick();
                }}
              >
                <Tag size={20} strokeWidth={1} /> Color Token Reference tool
                <DropdownMenuShortcut>K</DropdownMenuShortcut>
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
                }
              )}
              asChild
            >
              <ToolbarButton
                className="rounded-full !w-[40px] !h-[20px] absolute bg-white !w-[40px] border border-[#c9c9c9] rounded-t-lg rounded-br-none rounded-bl-none left-0 top-[-24px]"
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
                  setSidebarsMenuOpen(false);
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
              side="bottom"
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
                  setSidebarsMenuOpen(false);
                  setActualStrokesTool("penTool");
                  STROKES_TOOLS["penTool"].onClick();
                }}
              >
                <PenTool size={20} strokeWidth={1} /> Pen tool
                <DropdownMenuShortcut>L</DropdownMenuShortcut>
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
                  setSidebarsMenuOpen(false);
                  setActualStrokesTool("brushTool");
                  STROKES_TOOLS["brushTool"].onClick();
                }}
              >
                <Brush size={20} strokeWidth={1} /> Brush tool
                <DropdownMenuShortcut>B</DropdownMenuShortcut>
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
                  setSidebarsMenuOpen(false);
                  setActualStrokesTool("arrowTool");
                  STROKES_TOOLS["arrowTool"].onClick();
                }}
              >
                <ArrowUpRight size={20} strokeWidth={1} /> Arrow tool
                <DropdownMenuShortcut>A</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
                }
              )}
              asChild
            >
              <ToolbarButton
                className="rounded-full !w-[40px] !h-[20px] absolute bg-white !w-[40px] border border-[#c9c9c9] rounded-t-lg rounded-br-none rounded-bl-none left-0 top-[-24px]"
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
                  setSidebarsMenuOpen(false);
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
              side="bottom"
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
                  setSidebarsMenuOpen(false);
                  setActualImagesTool("imageTool");
                  IMAGES_TOOLS["imageTool"].onClick();
                }}
              >
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image size={20} strokeWidth={1} /> Image tool
                <DropdownMenuShortcut>I</DropdownMenuShortcut>
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
                  setSidebarsMenuOpen(false);
                  setActualImagesTool("imagesTool");
                  IMAGES_TOOLS["imagesTool"].onClick();
                }}
              >
                <Images size={20} strokeWidth={1} /> Images tool
                <DropdownMenuShortcut>O</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                disabled={!aiEnabled}
                onClick={() => {
                  setShapesMenuOpen(false);
                  setStrokesMenuOpen(false);
                  setImagesMenuOpen(false);
                  setSidebarsMenuOpen(false);

                  setActualImagesTool("generateImageTool");
                  setImagesLLMPopupType("create");
                  if (imagesLLMPopupType === "create") {
                    setImagesLLMPopupVisible(!imagesLLMPopupVisible);
                  } else {
                    setImagesLLMPopupVisible(true);
                  }
                }}
              >
                <ImagePlus size={20} strokeWidth={1} /> Generate Image tool
                <DropdownMenuShortcut>G</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "T",
                  [SYSTEM_OS.OTHER]: "T",
                }}
              />
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
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "F",
                  [SYSTEM_OS.OTHER]: "F",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
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
                  <ShortcutElement
                    shortcuts={{
                      [SYSTEM_OS.MAC]: "⌘ Z",
                      [SYSTEM_OS.OTHER]: "Ctrl Z",
                    }}
                  />
                </div>
              }
              tooltipSide="top"
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
            side="bottom"
            alignOffset={0}
            sideOffset={8}
            className="font-inter rounded-none shadow-none"
          >
            <DropdownMenuItem
              className="text-foreground cursor-pointer hover:rounded-none w-full"
              onClick={() => {
                setShapesMenuOpen(false);
                setStrokesMenuOpen(false);
                setImagesMenuOpen(false);
                setSidebarsMenuOpen(false);
                sidebarToggle(SIDEBAR_ELEMENTS.images);
              }}
            >
              <Images /> Images
              <DropdownMenuShortcut>
                {SYSTEM_OS.MAC ? "⌥ ⌘ I" : "Alt Ctrl I"}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-foreground cursor-pointer hover:rounded-none w-full"
              onClick={() => {
                setShapesMenuOpen(false);
                setStrokesMenuOpen(false);
                setImagesMenuOpen(false);
                setSidebarsMenuOpen(false);
                sidebarToggle(SIDEBAR_ELEMENTS.frames);
              }}
            >
              <Projector /> Frames
              <DropdownMenuShortcut>
                {SYSTEM_OS.MAC ? "⌥ ⌘ F" : "Alt Ctrl F"}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-foreground cursor-pointer hover:rounded-none w-full"
              onClick={() => {
                setShapesMenuOpen(false);
                setStrokesMenuOpen(false);
                setImagesMenuOpen(false);
                setSidebarsMenuOpen(false);
                sidebarToggle(SIDEBAR_ELEMENTS.colorTokens);
              }}
            >
              <SwatchBook /> Color tokens
              <DropdownMenuShortcut>
                {SYSTEM_OS.MAC ? "⌥ ⌘ O" : "Alt Ctrl O"}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-foreground cursor-pointer hover:rounded-none w-full"
              onClick={() => {
                setShapesMenuOpen(false);
                setStrokesMenuOpen(false);
                setImagesMenuOpen(false);
                setSidebarsMenuOpen(false);
                sidebarToggle(SIDEBAR_ELEMENTS.nodesTree);
              }}
            >
              <ListTree /> Elements tree
              <DropdownMenuShortcut>
                {SYSTEM_OS.MAC ? "⌥ ⌘ E" : "Alt Ctrl E"}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-foreground cursor-pointer hover:rounded-none w-full"
              onPointerDown={() => {
                setShapesMenuOpen(false);
                setStrokesMenuOpen(false);
                setImagesMenuOpen(false);
                setSidebarsMenuOpen(false);
                sidebarToggle(SIDEBAR_ELEMENTS.aiTasks);
              }}
            >
              <ListTodo /> Tasks
              <DropdownMenuShortcut>
                {SYSTEM_OS.MAC ? "⌥ ⌘ T" : "Alt Ctrl T"}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ToolbarDivider />
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
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "⌘ Z",
                  [SYSTEM_OS.OTHER]: "Ctrl Z",
                }}
              />
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
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "⌘ Y",
                  [SYSTEM_OS.OTHER]: "Ctrl Y",
                }}
              />
            </div>
          }
          tooltipSide="top"
          tooltipAlign="center"
        />
      </Toolbar>
    </motion.div>
  );
}
