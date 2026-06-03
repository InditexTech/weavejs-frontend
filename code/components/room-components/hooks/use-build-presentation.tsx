// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { toast } from "sonner";
import { postGeneratePresentationModeImagesAsync } from "@/api/post-generate-presentation-mode-images-async";
import { EXPORT_AREA_REFERENCE_PLUGIN_KEY } from "@/components/plugins/export-area-reference/constants";
import { ExportAreaReferencePlugin } from "@/components/plugins/export-area-reference/export-area-reference";
import { useCollaborationRoom } from "@/store/store";
import { useWeave } from "@inditextech/weave-react";
import { WeaveExportNodesOptions } from "@inditextech/weave-types";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { useGetSession } from "./use-get-session";

export const useBuildPresentation = () => {
  const instance = useWeave((state) => state.instance);

  const { session } = useGetSession();

  const pageInfo = useCollaborationRoom(
    (state) => state.pages.actualPageElement,
  );
  const clientId = useCollaborationRoom((state) => state.clientId);
  const presentationModeVisible = useCollaborationRoom(
    (state) => state.presentation.visible,
  );
  const presentationModeStatus = useCollaborationRoom(
    (state) => state.presentation.status,
  );
  const setPresentationStatus = useCollaborationRoom(
    (state) => state.setPresentationStatus,
  );

  const mutateGenerateImages = useMutation({
    mutationFn: async ({
      type,
      area,
      roomId,
      options,
    }: {
      type: "area";
      area: { x: number; y: number; width: number; height: number };
      roomId: string;
      options: WeaveExportNodesOptions;
    }) => {
      setPresentationStatus("loading");
      return await postGeneratePresentationModeImagesAsync(
        session?.user.id ?? "",
        clientId ?? "",
        roomId,
        type,
        area,
        options,
      );
    },
    onError(error) {
      setPresentationStatus("error");
      console.error(error);
      toast.error("Failed to build presentation, please try again");
    },
  });

  const triggerPresentationBuild = React.useCallback(() => {
    if (!instance) {
      return;
    }

    if (presentationModeStatus === "loading") {
      return;
    }

    const exportAreaReferencePlugin =
      instance.getPlugin<ExportAreaReferencePlugin>(
        EXPORT_AREA_REFERENCE_PLUGIN_KEY,
      );

    if (!exportAreaReferencePlugin) {
      return;
    }

    const stage = instance.getStage();
    const exportRect = exportAreaReferencePlugin.getExportRect({
      relativeTo: stage,
    });

    if (!exportRect) {
      return;
    }

    mutateGenerateImages.mutate({
      type: "area",
      area: exportRect,
      roomId: pageInfo.roomId,
      options: {
        pixelRatio: 1,
        padding: 0,
      },
    });
  }, [
    instance,
    mutateGenerateImages,
    pageInfo,
    presentationModeVisible,
    presentationModeStatus,
  ]);

  return { triggerPresentationBuild };
};
