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
  SkipBack,
  SkipForward,
  SquareCheck,
  StepBack,
  StepForward,
  XIcon,
  FileDown,
} from "lucide-react";
import { generatePresentation, PresentationImage, toImageAsync } from "./utils";
import { FrameImage } from "./frames-library.image";
import { FramePresentationImage } from "./frames-library.presentation-image";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarSelector } from "../sidebar-selector";
import { SidebarHeader } from "../sidebar-header";
import { cn } from "@/lib/utils";
import { ToolbarButton } from "../toolbar/toolbar-button";

export const FramesLibrary = () => {
  const instance = useWeave((state) => state.instance);
  const appState = useWeave((state) => state.appState);

  const sidebarActive = useCollaborationRoom((state) => state.sidebar.active);
  const setFramePages = useCollaborationRoom((state) => state.setFramesPages);
  const setFramesExportVisible = useCollaborationRoom(
    (state) => state.setFramesExportVisible,
  );
  const framesImages = useCollaborationRoom((state) => state.frames.images);
  const setFramesImages = useCollaborationRoom(
    (state) => state.setFramesImages,
  );

  const [framesAvailable, setFramesAvailable] = React.useState<Konva.Node[]>(
    [],
  );
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
    const handleFrames = () => {
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
    };

    handleFrames();
  }, [instance, appState, sidebarActive]);

  React.useEffect(() => {
    const loadImage = async (node: Konva.Node) => {
      if (!instance)
        throw new Error("Instance is required to load frame image");

      const nodeAttrs = node.getAttrs();
      try {
        const stage = instance.getStage();
        const bounds = instance.getExportBoundingBox([nodeAttrs.containerId]);
        const img = await toImageAsync(node, {
          x: bounds.x,
          y: bounds.y,
          pixelRatio: 0.5 * (1 / (stage.getAttrs().scaleX ?? 1)),
          width: bounds.width,
          height: bounds.height,
        });
        return { nodeAttrs, img };
      } catch (ex) {
        console.error(ex);
        throw ex;
      }
    };

    const loadImages = async () => {
      const imagesPromises = framesAvailable.map((frame) => loadImage(frame));
      const images = await Promise.allSettled<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodeAttrs: any;
        img: HTMLImageElement;
      }>(imagesPromises);
      setFramesImages({});
      const imagesMap: Record<string, HTMLImageElement> = {};
      for (let i = 0; i < images.length; i++) {
        const result = images[i];
        if (result.status === "fulfilled") {
          const { nodeAttrs, img } = result.value;
          imagesMap[nodeAttrs.id ?? ""] = img;
        }
      }
      setFramesImages(imagesMap);

      setLoadingFrames(false);
    };

    if (loadingFrames) {
      setTimeout(() => {
        loadImages();
      }, 50);
    }
  }, [instance, framesImages, framesAvailable, loadingFrames, setFramesImages]);

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

  // if (sidebarActive !== SIDEBAR_ELEMENTS.frames) {
  //   return null;
  // }

  return (
    <>
      <div
        className={cn("w-full h-full", {
          ["hidden pointer-events-none"]:
            sidebarActive !== SIDEBAR_ELEMENTS.frames,
          ["block pointer-events-auto"]:
            sidebarActive === SIDEBAR_ELEMENTS.frames,
        })}
      >
        <SidebarHeader
          actions={
            <>
              {/* <ToolbarButton
                icon={
                  <Presentation
                    size={20}
                    className="group-disabled:text-[#cccccc]"
                    strokeWidth={1}
                  />
                }
                onClick={() => {
                  setActualFrame(0);
                  setPresentationMode((prev) => !prev);
                }}
                label="Presentation mode"
                size="small"
                variant="squared"
                tooltipSideOffset={4}
                tooltipSide="bottom"
                tooltipAlign="end"
              /> */}
              <ToolbarButton
                icon={
                  <SquareCheck
                    size={20}
                    className="group-disabled:text-[#cccccc]"
                    strokeWidth={1}
                  />
                }
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
                label="Select all frames"
                size="small"
                variant="squared"
                tooltipSideOffset={4}
                tooltipSide="bottom"
                tooltipAlign="end"
              />
              <ToolbarButton
                icon={
                  <FileDown
                    size={20}
                    className="group-disabled:text-[#cccccc]"
                    strokeWidth={1}
                  />
                }
                disabled={selectedFrames.length === 0}
                onClick={exportFramesHandler}
                label="Export frames as PDF"
                size="small"
                variant="squared"
                tooltipSideOffset={4}
                tooltipSide="bottom"
                tooltipAlign="end"
              />
            </>
          }
        >
          <SidebarSelector title="Frames" />
        </SidebarHeader>
        {!loadingFrames && framesAvailable.length === 0 && (
          <div className="col-span-1 w-full h-[calc(100%-57px)] flex flex-col justify-center items-center text-sm text-center font-inter font-light">
            <b className="font-normal text-[18px]">No frames created</b>
            <span className="text-[14px]">Add a frame to the whiteboard</span>
          </div>
        )}
        {loadingFrames && (
          <div className="col-span-1 w-full h-[calc(100%-57px)] flex flex-col justify-center items-center text-sm text-center font-inter font-light">
            <b className="font-normal text-[18px]">Loading frames</b>
            <span className="text-[14px]">Please wait...</span>
          </div>
        )}
        {!loadingFrames && framesAvailable.length > 0 && (
          <ScrollArea className="w-full h-[calc(100%-57px)]">
            <div
              className={cn("flex flex-col gap-3 w-full h-full", {
                ["p-0"]:
                  loadingFrames ||
                  (!loadingFrames && framesAvailable.length === 0),
                ["p-[24px]"]: !loadingFrames && framesAvailable.length > 0,
              })}
            >
              {framesAvailable.map((node, index) => {
                const attrs = node.getAttrs();

                return (
                  <div
                    key={attrs.id}
                    className="w-full bg-light-background-1 flex flex-col gap-1"
                  >
                    {framesImages[node.getAttrs().id ?? ""] && (
                      <FrameImage
                        image={framesImages[node.getAttrs().id ?? ""]}
                        actions={
                          <div className="font-label-l-regular">
                            <Checkbox
                              className="cursor-pointer rounded-none bg-white"
                              checked={
                                selectedFrames.findIndex(
                                  (e) => e === attrs.id,
                                ) !== -1
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
                        }
                        title={`${index + 1}. ${attrs.title}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
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
