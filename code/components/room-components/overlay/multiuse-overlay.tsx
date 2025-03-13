"use client";

import React from "react";
import { useWeave } from "@inditextech/weavejs-react";
import { SelectionInformation } from "./../selection-information";
import { NodeProperties } from "./node-properties";
import { useCollaborationRoom } from "@/store/store";
import { ImagesLibrary } from "./../images-library/images-library";
import { FramesLibrary } from "../frames-library/frames-library";
import { PantonesLibrary } from "../pantones-library/pantones-library";

export function MultiuseOverlay() {
  const instance = useWeave((state) => state.instance);
  const selectedNodes = useWeave((state) => state.selection.nodes);
  const actualAction = useWeave((state) => state.actions.actual);
  const isActionActive = useWeave((state) => state.actions.active);

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

  if (!instance) {
    return null;
  }

  if (
    !nodePropertiesVisible &&
    !framesLibraryVisible &&
    !pantonesLibraryVisible &&
    !imagesLibraryVisible
  ) {
    return null;
  }

  return (
    <div
      className={
        "absolute top-[calc(50px+16px)] right-2 bottom-[calc(50px+16px)] flex flex-col gap-5 justify-center items-center"
      }
    >
      <div className="w-[320px] p-0 h-full bg-white border border-zinc-200 shadow-xs flex justify-start items-center gap-3 overflow-hidden">
        <div className="w-full h-full overflow-auto custom-scrollbar !px-0">
          <ImagesLibrary />
          <FramesLibrary />
          <PantonesLibrary />
          <SelectionInformation />
          <NodeProperties />
        </div>
      </div>
    </div>
  );
}
