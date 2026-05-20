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
import { debounce } from "lodash";

export const useUpdatePageThumbnail = () => {
  const [roomState, setRoomState] = React.useState<
    "idle" | "loading" | "loaded"
  >("idle");

  const instance = useWeave((state) => state.instance);
  const isRoomSwitching = useWeave((state) => state.room.switching);

  const [lastUpdate, setLastUpdate] = React.useState<number>(0);
  const [doUpdatePageThumbnail, setDoUpdatePageThumbnail] =
    React.useState<boolean>(false);
  const [actualLeaderId, setActualLeaderId] = React.useState<string | null>(
    null,
  );

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
    if (actualLeaderId !== leaderId) {
      setActualLeaderId(leaderId);
      if (leaderId === clientId) {
        setDoUpdatePageThumbnail(true);
      }
    }
  }, [clientId, leaderId, actualLeaderId]);

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

    const takePageThumbnail = async () => {
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

      if (!exportRect) {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob: any = await clonedStage.toBlob({
        x: exportRect.x,
        y: exportRect.y,
        width: exportRect.width,
        height: exportRect.height,
        pixelRatio: (1 / stage.scaleX()) * 0.3,
        mimeType: "image/png",
      });

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

      if (leaderId === clientId && Date.now() > lastUpdate) {
        setLastUpdate(Date.now());
        updatePageThumbnail.mutate({
          roomId: roomId ?? "",
          pageId: actualPageId ?? "",
          thumbnail: blob,
        });
      }
    };

    const debouncedTakePageThumbnail = debounce(takePageThumbnail, 500);

    const onRenderHandler = async () => {
      if (!instance) {
        return;
      }

      while (!instance.asyncElementsLoaded()) {
        await sleep(100);
      }

      debouncedTakePageThumbnail();
    };

    instance.addEventListener("onRender", onRenderHandler);

    if (doUpdatePageThumbnail) {
      setDoUpdatePageThumbnail(false);
      debouncedTakePageThumbnail();
    }

    return () => {
      instance.removeEventListener("onRender", onRenderHandler);
    };
  }, [
    instance,
    roomId,
    updatePageThumbnail,
    doUpdatePageThumbnail,
    leaderId,
    clientId,
    roomState,
    isRoomSwitching,
    actualPageElement,
    actualPageId,
  ]);
};
