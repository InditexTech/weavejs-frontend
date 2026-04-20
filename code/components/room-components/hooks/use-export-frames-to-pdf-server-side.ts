// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Buffer } from "buffer";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { WeaveExportNodesOptions } from "@inditextech/weave-types";
import { useWeave } from "@inditextech/weave-react";
import { postExportFramesToPDFAsync } from "@/api/post-export-frames-to-pdf-async";
import { useCollaborationRoom } from "@/store/store";
import { useGetSession } from "./use-get-session";

export const useExportFramesToPDFServerSide = () => {
  const instance = useWeave((state) => state.instance);

  const { session } = useGetSession();

  const clientId = useCollaborationRoom((state) => state.clientId);
  const room = useCollaborationRoom((state) => state.room);
  const exporting = useCollaborationRoom(
    (state) => state.frames.export.exporting,
  );
  const setFramesExporting = useCollaborationRoom(
    (state) => state.setFramesExporting,
  );

  const mutateExport = useMutation({
    mutationFn: async ({
      roomData,
      pages,
      options,
    }: {
      roomData: string;
      pages: { title: string; nodes: string[] }[];
      options: WeaveExportNodesOptions;
    }) => {
      return await postExportFramesToPDFAsync(
        session?.user.id ?? "",
        clientId ?? "",
        room ?? "",
        roomData,
        pages,
        options,
      );
    },
    onError(error) {
      console.error(error);
      toast.error("Error exporting to PDF.");
    },
  });

  const handlePrintStateSnapshotToClipboard = React.useCallback(async () => {
    if (instance) {
      const snapshot: Uint8Array<ArrayBufferLike> = instance
        .getStore()
        .getStateSnapshot();
      await navigator.clipboard.writeText(
        Buffer.from(snapshot).toString("base64"),
      );
      console.log("State snapshot copied to clipboard");
    }
  }, [instance]);

  const handleExportFramesToPDFServerSide = React.useCallback(
    async ({
      pages,
      padding,
      pixelRatio,
    }: {
      pages: { title: string; nodes: string[] }[];
      padding: number;
      pixelRatio: number;
    }) => {
      if (!instance) return;

      setFramesExporting(true);

      const snapshot: Uint8Array<ArrayBufferLike> = instance
        .getStore()
        .getStateSnapshot();

      mutateExport.mutate({
        roomData: Buffer.from(snapshot).toString("base64"),
        pages,
        options: {
          pixelRatio,
          padding,
        },
      });
    },
    [instance, mutateExport, setFramesExporting],
  );

  // const isExporting = React.useCallback(() => exporting, [exporting]);

  return {
    handlePrintStateSnapshotToClipboard,
    handleExportFramesToPDFServerSide,
    isExporting: exporting,
  };
};
