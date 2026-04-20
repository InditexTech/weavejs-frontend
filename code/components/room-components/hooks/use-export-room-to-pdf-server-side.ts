// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Buffer } from "buffer";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { WeaveExportNodesOptions } from "@inditextech/weave-types";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { postExportRoomToPDFAsync } from "@/api/post-export-room-to-pdf-async";
import { useGetSession } from "./use-get-session";

export const useExportRoomToPDFServerSide = () => {
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
      return await postExportRoomToPDFAsync(
        session?.user.id ?? "",
        clientId ?? "",
        roomId,
        type,
        area,
        options,
      );
    },
    onError(error) {
      console.error(error);
      toast.error("Error requesting export of room to PDF, please try again");
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

  const handleExportRoomToPDFServerSide = React.useCallback(
    async ({
      type,
      area,
      padding,
      pixelRatio,
    }: {
      type: "area";
      area: { x: number; y: number; width: number; height: number };
      padding: number;
      pixelRatio: number;
    }) => {
      if (!instance) return;

      setFramesExporting(true);

      mutateExport.mutate({
        roomId: room ?? "",
        type,
        area,
        options: {
          pixelRatio,
          padding,
        },
      });
    },
    [instance, room, mutateExport, setFramesExporting],
  );

  return {
    handlePrintStateSnapshotToClipboard,
    handleExportRoomToPDFServerSide,
    isExporting: exporting,
  };
};
