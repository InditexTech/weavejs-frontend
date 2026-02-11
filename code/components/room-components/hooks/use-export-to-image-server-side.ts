// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
// import { postExportToImage } from "@/api/post-export-to-image";
import { postExportToImageAsync } from "@/api/post-export-to-image-async";
import {
  WeaveExportFormats,
  WeaveExportNodesOptions,
} from "@inditextech/weave-types";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";

export const useExportToImageServerSide = () => {
  const instance = useWeave((state) => state.instance);

  const user = useCollaborationRoom((state) => state.user);
  const clientId = useCollaborationRoom((state) => state.clientId);
  const room = useCollaborationRoom((state) => state.room);
  const exporting = useCollaborationRoom((state) => state.images.exporting);
  const setImageExporting = useCollaborationRoom(
    (state) => state.setImageExporting,
  );

  const mutateExport = useMutation({
    mutationFn: async ({
      roomData,
      nodes,
      options,
    }: {
      roomData: string;
      nodes: string[];
      options: WeaveExportNodesOptions;
    }) => {
      return await postExportToImageAsync(
        user?.id ?? "",
        clientId ?? "",
        room ?? "",
        roomData,
        nodes,
        options,
      );
      // return await postExportToImage(roomData, nodes, options);
    },
    // onMutate: ({ nodes }) => {
    //   const toastId = toast.loading(
    //     nodes.length === 0
    //       ? "Requesting export of room to image..."
    //       : "Requesting export of selected nodes to image...",
    //   );
    //   return { toastId };
    // },
    // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // onSettled: (_, __, ___, context: any) => {
    //   // setExporting(false);
    //   if (context?.toastId) {
    //     toast.dismiss(context.toastId);
    //   }
    // },
    // onSuccess: (blob, { nodes }) => {
    // const url = window.URL.createObjectURL(blob);
    // const a = document.createElement("a");
    // a.href = url;
    // a.download = "export.zip"; // <-- suggested filename
    // document.body.appendChild(a);
    // a.click();
    // a.remove();
    // window.URL.revokeObjectURL(url);
    // toast.success(
    //   nodes.length === 0
    //     ? "Exported room image requested."
    //     : "Exported selected nodes image requested.",
    // );
    // },
    onError(error, { nodes }) {
      console.error(error);
      toast.error(
        nodes.length === 0
          ? "Error requesting export of room to image."
          : "Error requesting export of selected nodes to image.",
      );
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

  const handleExportToImageServerSide = React.useCallback(
    async ({
      nodes,
      format,
      padding,
      backgroundColor,
      pixelRatio,
      quality,
    }: {
      nodes: string[];
      format: WeaveExportFormats;
      padding: number;
      backgroundColor: string;
      pixelRatio: number;
      quality?: number;
    }) => {
      if (!instance) return;

      setImageExporting(true);

      const snapshot: Uint8Array<ArrayBufferLike> = instance
        .getStore()
        .getStateSnapshot();

      mutateExport.mutate({
        roomData: Buffer.from(snapshot).toString("base64"),
        nodes,
        options: {
          format,
          pixelRatio,
          padding,
          backgroundColor,
          ...(format === "image/jpeg" && { quality }),
        },
      });
    },
    [instance, mutateExport, setImageExporting],
  );

  // const isExporting = React.useCallback(() => exporting, [exporting]);

  return {
    handlePrintStateSnapshotToClipboard,
    handleExportToImageServerSide,
    isExporting: exporting,
  };
};
