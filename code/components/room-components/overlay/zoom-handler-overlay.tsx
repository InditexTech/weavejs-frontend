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
import { motion } from "framer-motion";
import { bottomElementVariants } from "./variants";
import { useCollaborationRoom } from "@/store/store";
import { PantonesLibrary } from "../pantones-library/pantones-library";
import { FramesLibrary } from "../frames-library/frames-library";
import { ImagesLibrary } from "../images-library/images-library";
import { HelpDrawer } from "../help/help-drawer";
import { SYSTEM_OS } from "@/lib/utils";
import { ShortcutElement } from "../help/shortcut-element";

export function ZoomHandlerOverlay() {
  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);
  const selectedNodes = useWeave((state) => state.selection.nodes);

  const zoomValue = useWeave((state) => state.zoom.value);
  const canZoomIn = useWeave((state) => state.zoom.canZoomIn);
  const canZoomOut = useWeave((state) => state.zoom.canZoomOut);

  const showUI = useCollaborationRoom((state) => state.ui.show);
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

  const handlePrintToConsoleState = React.useCallback(() => {
    if (instance) {
      // eslint-disable-next-line no-console
      console.log({
        appState: JSON.parse(JSON.stringify(instance.getStore().getState())),
      });
    }
  }, [instance]);

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

  if (!showUI) {
    return null;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={bottomElementVariants}
      className="pointer-events-none absolute bottom-2 left-2 right-2 flex gap- justify-between items-center overflow-hidden"
    >
      <div className="flex gap-2 justify-start items-center">
        <div className="bg-white border border-zinc-200 shadow-lg p-1 flex justify-between items-center">
          <div className="w-full grid grid-cols-[auto_1fr]">
            <div className="flex justify-start items-center gap-1">
              <HelpDrawer />
            </div>
          </div>
        </div>
        <div className="bg-white border border-zinc-200 shadow-lg p-1 flex justify-between items-center">
          <div className="w-full grid grid-cols-[auto_1fr]">
            <div className="flex justify-start items-center gap-1">
              <ToolbarButton
                icon={<Braces />}
                onClick={handlePrintToConsoleState}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>Print model state to browser console</p>
                    <ShortcutElement
                      variant="light"
                      shortcuts={{
                        [SYSTEM_OS.MAC]: "⌥ ⌘ C",
                        [SYSTEM_OS.OTHER]: "Alt Ctrl C",
                      }}
                    />
                  </div>
                }
                tooltipSide="top"
                tooltipAlign="start"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 items-center">
        <div className="bg-white border border-zinc-200 shadow-lg p-1 w-full flex justify-between items-center">
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
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Images toolbar</p>
                        <ShortcutElement
                          variant="light"
                          shortcuts={{
                            [SYSTEM_OS.MAC]: "⌥ ⌘ R",
                            [SYSTEM_OS.OTHER]: "Alt Ctrl R",
                          }}
                        />
                      </div>
                    }
                    tooltipSide="top"
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
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Pantones toolbar</p>
                        <ShortcutElement
                          variant="light"
                          shortcuts={{
                            [SYSTEM_OS.MAC]: "⌥ ⌘ P",
                            [SYSTEM_OS.OTHER]: "Alt Ctrl P",
                          }}
                        />
                      </div>
                    }
                    tooltipSide="top"
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
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Frames toolbar</p>
                        <ShortcutElement
                          variant="light"
                          shortcuts={{
                            [SYSTEM_OS.MAC]: "⌥ ⌘ F",
                            [SYSTEM_OS.OTHER]: "Alt Ctrl F",
                          }}
                        />
                      </div>
                    }
                    tooltipSide="top"
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
        <div className="min-w-[320px] w-[320px] gap-1 p-1 bg-white border border-zinc-200 shadow-lg flex justify-end items-center">
          <div className="w-full grid grid-cols-[auto_1fr]">
            <div className="flex justify-start items-center gap-1">
              <ToolbarButton
                icon={<ZoomIn />}
                disabled={!canZoomIn}
                onClick={() => {
                  handleTriggerAction("zoomInTool");
                }}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>Zoom in</p>
                    <ShortcutElement
                      variant="light"
                      shortcuts={{
                        [SYSTEM_OS.MAC]: "⌘ +",
                        [SYSTEM_OS.OTHER]: "Ctrl +",
                      }}
                    />
                  </div>
                }
                tooltipSide="top"
              />
              <ToolbarButton
                icon={<ZoomOut />}
                disabled={!canZoomOut}
                onClick={() => {
                  handleTriggerAction("zoomOutTool");
                }}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>Zoom out</p>
                    <ShortcutElement
                      variant="light"
                      shortcuts={{
                        [SYSTEM_OS.MAC]: "⌘ -",
                        [SYSTEM_OS.OTHER]: "Ctrl -",
                      }}
                    />
                  </div>
                }
                tooltipSide="top"
              />
              <ToolbarButton
                icon={<Maximize />}
                onClick={() => {
                  handleTriggerAction("fitToScreenTool");
                }}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>Fit to screen</p>
                    <ShortcutElement
                      variant="light"
                      shortcuts={{
                        [SYSTEM_OS.MAC]: "⇧ 1",
                        [SYSTEM_OS.OTHER]: "⇧ 1",
                      }}
                    />
                  </div>
                }
                tooltipSide="top"
              />
              <ToolbarButton
                icon={<Fullscreen />}
                disabled={selectedNodes.length === 0}
                onClick={() => {
                  handleTriggerAction("fitToSelectionTool");
                }}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>Fit to selection</p>
                    <ShortcutElement
                      variant="light"
                      shortcuts={{
                        [SYSTEM_OS.MAC]: "⇧ 2",
                        [SYSTEM_OS.OTHER]: "⇧ 2",
                      }}
                    />
                  </div>
                }
                tooltipSide="top"
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
