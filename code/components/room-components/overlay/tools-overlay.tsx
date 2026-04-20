// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import Konva from "konva";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { ToolsOverlayMain } from "./tools-overlay.main";
import { ToolsNodeOverlay } from "./tools-node-overlay";
import { ToolsNodeOverlayV2 } from "./tools-node-overlay-v2";
import { useOnPasteExternalImage } from "../hooks/use-on-paste-external-image";
import { useOnPasteExternalText } from "../hooks/use-on-paste-external-text";

export function ToolsOverlay() {
  const instance = useWeave((state) => state.instance);

  const setCroppingImage = useCollaborationRoom(
    (state) => state.setCroppingImage,
  );
  const setCroppingNode = useCollaborationRoom(
    (state) => state.setCroppingNode,
  );

  React.useEffect(() => {
    if (!instance) return;

    const handlerImageCropStart = ({
      instance,
      cmdCtrlTriggered,
    }: {
      instance: Konva.Group;
      cmdCtrlTriggered: boolean;
    }) => {
      setCroppingImage(!cmdCtrlTriggered);
      setCroppingNode(cmdCtrlTriggered ? undefined : instance);
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

  return (
    <>
      <ToolsOverlayMain />
      <ToolsNodeOverlay />
      <ToolsNodeOverlayV2 />
    </>
  );
}
