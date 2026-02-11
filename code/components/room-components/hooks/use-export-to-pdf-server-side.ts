// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { WeaveExportNodesOptions } from "@inditextech/weave-types";
import { useWeave } from "@inditextech/weave-react";
// import { postExportToPDF } from "@/api/post-export-to-pdf";
import { postExportToPDFAsync } from "@/api/post-export-to-pdf-async";
import { useCollaborationRoom } from "@/store/store";

export const useExportToPDFServerSide = () => {
  const instance = useWeave((state) => state.instance);

  const user = useCollaborationRoom((state) => state.user);
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
      return await postExportToPDFAsync(
        user?.id ?? "",
        clientId ?? "",
        room ?? "",
        roomData,
        pages,
        options,
      );
    },
    // onMutate: ({ pages }) => {
    //   const toastId = toast.loading(
    //     pages.length === 0
    //       ? "Exporting room to PDF..."
    //       : "Exporting selected nodes to PDF...",
    //   );
    //   return { toastId };
    // },
    // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // onSettled: (_, __, ___, context: any) => {
    //   setFramesExporting(false);
    //   if (context?.toastId) {
    //     toast.dismiss(context.toastId);
    //   }
    // },
    // onSuccess: (blob, { pages }) => {
    //   const url = window.URL.createObjectURL(blob);

    //   const a = document.createElement("a");
    //   a.href = url;
    //   a.download = "export.zip"; // <-- suggested filename
    //   document.body.appendChild(a);
    //   a.click();

    //   a.remove();
    //   window.URL.revokeObjectURL(url);

    //   toast.success(
    //     pages.length === 0
    //       ? "Exported room PDF downloaded."
    //       : "Exported selected nodes PDF downloaded.",
    //   );
    // },
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

  const handleExportToPDFServerSide = React.useCallback(
    async ({
      pages,
      padding,
      backgroundColor,
      pixelRatio,
    }: {
      pages: { title: string; nodes: string[] }[];
      padding: number;
      backgroundColor: string;
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
          backgroundColor,
        },
      });
    },
    [instance, mutateExport, setFramesExporting],
  );

  // const isExporting = React.useCallback(() => exporting, [exporting]);

  return {
    handlePrintStateSnapshotToClipboard,
    handleExportToPDFServerSide,
    isExporting: exporting,
  };
};
