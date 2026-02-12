// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { WeaveStateElement } from "@inditextech/weave-types";
import React from "react";
import Konva from "konva";
import { Checkbox } from "@/components/ui/checkbox";
import { useCollaborationRoom } from "@/store/store";
import { useWeave } from "@inditextech/weave-react";
import {
  Loader2Icon,
  Download,
  Presentation,
  SkipBack,
  SkipForward,
  SquareCheck,
  StepBack,
  StepForward,
  XIcon,
} from "lucide-react";
import { generatePresentation, PresentationImage, toImageAsync } from "./utils";
import { FrameImage } from "./frames-library.image";
import { FramePresentationImage } from "./frames-library.presentation-image";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarSelector } from "../sidebar-selector";
import { SidebarHeader } from "../sidebar-header";
import { cn } from "@/lib/utils";

export const FramesLibrary = () => {
  const instance = useWeave((state) => state.instance);
  const appState = useWeave((state) => state.appState);

  const sidebarActive = useCollaborationRoom((state) => state.sidebar.active);
  const setFramePages = useCollaborationRoom((state) => state.setFramesPages);
  const setFramesExportVisible = useCollaborationRoom(
    (state) => state.setFramesExportVisible,
  );
  const exporting = useCollaborationRoom(
    (state) => state.frames.export.exporting,
  );

  const [framesAvailable, setFramesAvailable] = React.useState<Konva.Node[]>(
    [],
  );
  const [framesImages, setFramesImages] = React.useState<
    Record<string, HTMLImageElement>
  >({});
  const [loadingFrames, setLoadingFrames] = React.useState<boolean>(false);
  const [presentationMode, setPresentationMode] =
    React.useState<boolean>(false);
  const [presentationImagesLoaded, setPresentationImagesLoaded] =
    React.useState<boolean>(false);
  const [presentationImages, setPresentationImages] = React.useState<
    PresentationImage[]
  >([]);
  const [actualFrame, setActualFrame] = React.useState<number>(0);
  const [selectedFrames, setSelectedFrames] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!instance) {
      return;
    }

    const stage = instance.getStage();

    if (!stage) {
      return [];
    }

    if (sidebarActive === SIDEBAR_ELEMENTS.frames) {
      const nodes = instance.findNodesByType(
        appState.weave as WeaveStateElement,
        "frame",
      );

      const frames: Konva.Node[] = [];
      for (const node of nodes) {
        const ele = stage.findOne(`#${node.key}`);
        if (ele) {
          frames.push(ele);
        }
      }

      setLoadingFrames(true);
      setFramesAvailable(frames);
    } else {
      setFramesAvailable([]);
    }
  }, [instance, appState, sidebarActive]);

  React.useEffect(() => {
    const loadImage = async (node: Konva.Node) => {
      if (!instance) return;

      const nodeAttrs = node.getAttrs();
      try {
        const bounds = instance.getExportBoundingBox([nodeAttrs.containerId]);
        const img = await toImageAsync(node, {
          x: bounds.x,
          y: bounds.y,
          pixelRatio: 3,
          width: bounds.width,
          height: bounds.height,
        });
        setFramesImages((prev) => ({ ...prev, [nodeAttrs.id ?? ""]: img }));
      } catch (ex) {
        console.error(ex);
      }
    };

    const loadImages = async () => {
      const images = framesAvailable.map((frame) => loadImage(frame));
      await Promise.allSettled(images);
      setLoadingFrames(false);
    };

    if (loadingFrames) {
      setTimeout(() => {
        loadImages();
      }, 50);
    }
  }, [instance, framesAvailable, loadingFrames]);

  const exportFramesHandler = React.useCallback(async () => {
    if (!instance) {
      return;
    }

    const stage = instance.getStage();

    let framesToRender = selectedFrames;
    if (framesToRender.length === 0) {
      framesToRender = framesAvailable.map((e) => e.getAttrs().id ?? "");
    }

    const pdfPages: { title: string; nodes: string[] }[] = [];
    for (const frameId of selectedFrames) {
      const node = stage.findOne(`#${frameId}`) as Konva.Group | undefined;
      if (node) {
        const containerId = node.getAttrs().containerId;
        const title = node.getAttrs().title;

        pdfPages.push({
          title,
          nodes: [containerId],
        });
      }
    }

    setFramePages(pdfPages);
    setFramesExportVisible(true);
  }, [
    instance,
    selectedFrames,
    framesAvailable,
    setFramePages,
    setFramesExportVisible,
  ]);

  const actualImagePresentation = React.useMemo(() => {
    return presentationImages[actualFrame];
  }, [actualFrame, presentationImages]);

  React.useEffect(() => {
    if (!instance) return;

    async function setupPresentation() {
      if (!instance) return;

      const images = await generatePresentation(instance, framesAvailable);
      setPresentationImages(images);
      setPresentationImagesLoaded(true);
    }

    if (presentationMode && !presentationImagesLoaded) {
      setupPresentation();
    }
    if (!presentationMode) {
      setPresentationImagesLoaded(false);
    }
  }, [instance, framesAvailable, presentationMode, presentationImagesLoaded]);

  if (!instance) {
    return null;
  }

  if (sidebarActive !== SIDEBAR_ELEMENTS.frames) {
    return null;
  }

  return (
    <>
      <div className="w-full h-full">
        <SidebarHeader
          actions={
            <>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="group cursor-pointer bg-transparent disabled:cursor-default hover:disabled:bg-transparent w-[20px] h-[32px] hover:text-[#c9c9c9]"
                      disabled={selectedFrames.length === 0}
                      onClick={() => {
                        setActualFrame(0);
                        setPresentationMode((prev) => !prev);
                      }}
                    >
                      <Presentation
                        className="group-disabled:text-[#cccccc]"
                        size={20}
                        strokeWidth={1}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="rounded-none"
                  >
                    Presentation mode
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="cursor-pointer bg-transparent w-[20px] h-[32px] hover:text-[#c9c9c9]"
                      onClick={() => {
                        if (selectedFrames.length === 0) {
                          const frames = framesAvailable.map((frame) => {
                            const attrs = frame.getAttrs();
                            return attrs.id ?? "";
                          });
                          setSelectedFrames(frames);
                        } else {
                          setSelectedFrames([]);
                        }
                      }}
                    >
                      <SquareCheck size={20} strokeWidth={1} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="rounded-none"
                  >
                    Select all frames
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="group cursor-pointer bg-transparent disabled:cursor-default hover:disabled:bg-transparent w-[20px] h-[32px] hover:text-[#c9c9c9]"
                      disabled={selectedFrames.length === 0 || exporting}
                      onClick={exportFramesHandler}
                    >
                      <Download
                        className="group-disabled:text-[#cccccc]"
                        size={20}
                        strokeWidth={1}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="rounded-none"
                  >
                    Export as PDF
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          }
        >
          <SidebarSelector title="Frames" />
        </SidebarHeader>
        <ScrollArea className="w-full h-[calc(100%-65px-73px)]">
          <div
            className={cn("flex flex-col gap-[24px] w-full h-full", {
              ["p-0"]:
                loadingFrames ||
                (!loadingFrames && framesAvailable.length === 0),
              ["p-[24px]"]: !loadingFrames && framesAvailable.length > 0,
            })}
          >
            {loadingFrames && (
              <div className="col-span-1 w-full h-full mt-[24px] flex flex-col justify-center items-center text-sm text-center font-inter font-light">
                <b className="font-normal text-[18px]">Loading frames</b>
                <span className="text-[14px]">Please wait...</span>
              </div>
            )}
            {!loadingFrames && framesAvailable.length === 0 && (
              <div className="col-span-1 w-full h-full mt-[24px] flex flex-col justify-center items-center text-sm text-center font-inter font-light">
                <b className="font-normal text-[18px]">No frames created</b>
                <span className="text-[14px]">
                  Add a frame to the whiteboard
                </span>
              </div>
            )}
            {!loadingFrames &&
              framesAvailable.map((node) => {
                const attrs = node.getAttrs();

                return (
                  <div
                    key={attrs.id}
                    className="w-full bg-light-background-1 flex flex-col gap-3"
                  >
                    <div className="w-full flex justify-between items-center">
                      <div className="w-full text-[14px] font-inter font-light">
                        {attrs.title}
                      </div>
                      <div className="font-label-l-regular">
                        <Checkbox
                          className="cursor-pointer rounded-none"
                          checked={
                            selectedFrames.findIndex((e) => e === attrs.id) !==
                            -1
                          }
                          onCheckedChange={() => {
                            setSelectedFrames((prev) => {
                              const newElements = new Set(prev);
                              if (newElements.has(attrs.id ?? "")) {
                                newElements.delete(attrs.id ?? "");
                              } else {
                                newElements.add(attrs.id ?? "");
                              }
                              return Array.from(newElements);
                            });
                          }}
                        />
                      </div>
                    </div>
                    <FrameImage
                      image={framesImages[node.getAttrs().id ?? ""]}
                    />
                  </div>
                );
              })}
          </div>
        </ScrollArea>
      </div>
      {presentationMode && (
        <div className="fixed z-10 top-0 left-0 right-0 bottom-0 bg-black flex flex-col gap-3 justify-center items-start">
          <div className="absolute top-[16px] right-[16px] flex justify-end items-center p-1">
            <div className="flex justify-end items-center bg-white">
              <button
                className="cursor-pointer bg-transparent hover:bg-accent p-2"
                onClick={() => {
                  setPresentationMode((prev) => !prev);
                }}
              >
                <XIcon size={24} />
              </button>
            </div>
          </div>
          {presentationImagesLoaded && (
            <div className="absolute bottom-[16px] left-[16px] right-[16px] flex justify-center items-center">
              <div className="flex justify-center items-center  p-1">
                <div className="flex justify-end items-center bg-white border border-zinc-200 p-1 rounded-full">
                  <button
                    className="group cursor-pointer bg-transparent disabled:cursor-default hover:disabled:bg-transparent hover:bg-accent p-2 rounded-full hover:text-[#666666]"
                    disabled={presentationImagesLoaded && actualFrame === 0}
                    onClick={() => {
                      setActualFrame(0);
                    }}
                  >
                    <SkipBack
                      className="group-disabled:text-accent"
                      strokeWidth={1}
                      size={24}
                    />
                  </button>
                  <button
                    className="group cursor-pointer bg-transparent disabled:cursor-default hover:disabled:bg-transparent hover:bg-accent p-2 rounded-full"
                    disabled={presentationImagesLoaded && actualFrame === 0}
                    onClick={() => {
                      setActualFrame((prev) => prev - 1);
                    }}
                  >
                    <StepBack
                      className="group-disabled:text-accent"
                      strokeWidth={1}
                      size={24}
                    />
                  </button>
                  <button
                    className="group cursor-pointer bg-transparent disabled:cursor-default hover:disabled:bg-transparent hover:bg-accent p-2 rounded-full"
                    disabled={
                      presentationImagesLoaded &&
                      actualFrame === selectedFrames.length - 1
                    }
                    onClick={() => {
                      setActualFrame((prev) => prev + 1);
                    }}
                  >
                    <StepForward
                      className="group-disabled:text-accent"
                      strokeWidth={1}
                      size={24}
                    />
                  </button>
                  <button
                    className="group cursor-pointer bg-transparent disabled:cursor-default hover:disabled:bg-transparent hover:bg-accent p-2 rounded-full"
                    disabled={
                      presentationImagesLoaded &&
                      actualFrame === selectedFrames.length - 1
                    }
                    onClick={() => {
                      setActualFrame(selectedFrames.length - 1);
                    }}
                  >
                    <SkipForward
                      className="group-disabled:text-accent"
                      strokeWidth={1}
                      size={24}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="w-full h-full bg-black flex justify-center items-center">
            {!presentationImagesLoaded && (
              <div className="w-full h-full flex flex-col gap-3 justify-center items-center">
                <Loader2Icon
                  className="animate-spin h-[64px] w-[64px]"
                  color="#FFFFFF"
                />
                <div className="font-inter text-2xl text-white uppercase">
                  generating presentation
                </div>
              </div>
            )}
            {presentationImagesLoaded && (
              <FramePresentationImage
                key={selectedFrames[actualFrame]}
                presentationImage={actualImagePresentation}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};
