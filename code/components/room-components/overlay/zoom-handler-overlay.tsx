"use client";

import React from "react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  XIcon,
  Fullscreen,
  Maximize,
  ZoomIn,
  ZoomOut,
  Braces,
  Images,
  SwatchBook,
  Frame,
} from "lucide-react";
import { useWeave } from "@inditextech/weavejs-react";
import { HelpDrawer } from "../help-drawer";
import { motion } from "framer-motion";
import { bottomElementVariants } from "./variants";
import { useCollaborationRoom } from "@/store/store";
import { PantonesLibrary } from "../pantones-library/pantones-library";
import { FramesLibrary } from "../frames-library/frames-library";
import { ImagesLibrary } from "../images-library/images-library";

export function ZoomHandlerOverlay() {
  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);
  const selectedNodes = useWeave((state) => state.selection.nodes);

  const zoomValue = useWeave((state) => state.zoom.value);
  const canZoomIn = useWeave((state) => state.zoom.canZoomIn);
  const canZoomOut = useWeave((state) => state.zoom.canZoomOut);

  const framesLibraryVisible = useCollaborationRoom(
    (state) => state.frames.library.visible
  );
  const setFramesLibraryVisible = useCollaborationRoom(
    (state) => state.setFramesLibraryVisible
  );
  const imagesLibraryVisible = useCollaborationRoom(
    (state) => state.images.library.visible
  );
  const setImagesLibraryVisible = useCollaborationRoom(
    (state) => state.setImagesLibraryVisible
  );
  const pantonesLibraryVisible = useCollaborationRoom(
    (state) => state.pantones.library.visible
  );
  const setPantonesLibraryVisible = useCollaborationRoom(
    (state) => state.setPantonesLibraryVisible
  );

  const handleTriggerAction = React.useCallback(
    (actionName: string) => {
      if (instance) {
        const triggerSelection = actualAction === "selectionTool";
        instance.triggerAction(actionName);
        if (triggerSelection) {
          instance.triggerAction("selectionTool");
        }
      }
    },
    [instance, actualAction]
  );

  const libraryToggle = React.useCallback(
    (library: string) => {
      switch (library) {
        case "images":
          setPantonesLibraryVisible(false);
          setFramesLibraryVisible(false);
          setImagesLibraryVisible(!imagesLibraryVisible);
          break;
        case "pantones":
          setImagesLibraryVisible(false);
          setFramesLibraryVisible(false);
          setPantonesLibraryVisible(!pantonesLibraryVisible);
          break;
        case "frames":
          setImagesLibraryVisible(false);
          setPantonesLibraryVisible(false);
          setFramesLibraryVisible(!framesLibraryVisible);
          break;
        default:
          break;
      }
    },
    [
      pantonesLibraryVisible,
      framesLibraryVisible,
      imagesLibraryVisible,
      setImagesLibraryVisible,
      setPantonesLibraryVisible,
      setFramesLibraryVisible,
    ]
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={bottomElementVariants}
      className="absolute bottom-2 left-2 right-2 flex gap-1 justify-between items-center overflow-hidden"
    >
      <div className="flex gap-1 justify-start items-center">
        <div className="bg-white border border-zinc-200 shadow-xs p-1 w-full flex justify-between items-center">
          <div className="w-full grid grid-cols-[auto_1fr]">
            <div className="flex justify-start items-center gap-1">
              <HelpDrawer />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 items-center">
        <div className="bg-white border border-zinc-200 shadow-xs p-1 w-full flex justify-between items-center">
          <div className="w-full grid grid-cols-[auto_1fr]">
            <div className="flex justify-start items-center gap-1">
              <Sheet modal={false} open={imagesLibraryVisible}>
                <SheetTrigger asChild>
                  <ToolbarButton
                    icon={<Images />}
                    active={imagesLibraryVisible}
                    onClick={() => {
                      libraryToggle("images");
                    }}
                    label="Images"
                  />
                </SheetTrigger>
                <SheetContent className="w-[328px]">
                  <SheetClose className="absolute top-0 right-0 p-1">
                    <button
                      className="cursor-pointer bg-transparent hover:bg-accent p-2"
                      onClick={() => {
                        libraryToggle("images");
                      }}
                    >
                      <XIcon size={16} />
                      <span className="sr-only">Close</span>
                    </button>
                  </SheetClose>
                  <ImagesLibrary />
                </SheetContent>
              </Sheet>
              <Sheet modal={false} open={pantonesLibraryVisible}>
                <SheetTrigger asChild>
                  <ToolbarButton
                    icon={<SwatchBook />}
                    active={pantonesLibraryVisible}
                    onClick={() => {
                      libraryToggle("pantones");
                    }}
                    label="Some Pantones"
                  />
                </SheetTrigger>
                <SheetContent className="w-[328px]">
                  <SheetClose className="absolute top-0 right-0 p-1">
                    <button
                      className="cursor-pointer bg-transparent hover:bg-accent p-2"
                      onClick={() => {
                        libraryToggle("pantones");
                      }}
                    >
                      <XIcon size={16} />
                      <span className="sr-only">Close</span>
                    </button>
                  </SheetClose>
                  <PantonesLibrary />
                </SheetContent>
              </Sheet>
              <Sheet modal={false} open={framesLibraryVisible}>
                <SheetTrigger asChild>
                  <ToolbarButton
                    icon={<Frame />}
                    active={framesLibraryVisible}
                    onClick={() => {
                      libraryToggle("frames");
                    }}
                    label="Frames"
                  />
                </SheetTrigger>
                <SheetContent className="w-[328px]">
                  <SheetClose className="absolute top-0 right-0 p-1">
                    <button
                      className="cursor-pointer bg-transparent hover:bg-accent p-2"
                      onClick={() => {
                        libraryToggle("frames");
                      }}
                    >
                      <XIcon size={16} />
                      <span className="sr-only">Close</span>
                    </button>
                  </SheetClose>
                  <FramesLibrary />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        <div className="w-[320px] gap-1 p-1 bg-white border border-zinc-200 shadow-xs flex justify-end items-center">
          <div className="w-full grid grid-cols-[auto_1fr]">
            <div className="flex justify-start items-center gap-1">
              <ToolbarButton
                icon={<ZoomIn />}
                disabled={!canZoomIn}
                onClick={() => {
                  handleTriggerAction("zoomInTool");
                }}
                label="Zoom in"
                tooltipSide="top"
              />
              <ToolbarButton
                icon={<ZoomOut />}
                disabled={!canZoomOut}
                onClick={() => {
                  handleTriggerAction("zoomOutTool");
                }}
                label="Zoom out"
                tooltipSide="top"
              />
              <ToolbarButton
                icon={<Maximize />}
                onClick={() => {
                  handleTriggerAction("fitToScreenTool");
                }}
                label="Fit to screen"
                tooltipSide="top"
              />
              <ToolbarButton
                icon={<Fullscreen />}
                disabled={selectedNodes.length === 0}
                onClick={() => {
                  handleTriggerAction("fitToSelectionTool");
                }}
                label="Fit to selection"
                tooltipSide="top"
              />
              <ToolbarButton
                icon={<Braces />}
                onClick={() => {
                  if (instance) {
                    // eslint-disable-next-line no-console
                    console.log({
                      appState: JSON.parse(
                        JSON.stringify(instance.getStore().getState())
                      ),
                    });
                  }
                }}
                label="Print model state to browser console"
              />
            </div>
            <div className="w-full px-4 font-noto-sans-mono flex justify-end items-center text-muted-foreground">
              {parseFloat(`${zoomValue * 100}`).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
