"use client";

import React from "react";
import { useWeave } from "@inditextech/weavejs-react";
import { SelectionInformation } from "./../selection-information";
import { NodeProperties } from "./node-properties";
import { useCollaborationRoom } from "@/store/store";
import { ImagesLibrary } from "./../images-library/images-library";
import { FramesLibrary } from "../frames-library/frames-library";
import { PantonesLibrary } from "../pantones-library/pantones-library";
import { motion, AnimatePresence } from "framer-motion";
import { rightElementVariants } from "./variants";

export function MultiuseOverlay() {
  const instance = useWeave((state) => state.instance);
  const selectedNodes = useWeave((state) => state.selection.nodes);
  const actualAction = useWeave((state) => state.actions.actual);
  const isActionActive = useWeave((state) => state.actions.active);
  const node = useWeave((state) => state.selection.node);

  const nodePropertiesVisible = useCollaborationRoom(
    (state) => state.nodeProperties.visible
  );
  const setNodePropertiesAction = useCollaborationRoom(
    (state) => state.setNodePropertiesAction
  );
  const setNodePropertiesVisible = useCollaborationRoom(
    (state) => state.setNodePropertiesVisible
  );
  const imagesLibraryVisible = useCollaborationRoom(
    (state) => state.images.library.visible
  );
  const setFramesLibraryVisible = useCollaborationRoom(
    (state) => state.setFramesLibraryVisible
  );
  const framesLibraryVisible = useCollaborationRoom(
    (state) => state.frames.library.visible
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

  React.useEffect(() => {
    if (
      isActionActive &&
      actualAction &&
      ["selectionTool"].includes(actualAction) &&
      selectedNodes.length !== 1
    ) {
      setNodePropertiesAction(undefined);
      setNodePropertiesVisible(false);
    }
    if (
      isActionActive &&
      actualAction &&
      ["selectionTool"].includes(actualAction) &&
      selectedNodes.length === 1
    ) {
      setNodePropertiesAction("update");
      setNodePropertiesVisible(true);
      setFramesLibraryVisible(false);
      setImagesLibraryVisible(false);
      setPantonesLibraryVisible(false);
    }
    if (
      isActionActive &&
      actualAction &&
      [
        "rectangleTool",
        "brushTool",
        "penTool",
        "imageTool",
        "pantoneTool",
        "frameTool",
      ].includes(actualAction)
    ) {
      setNodePropertiesAction("create");
      setNodePropertiesVisible(true);
      setFramesLibraryVisible(false);
      setImagesLibraryVisible(false);
      setPantonesLibraryVisible(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualAction, selectedNodes]);

  const activePanel = React.useMemo(() => {
    if (nodePropertiesVisible) return "nodeProperties";
    if (framesLibraryVisible) return "framesLibrary";
    if (pantonesLibraryVisible) return "pantonesLibrary";
    if (imagesLibraryVisible) return "imagesLibrary";
    return null;
  }, [
    nodePropertiesVisible,
    framesLibraryVisible,
    pantonesLibraryVisible,
    imagesLibraryVisible,
  ]);

  const nodeType = React.useMemo(() => {
    switch (node?.type) {
      case "group":
        return "Group";
      case "rectangle":
        return "Rectangle";
      case "line":
        return "Vector path";
      case "text":
        return "Text";
      case "image":
        return "Image";
      case "pantone":
        return "Pantone";
      case "frame":
        return "Frame";
      default:
        return "Unknown";
    }
  }, [node]);

  const actionType = React.useMemo(() => {
    switch (actualAction) {
      case "rectangleTool":
        return "Rectangle";
      case "brushTool":
        return "Vector path";
      case "penTool":
        return "Vector path";
      case "imageTool":
        return "Image";
      case "pantoneTool":
        return "Pantone";
      case "frameTool":
        return "Frame";
      default:
        return "Unknown";
    }
  }, [actualAction]);

  if (!instance || !activePanel) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {activePanel === "imagesLibrary" && (
        <motion.div
          key="imagesLibrary"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={rightElementVariants}
          className="absolute top-[calc(50px+16px)] right-2 bottom-[calc(50px+16px)] flex flex-col gap-5 justify-center items-center"
        >
          <div className="w-[320px] p-0 h-full bg-white border border-zinc-200 shadow-xs flex justify-start items-center gap-3 overflow-hidden">
            <div className="w-full h-full overflow-auto custom-scrollbar !px-0">
              <ImagesLibrary />
              <SelectionInformation />
            </div>
          </div>
        </motion.div>
      )}

      {activePanel === "framesLibrary" && (
        <motion.div
          key="framesLibrary"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={rightElementVariants}
          className="absolute top-[calc(50px+16px)] right-2 bottom-[calc(50px+16px)] flex flex-col gap-5 justify-center items-center"
        >
          <div className="w-[320px] p-0 h-full bg-white border border-zinc-200 shadow-xs flex justify-start items-center gap-3 overflow-hidden">
            <div className="w-full h-full overflow-auto custom-scrollbar !px-0">
              <FramesLibrary />
              <SelectionInformation />
            </div>
          </div>
        </motion.div>
      )}

      {activePanel === "pantonesLibrary" && (
        <motion.div
          key="pantonesLibrary"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={rightElementVariants}
          className="absolute top-[calc(50px+16px)] right-2 bottom-[calc(50px+16px)] flex flex-col gap-5 justify-center items-center"
        >
          <div className="w-[320px] p-0 h-full bg-white border border-zinc-200 shadow-xs flex justify-start items-center gap-3 overflow-hidden">
            <div className="w-full h-full overflow-auto custom-scrollbar !px-0">
              <PantonesLibrary />
              <SelectionInformation />
            </div>
          </div>
        </motion.div>
      )}

      {activePanel === "nodeProperties" && (
        <motion.div
          key={`nodeProperties-${nodeType}-${actionType}`}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={rightElementVariants}
          className="absolute top-[calc(50px+16px)] right-2 bottom-[calc(50px+16px)] flex flex-col gap-5 justify-center items-center"
        >
          <div className="w-[320px] p-0 h-full bg-white border border-zinc-200 shadow-xs flex justify-start items-center gap-3 overflow-hidden">
            <div className="w-full h-full overflow-auto custom-scrollbar !px-0">
              <NodeProperties />
              <SelectionInformation />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
