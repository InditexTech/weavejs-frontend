// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { ExportAreaReferencePlugin } from "@/components/plugins/export-area-reference/export-area-reference";
import { EXPORT_AREA_REFERENCE_PLUGIN_KEY } from "@/components/plugins/export-area-reference/constants";
import Konva from "konva";

export const useGetPageThumbnail = () => {
  const [roomState, setRoomState] = React.useState<
    "idle" | "loading" | "loaded"
  >("idle");
  const [generationState, setGenerationState] = React.useState<
    "idle" | "generating" | "generated"
  >("idle");
  const [pageThumbnail, setPageThumbnail] = React.useState<Blob | null>(null);

  const instance = useWeave((state) => state.instance);
  const isRoomSwitching = useWeave((state) => state.room.switching);

  const exportConfigVisible = useCollaborationRoom(
    (state) => state.export.page.image.visible,
  );

  React.useEffect(() => {
    if (!exportConfigVisible) {
      setGenerationState("idle");
    }
  }, [exportConfigVisible]);

  React.useEffect(() => {
    if (!instance) {
      return;
    }

    const onAsyncElementsLoadingHandler = () => {
      setRoomState("loading");
    };

    const onAsyncElementsLoadedHandler = () => {
      setRoomState("loaded");
    };

    instance.addEventListener(
      "onAsyncElementsLoading",
      onAsyncElementsLoadingHandler,
    );
    instance.addEventListener(
      "onAsyncElementsLoaded",
      onAsyncElementsLoadedHandler,
    );

    const asyncElementsLoaded = instance.asyncElementsLoaded();

    if (asyncElementsLoaded) {
      setRoomState("loaded");
    }

    return () => {
      instance.removeEventListener(
        "onAsyncElementsLoading",
        onAsyncElementsLoadingHandler,
      );
      instance.removeEventListener(
        "onAsyncElementsLoaded",
        onAsyncElementsLoadedHandler,
      );
    };
  }, [instance]);

  React.useEffect(() => {
    if (!instance) {
      return;
    }

    const onRenderHandler = async () => {
      if (!instance) {
        return;
      }

      if (isRoomSwitching) {
        return;
      }

      const exportAreaReferencePlugin =
        instance.getPlugin<ExportAreaReferencePlugin>(
          EXPORT_AREA_REFERENCE_PLUGIN_KEY,
        );

      if (!exportAreaReferencePlugin) {
        return;
      }

      if (roomState !== "loaded") {
        return;
      }

      setGenerationState("generating");

      const stage = instance.getStage();

      const clonedStage = stage.clone();
      const mainLayer = clonedStage.findOne("#mainLayer") as
        | Konva.Layer
        | undefined;
      clonedStage.getLayers().forEach((layer) => {
        layer.visible(layer === mainLayer);
      });

      const exportRect = exportAreaReferencePlugin.getExportRect();

      clonedStage.toBlob({
        x: exportRect.x,
        y: exportRect.y,
        width: exportRect.width,
        height: exportRect.height,
        pixelRatio: 1,
        mimeType: "image/png",
        callback: (blob: Blob | null) => {
          if (!blob) {
            setGenerationState("generated");
            return;
          }
          setPageThumbnail(blob);
          setGenerationState("generated");
        },
      });
    };

    if (exportConfigVisible) {
      onRenderHandler();
    }
  }, [instance, isRoomSwitching, roomState, exportConfigVisible]);

  return { roomState, generationState, pageThumbnail };
};
