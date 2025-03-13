import { PDFDocument } from "pdf-lib";
import { WeaveSelection, WeaveStateElement } from "@inditextech/weavejs-sdk";
import React from "react";
import Konva from "konva";
import { useCollaborationRoom } from "@/store/store";
import { useWeave } from "@inditextech/weavejs-react";
import { AlignStartHorizontal, Download } from "lucide-react";
import { toImageAsync } from "./utils";
import { FrameImage } from "./frames-library.image";

export const FramesLibrary = () => {
  const instance = useWeave((state) => state.instance);
  const appState = useWeave((state) => state.appState);
  const selectedNodes = useWeave((state) => state.selection.nodes);

  const [selectedFrames, setSelectedFrames] = React.useState<string[]>([]);

  const framesLibraryVisible = useCollaborationRoom(
    (state) => state.frames.library.visible
  );

  const framesAvailable = React.useMemo(() => {
    if (!instance) {
      return [];
    }

    const stage = instance.getStage();
    const nodes = instance.findNodesByType(
      appState.weave as WeaveStateElement,
      "frame"
    );

    const frames: Konva.Node[] = [];
    for (const node of nodes) {
      const ele = stage.findOne(`#${node.key}`);
      if (ele) {
        frames.push(ele);
      }
    }
    return frames;
  }, [instance, appState]);

  const selectedNodesAllFrame = React.useMemo(() => {
    let allFrame = true;
    for (const node of selectedNodes) {
      if (node.node.type !== "frame") {
        allFrame = false;
        break;
      }
    }
    return allFrame;
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

  const exportFramesHandler = React.useCallback(async () => {
    if (!instance) {
      return;
    }

    const stage = instance.getStage();

    let framesToRender = selectedFrames;
    if (framesToRender.length === 0) {
      framesToRender = framesAvailable.map((e) => e.getAttrs().id ?? "");
    }

    const pages: { title: string; image: string }[] = [];
    for (const frameId of selectedFrames) {
      const node = stage.findOne(`#${frameId}`) as Konva.Group | undefined;
      if (node) {
        const attrs = node.getAttrs();
        const frameBg = node.findOne(`#${attrs.id}-bg`) as Konva.Group;
        const boxBg = frameBg.getClientRect();
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
  }, [instance, selectedFrames, framesAvailable]);

  if (!instance) {
    return null;
  }

  if (!framesLibraryVisible) {
    return null;
  }

  return (
    <div className="pointer-events-auto w-full h-full">
      <div className="w-full font-title-xs p-1 border-b border-zinc-200 bg-white flex justify-between items-center">
        <div className="flex justify-between font-noto-sans-mono font-light items-center text-md pl-2">
          Frames
        </div>
        <div className="flex justify-end items-center gap-1">
          <button
            className="cursor-pointer bg-transparent hover:bg-accent p-2"
            disabled={selectedNodes.length <= 1 || !selectedNodesAllFrame}
            onClick={alignItemsHandler}
          >
            <AlignStartHorizontal />
          </button>
          <button
            className="cursor-pointer bg-transparent  hover:bg-accent p-2"
            onClick={exportFramesHandler}
          >
            <Download />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full h-[calc(100%-53px)] p-4 overflow-scroll">
        {framesAvailable.length === 0 && (
          <div className="col-span-2 w-full flex flex-col justify-center items-center text-sm py-5 text-center">
            <b>No frames created</b>
            <span className="text-xs">Add a frame to the whiteboard</span>
          </div>
        )}
        {framesAvailable.map((node) => {
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
                      selectedFrames.findIndex((e) => e === attrs.id) !== -1
                    }
                    onChange={() => {
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
              <FrameImage node={node as Konva.Group} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
