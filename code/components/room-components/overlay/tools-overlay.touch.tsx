// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { Vector2d } from "konva/lib/types";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postImage } from "@/api/post-image";
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
  ChevronRight,
  ChevronLeft,
  PencilRuler,
  ListTree,
  SwatchBook,
  Projector,
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
  const room = useCollaborationRoom((state) => state.room);
  const showUI = useCollaborationRoom((state) => state.ui.show);
  const setUploadingImage = useCollaborationRoom(
    (state) => state.setUploadingImage
  );

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

  const queryClient = useQueryClient();

  const mutationUpload = useMutation({
    mutationFn: async (file: File) => {
      return await postImage(room ?? "", file);
    },
  });

  const setShowSelectFileImage = useCollaborationRoom(
    (state) => state.setShowSelectFileImage
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

  React.useEffect(() => {
    const onPasteExternalImage = async ({
      position,
      item,
    }: {
      position: Vector2d;
      item: ClipboardItem;
    }) => {
      let blob: Blob | null = null;
      if (item.types.includes("image/png")) {
        blob = await item.getType("image/png");
      }
      if (item.types.includes("image/jpeg")) {
        blob = await item.getType("image/jpeg");
      }
      if (item.types.includes("image/gif")) {
        blob = await item.getType("image/gif");
      }

      if (!blob) {
        return;
      }

      setUploadingImage(true);
      const file = new File([blob], "external.image");
      mutationUpload.mutate(file, {
        onSuccess: (data) => {
          const room: string = data.fileName.split("/")[0];
          const imageId = data.fileName.split("/")[1];

          const queryKey = ["getImages", room];
          queryClient.invalidateQueries({ queryKey });

          instance?.triggerAction(
            "imageTool",
            {
              position,
              imageURL: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${room}/images/${imageId}`,
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ) as any;
        },
        onError: () => {
          console.error("Error uploading image");
        },
        onSettled: () => {
          setUploadingImage(false);
        },
      });
    };

    if (instance) {
      instance.addEventListener("onPasteExternal", onPasteExternalImage);
    }

    return () => {
      if (instance) {
        instance.removeEventListener("onPasteExternal", onPasteExternalImage);
      }
    };
  }, [
    instance,
    queryClient,
    mutationUpload,
    setShowSelectFileImage,
    setUploadingImage,
  ]);

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
              <p>Add a frame</p>
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
                  setImagesLLMPopupType("create");
                  if (imagesLLMPopupType === "create") {
                    setImagesLLMPopupVisible(!imagesLLMPopupVisible);
                  } else {
                    setImagesLLMPopupVisible(true);
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
