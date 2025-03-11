import { PDFDocument } from "pdf-lib";
import { WeaveSelection, WeaveStateElement } from "@inditextech/weavejs-sdk";
import React from "react";
import Konva from "konva";
import { useCollaborationRoom } from "@/store/store";
import { useWeave } from "@inditextech/weavejs-react";
import { AlignStartHorizontal, Download } from "lucide-react";
import { toImageAsync } from "./utils";
import { WorkspaceImage } from "./workspaces-library.image";

export const WorkspacesLibrary = () => {
  const instance = useWeave((state) => state.instance);
  const appState = useWeave((state) => state.appState);
  const selectedNodes = useWeave((state) => state.selection.nodes);

  const [selectedWorkspaces, setSelectedWorkspaces] = React.useState<string[]>(
    []
  );

  const workspacesLibraryVisible = useCollaborationRoom(
    (state) => state.workspaces.library.visible
  );

  const workspacesAvailable = React.useMemo(() => {
    if (!instance) {
      return [];
    }

    const stage = instance.getStage();
    const nodes = instance.findNodesByType(
      appState.weave as WeaveStateElement,
      "workspace"
    );

    const workspaces: Konva.Node[] = [];
    for (const node of nodes) {
      const ele = stage.findOne(`#${node.key}`);
      if (ele) {
        workspaces.push(ele);
      }
    }
    return workspaces;
  }, [instance, appState]);

  const selectedNodesAllWorkspace = React.useMemo(() => {
    let allWorkspace = true;
    for (const node of selectedNodes) {
      if (node.node.type !== "workspace") {
        allWorkspace = false;
        break;
      }
    }
    return allWorkspace;
  }, [selectedNodes]);

  const alignItemsHandler = React.useCallback(() => {
    if (!instance) {
      return;
    }

    instance.triggerAction<{ gap: number; nodes: WeaveSelection[] }>(
      "alignElementsTool",
      {
        gap: 20,
        nodes: selectedNodes,
      }
    );
  }, [instance, selectedNodes]);

  const exportWorkspacesHandler = React.useCallback(async () => {
    if (!instance) {
      return;
    }

    const stage = instance.getStage();

    let workspacesToRender = selectedWorkspaces;
    if (workspacesToRender.length === 0) {
      workspacesToRender = workspacesAvailable.map(
        (e) => e.getAttrs().id ?? ""
      );
    }

    const pages: { title: string; image: string }[] = [];
    for (const workspaceId of selectedWorkspaces) {
      const node = stage.findOne(`#${workspaceId}`) as Konva.Group | undefined;
      if (node) {
        const attrs = node.getAttrs();
        const workspaceBg = node.findOne(`#${attrs.id}-bg`) as Konva.Group;
        const boxBg = workspaceBg.getClientRect();
        const img = await toImageAsync(node, boxBg);
        pages.push({ title: attrs.title, image: img.src });
      }
    }

    const pdfDoc = await PDFDocument.create();
    for (const page of pages) {
      const pdfPage = pdfDoc.addPage([1403, 992]);
      const imageDoc = await pdfDoc.embedJpg(page.image);
      pdfPage.drawText(page.title, {
        x: 30,
        y: 992 - 40,
      });
      pdfPage.drawImage(imageDoc, {
        x: 30,
        y: 30,
        width: 1403 - 60,
        height: 992 - 90,
      });
    }

    const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });

    const link = document.createElement("a");
    link.href = pdfDataUri;
    link.download = "test.pdf";
    link.click();
  }, [instance, selectedWorkspaces, workspacesAvailable]);

  if (!instance) {
    return null;
  }

  if (!workspacesLibraryVisible) {
    return null;
  }

  return (
    <div className="pointer-events-auto w-full h-full">
      <div className="w-full font-title-xs p-2 py-2 border-b border-light-border-3 bg-light-background-2 flex justify-between items-center">
        <div className="flex justify-between items-center text-sm pl-1">
          Frames
        </div>
        <div className="flex justify-end items-center gap-1">
          <button
            className="cursor-pointer bg-transparent hover:bg-zinc-200 p-1"
            disabled={selectedNodes.length <= 1 || !selectedNodesAllWorkspace}
            onClick={alignItemsHandler}
          >
            <AlignStartHorizontal size={16} />
          </button>
          <button
            className="cursor-pointer bg-transparent  hover:bg-zinc-200 p-1"
            onClick={exportWorkspacesHandler}
          >
            <Download size={16} />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full h-[calc(100%-53px)] p-4 overflow-scroll">
        {workspacesAvailable.length === 0 && (
          <div className="col-span-2 w-full flex flex-col justify-center items-center text-sm py-5 text-center">
            <b>No frames created</b>
            <span className="text-xs">Add a frame to the whiteboard</span>
          </div>
        )}
        {workspacesAvailable.map((node) => {
          const attrs = node.getAttrs();

          return (
            <div
              key={attrs.id}
              className="w-full bg-light-background-1 flex flex-col gap-2"
            >
              <div className="w-full flex justify-between items-center">
                <div className="w-full font-label-l-regular">{attrs.title}</div>
                <div className="font-label-l-regular">
                  <input
                    type="checkbox"
                    checked={
                      selectedWorkspaces.findIndex((e) => e === attrs.id) !== -1
                    }
                    onChange={() => {
                      setSelectedWorkspaces((prev) => {
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
              <WorkspaceImage node={node as Konva.Group} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
