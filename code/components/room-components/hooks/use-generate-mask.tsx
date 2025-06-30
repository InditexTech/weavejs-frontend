import React from "react";
import Konva from "konva";
import { WeaveElementInstance } from "@inditextech/weave-types";
import { useWeave } from "@inditextech/weave-react";
import { useIACapabilities } from "@/store/ia";
import { Weave, WeaveExportNodesActionParams } from "@inditextech/weave-sdk";

type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function getBoundingBox(
  stage: Konva.Stage,
  layer: Konva.Layer,
  nodes: Konva.Node[]
): BoundingBox {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    let realNode: Konva.Node | undefined = node;
    if (realNode.getAttrs().containerId) {
      realNode = stage.findOne(`#${realNode.getAttrs().containerId}`);
    }

    if (!realNode) {
      continue;
    }

    const box = node.getRealClientRect({ relativeTo: layer });

    minX = Math.min(minX, box.x);
    minY = Math.min(minY, box.y);
    maxX = Math.max(maxX, box.x + box.width);
    maxY = Math.max(maxY, box.y + box.height);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

async function generateMask(
  instance: Weave,
  stage: Konva.Stage,
  mainLayer: Konva.Layer,
  selectedNodes: Konva.Node[],
  selectedMask: string[],
  forUI: boolean = false
) {
  const masks = [];
  let minorZIndex = Infinity;

  const maskElement = stage.findOne(`#${selectedMask[0]}`);

  if (!maskElement) return;

  if (selectedMask.length === 1) {
    if (
      maskElement &&
      maskElement.getAttrs().nodeType === "group" &&
      (maskElement as Konva.Group)
        .getChildren()
        .every(
          (child: Konva.Node) =>
            child.getAttrs().nodeType === "line" && child.getAttrs().closed
        )
    ) {
      for (const child of (maskElement as Konva.Group).getChildren()) {
        if (child.zIndex() < minorZIndex) {
          minorZIndex = child.zIndex();
        }

        child.setAttrs({
          stroke: 0,
          fill: forUI ? "#67BCF0FF" : "#ffffff",
          opacity: 1,
          globalCompositeOperation: forUI ? undefined : "destination-out",
        });

        masks.push(child);
      }
    }

    if (
      maskElement &&
      maskElement.getAttrs().nodeType === "line" &&
      maskElement.getAttrs().closed
    ) {
      if (maskElement.zIndex() < minorZIndex) {
        minorZIndex = maskElement.zIndex();
      }

      maskElement.setAttrs({
        stroke: 0,
        fill: forUI ? "#67BCF0FF" : "#ffffff",
        opacity: 1,
        globalCompositeOperation: forUI ? undefined : "destination-out",
      });

      masks.push(maskElement);
    }

    if (maskElement && maskElement.getAttrs().nodeType === "fuzzy-mask") {
      if (maskElement.zIndex() < minorZIndex) {
        minorZIndex = maskElement.zIndex();
      }

      const maskNode = stage.findOne(`#${maskElement.getAttrs().id}-mask`);

      if (!maskNode) return;

      maskNode.setAttrs({
        fill: forUI ? "#67BCF0FF" : "#ffffff",
        globalCompositeOperation: forUI ? undefined : "destination-out",
      });

      masks.push(maskElement);
    }
  }

  if (masks.length === 0) {
    return;
  }

  const selectedNode = stage.findOne(`#${selectedNodes[0].getAttrs().id}`);

  if (!selectedNode) return;

  const selectionBox = getBoundingBox(stage, mainLayer, selectedNodes);

  const rect = new Konva.Rect({
    x: selectionBox.x,
    y: selectionBox.y,
    width: selectionBox.width,
    height: selectionBox.height,
    fill: forUI ? "black" : "white",
    stroke: "black",
    zIndex: minorZIndex - 1,
    opacity: 1,
    id: "mask",
  });

  if (!forUI) {
    mainLayer.add(rect);
  }

  const finalMaskElements: WeaveElementInstance[] = [];

  if (!forUI) {
    finalMaskElements.push(rect);
  } else {
    finalMaskElements.push(selectedNode as WeaveElementInstance);
  }

  finalMaskElements.push(...(masks as WeaveElementInstance[]));

  const base64URL: unknown = await instance.triggerAction<
    WeaveExportNodesActionParams,
    void
  >("exportNodesTool", {
    nodes: finalMaskElements,
    ...(forUI && {
      boundingNodes: (nodes) => {
        return nodes.filter(
          (node) => node.getAttrs().id === selectedNode.getAttrs().id
        );
      },
    }),
    ...(!forUI && {
      boundingNodes: (nodes) => {
        return nodes.filter((node) => node.getAttrs().id === "mask");
      },
    }),
    options: {
      padding: 0,
      pixelRatio: 1,
    },
    download: false,
  });

  for (const maskElement of masks) {
    maskElement.setAttrs({
      fill: "#67BCF0FF",
    });
  }

  rect.destroy();

  return base64URL;
}

export const useGenerateMask = () => {
  const instance = useWeave((state) => state.instance);

  const imagesLLMPopupImageBase64 = useIACapabilities(
    (state) => state.llmPopup.imageBase64
  );

  const [actualMaskBase64, setActualMaskBase64] = React.useState<string | null>(
    null
  );
  const [actualMaskBase64UI, setActualMaskBase64UI] = React.useState<
    string | null
  >(null);

  const imagesLLMPopupType = useIACapabilities((state) => state.llmPopup.type);
  const selectedNodes = useIACapabilities((state) => state.llmPopup.selected);
  const selectedMask = useIACapabilities((state) => state.mask.selected);
  const setSelectedMask = useIACapabilities((state) => state.setSelectedMask);

  React.useEffect(() => {
    setSelectedMask(null);
  }, [imagesLLMPopupImageBase64, setSelectedMask]);

  React.useEffect(() => {
    setSelectedMask(null);
  }, [imagesLLMPopupType, setSelectedMask]);

  React.useEffect(() => {
    const generateMasks = async () => {
      setActualMaskBase64(null);

      if (!instance) return;

      if (!selectedNodes) return;

      if (selectedNodes.length === 0) return;

      if (!selectedMask) return;

      const stage = instance.getStage();

      if (!stage) return;

      const mainLayer = instance.getMainLayer();

      if (!mainLayer) return;

      const apiMask = await generateMask(
        instance,
        stage,
        mainLayer,
        selectedNodes,
        selectedMask
      );

      setActualMaskBase64(apiMask as string);

      console.log("apiMask", apiMask);

      const uiMask = await generateMask(
        instance,
        stage,
        mainLayer,
        selectedNodes,
        selectedMask,
        true
      );

      setActualMaskBase64UI(uiMask as string);

      console.log("uiMask", uiMask);
    };

    generateMasks();
  }, [instance, selectedNodes, selectedMask]);

  return [actualMaskBase64, actualMaskBase64UI];
};
