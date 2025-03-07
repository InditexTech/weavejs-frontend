"use client";

import React from "react";
import { useWeave } from "@inditextech/weavejs-react";
import { SelectionInformation } from "./../selection-information";
import { NodeProperties } from "./node-properties";
import { useCollaborationRoom } from "@/store/store";
import { ImagesLibrary } from "./../images-library/images-library";
import { WorkspacesLibrary } from "../workspaces-library/workspaces-library";

export function MultiuseOverlay() {
  const instance = useWeave((state) => state.instance);
  const selectedNodes = useWeave((state) => state.selection.nodes);

  const isActionActive = useWeave((state) => state.actions.active);

  const nodePropertiesVisible = useCollaborationRoom((state) => state.nodeProperties.visible);
  const setNodePropertiesVisible = useCollaborationRoom((state) => state.setNodePropertiesVisible);
  const imagesLibraryVisible = useCollaborationRoom((state) => state.images.library.visible);
  const setWorkspacesLibraryVisible = useCollaborationRoom((state) => state.setWorkspacesLibraryVisible);
  const workspacesLibraryVisible = useCollaborationRoom((state) => state.workspaces.library.visible);
  const setImagesLibraryVisible = useCollaborationRoom((state) => state.setImagesLibraryVisible);

  React.useEffect(() => {
    if (selectedNodes.length !== 1) {
      setNodePropertiesVisible(false);
    }
    if (selectedNodes.length === 1) {
      setNodePropertiesVisible(true);
      setWorkspacesLibraryVisible(false);
      setImagesLibraryVisible(false);
    }
    if (isActionActive || selectedNodes.length === 0) {
      setNodePropertiesVisible(false);
      setWorkspacesLibraryVisible(false);
      setImagesLibraryVisible(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodes]);

  if (!instance) {
    return null;
  }

  if (!nodePropertiesVisible && !workspacesLibraryVisible && !imagesLibraryVisible) {
    return null;
  }

  return (
    <div
      className={
        "pointer-events-none absolute top-[216px] right-[20px] bottom-[20px] flex flex-col gap-5 justify-center items-center"
      }
    >
      <div className="w-[320px] p-0 h-full bg-white rounded-lg border border-light-border-3 shadow-md flex justify-start items-center gap-3 overflow-hidden">
        <div className="pointer-events-auto w-full h-full overflow-auto custom-scrollbar !px-0">
          <ImagesLibrary />
          <WorkspacesLibrary />
          <SelectionInformation />
          <NodeProperties />
        </div>
      </div>
    </div>
  );
}
