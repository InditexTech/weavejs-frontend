// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import Konva from "konva";
import { WeaveElementInstance } from "@inditextech/weave-types";
import { useWeave } from "@inditextech/weave-react";
import { useIACapabilitiesV2 } from "@/store/ia-v2";
import {
  Weave,
  WeaveExportNodesActionParams,
} from "@inditextech/weave-sdk/client";

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

    const box = node.getClientRect({ relativeTo: layer });

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

  for (const maskId of selectedMask) {
    const maskElement = stage.findOne(`#${maskId}`);

    if (!maskElement) return;

    if (maskElement && maskElement.getAttrs().nodeType === "mask") {
      if (maskElement.zIndex() < minorZIndex) {
        minorZIndex = maskElement.zIndex();
      }

      maskElement.setAttrs({
        stroke: 0,
        fill: forUI ? "#67BCF0FF" : "#FFFFFF",
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
        stroke: 0,
        fill: forUI ? "#67BCF0FF" : "#FFFFFF",
        opacity: 1,
        globalCompositeOperation: forUI ? undefined : "destination-out",
      });

      masks.push(maskElement);
    }
  }

  if (masks.length === 0) {
    return;
  }

  const selectionBox = getBoundingBox(stage, mainLayer, selectedNodes);

  const rect = new Konva.Rect({
    x: selectionBox.x,
    y: selectionBox.y,
    width: selectionBox.width,
    height: selectionBox.height,
    fill: "white",
    stroke: "white",
    strokeWidth: 0,
    opacity: 1,
    id: "generatedMask",
  });

  if (!forUI) {
    mainLayer.add(rect);
    rect.zIndex(minorZIndex - 1);
  }

  const finalMaskElements: WeaveElementInstance[] = [];

  if (!forUI) {
    finalMaskElements.push(rect);
  } else {
    finalMaskElements.push(...(selectedNodes as WeaveElementInstance[]));
  }

  finalMaskElements.push(...(masks as WeaveElementInstance[]));

  const image: HTMLImageElement = await instance.triggerAction<
    WeaveExportNodesActionParams,
    Promise<HTMLImageElement>
  >("exportNodesTool", {
    nodes: finalMaskElements,
    triggerSelectionTool: false,
    ...(forUI && {
      boundingNodes: (nodes) => {
        return nodes.filter((node) => {
          const nodesIds = selectedNodes.map(
            (actNode) => actNode.getAttrs().id
          );
          return nodesIds.includes(node.getAttrs().id);
        });
      },
    }),
    ...(!forUI && {
      boundingNodes: (nodes) => {
        return nodes.filter((node) => node.getAttrs().id === "generatedMask");
      },
    }),
    options: {
      padding: 0,
      pixelRatio: 1,
    },
  });

  const base64URL: unknown = instance.imageToBase64(image, "image/png");

  for (const maskElement of masks) {
    if (maskElement && maskElement.getAttrs().nodeType === "mask") {
      maskElement.setAttrs({
        fill: "#67BCF0FF",
        opacity: 1,
        globalCompositeOperation: undefined,
      });
    }
    if (maskElement && maskElement.getAttrs().nodeType === "fuzzy-mask") {
      const maskNode = stage.findOne(`#${maskElement.getAttrs().id}-mask`);

      if (!maskNode) return;

      maskNode.setAttrs({
        fill: "#67BCF0FF",
        opacity: 1,
        globalCompositeOperation: undefined,
      });
    }
  }

  rect.destroy();

  return base64URL;
}

export const useGenerateMaskV2 = () => {
  const instance = useWeave((state) => state.instance);

  const imagesLLMPopupImageBase64 = useIACapabilitiesV2(
    (state) => state.llmPopup.imageBase64
  );

  const [actualMaskBase64, setActualMaskBase64] = React.useState<string | null>(
    null
  );
  const [actualMaskBase64UI, setActualMaskBase64UI] = React.useState<
    string | null
  >(null);

  const imagesLLMPopupType = useIACapabilitiesV2(
    (state) => state.llmPopup.type
  );
  const selectedNodes = useIACapabilitiesV2((state) => state.llmPopup.selected);
  const masksSelected = useIACapabilitiesV2((state) => state.mask.selected);
  const setSelectedMasks = useIACapabilitiesV2(
    (state) => state.setSelectedMasks
  );

  React.useEffect(() => {
    setSelectedMasks([]);
  }, [imagesLLMPopupImageBase64, setSelectedMasks]);

  React.useEffect(() => {
    setSelectedMasks([]);
  }, [imagesLLMPopupType, setSelectedMasks]);

  React.useEffect(() => {
    const generateMasks = async () => {
      setActualMaskBase64(null);

      if (!instance) return;

      if (!selectedNodes) return;

      if (selectedNodes.length === 0) return;

      if (!masksSelected) return;

      const stage = instance.getStage();

      if (!stage) return;

      const mainLayer = instance.getMainLayer();

      if (!mainLayer) return;

      const apiMask = await generateMask(
        instance,
        stage,
        mainLayer,
        selectedNodes,
        masksSelected
      );

      setActualMaskBase64(apiMask as string);

      const uiMask = await generateMask(
        instance,
        stage,
        mainLayer,
        selectedNodes,
        masksSelected,
        true
      );

      setActualMaskBase64UI(uiMask as string);
    };

    generateMasks();
  }, [instance, selectedNodes, masksSelected]);

  return [actualMaskBase64, actualMaskBase64UI];
};
