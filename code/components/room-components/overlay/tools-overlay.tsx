// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import Konva from "konva";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { useIACapabilities } from "@/store/ia";
import { useIACapabilitiesV2 } from "@/store/ia-v2";
import { ToolsOverlayTouch } from "./tools-overlay.touch";
// import { ToolsOverlayMouse } from "./tools-overlay.mouse";
import { ToolsNodeOverlay } from "./tools-node-overlay";
import { ToolsMaskingOverlay } from "./tools-masking-overlay";
import { ToolsMaskingOverlayV2 } from "./tools-masking-overlay-v2";
import { ToolsNodeOverlayV2 } from "./tools-node-overlay-v2";
import { useOnPasteExternalImage } from "../hooks/use-on-paste-external-image";
import { useOnPasteExternalText } from "../hooks/use-on-paste-external-text";

export function ToolsOverlay() {
  const instance = useWeave((state) => state.instance);

  const showUI = useCollaborationRoom((state) => state.ui.show);
  const setCroppingImage = useCollaborationRoom(
    (state) => state.setCroppingImage
  );
  const setCroppingNode = useCollaborationRoom(
    (state) => state.setCroppingNode
  );

  const imagesLLMPopupVisible = useIACapabilities(
    (state) => state.llmPopup.visible
  );

  const imagesLLMPopupVisibleV2 = useIACapabilitiesV2(
    (state) => state.llmPopup.visible
  );

  React.useEffect(() => {
    if (!instance) return;

    const handlerImageCropStart = ({ instance }: { instance: Konva.Group }) => {
      setCroppingImage(true);
      setCroppingNode(instance);
    };

    const handlerImageCropEnd = () => {
      setCroppingImage(false);
      setCroppingNode(undefined);
    };

    instance.addEventListener("onImageCropStart", handlerImageCropStart);

    instance.addEventListener("onImageCropEnd", handlerImageCropEnd);

    return () => {
      instance.removeEventListener("onImageCropStart", handlerImageCropStart);
      instance.removeEventListener("onImageCropEnd", handlerImageCropEnd);
    };
  }, [instance, setCroppingImage, setCroppingNode]);

  useOnPasteExternalImage();
  useOnPasteExternalText();

  if (!showUI) {
    return null;
  }

  return (
    <>
      {!imagesLLMPopupVisible && (
        <>
          <ToolsOverlayTouch />
          {/* <ToolsOverlayMouse /> */}
          <ToolsNodeOverlay />
        </>
      )}
      {imagesLLMPopupVisible && <ToolsMaskingOverlay />}
      {!imagesLLMPopupVisibleV2 && (
        <>
          <ToolsOverlayTouch />
          {/* <ToolsOverlayMouse /> */}
          <ToolsNodeOverlay />
        </>
      )}
      {imagesLLMPopupVisibleV2 && <ToolsMaskingOverlayV2 />}
      <ToolsNodeOverlayV2 />
    </>
  );
}
