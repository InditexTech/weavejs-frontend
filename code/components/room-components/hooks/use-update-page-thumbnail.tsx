// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useMutation } from "@tanstack/react-query";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { ExportAreaReferencePlugin } from "@/components/plugins/export-area-reference/export-area-reference";
import { EXPORT_AREA_REFERENCE_PLUGIN_KEY } from "@/components/plugins/export-area-reference/constants";
import { putPageThumbnail } from "@/api/pages/put-page-thumbnail";
import { sleep } from "@/lib/utils";
import { getEmmiter } from "./use-tasks-events";
import Konva from "konva";

export const useUpdatePageThumbnail = () => {
  const [roomState, setRoomState] = React.useState<
    "idle" | "loading" | "loaded"
  >("idle");

  const instance = useWeave((state) => state.instance);
  const isRoomSwitching = useWeave((state) => state.room.switching);

  const leaderId = useCollaborationRoom((state) => state.leaderId);
  const clientId = useCollaborationRoom((state) => state.clientId);
  const roomId = useCollaborationRoom((state) => state.room);

  const actualPageId = useCollaborationRoom(
    (state) => state.pages.actualPageId,
  );
  const actualPageElement = useCollaborationRoom(
    (state) => state.pages.actualPageElement,
  );

  React.useEffect(() => {
    setRoomState("idle");
  }, [actualPageId]);

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

  const updatePageThumbnail = useMutation({
    mutationFn: async (params: {
      roomId: string;
      pageId: string;
      thumbnail: Blob;
    }) => {
      if (!params.roomId) {
        throw new Error("Room ID is required to create a page");
      }

      return await putPageThumbnail(
        params.roomId,
        params.pageId,
        params.thumbnail,
      );
    },
    onError: (error) => {
      console.error("Error updating page", error);
    },
  });

  React.useEffect(() => {
    if (!instance) {
      return;
    }

    const takePageThumbnail = async (isLoaded: boolean = false) => {
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

      if (!isLoaded && roomState !== "loaded") {
        return;
      }

      if (!actualPageElement) {
        return;
      }

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
        pixelRatio: (1 / stage.scaleX()) * 0.3,
        mimeType: "image/png",
        callback: (blob: Blob | null) => {
          if (!blob) {
            return;
          }

          const reader = new FileReader();

          reader.onloadend = () => {
            getEmmiter().emit("pageThumbnailUpdated", {
              roomId: roomId ?? "",
              pageId: actualPageId ?? "",
              dataURL: reader.result as string,
            });
          };

          reader.onerror = () => {
            console.error();
          };

          reader.readAsDataURL(blob);

          if (leaderId === clientId) {
            updatePageThumbnail.mutate({
              roomId: roomId ?? "",
              pageId: actualPageId ?? "",
              thumbnail: blob,
            });
          }
        },
      });
    };

    const onAsyncElementsLoadedHandler = () => {
      takePageThumbnail(true);
    };

    const onRenderHandler = async () => {
      if (!instance) {
        return;
      }

      while (!instance.asyncElementsLoaded()) {
        await sleep(100);
      }

      takePageThumbnail();
    };

    instance.addEventListener("onRender", onRenderHandler);
    instance.addEventListener(
      "onAsyncElementsLoaded",
      onAsyncElementsLoadedHandler,
    );

    return () => {
      instance.removeEventListener("onRender", onRenderHandler);
      instance.removeEventListener(
        "onAsyncElementsLoaded",
        onAsyncElementsLoadedHandler,
      );
    };
  }, [
    instance,
    roomId,
    updatePageThumbnail,
    leaderId,
    clientId,
    roomState,
    isRoomSwitching,
    actualPageElement,
    actualPageId,
  ]);
};
