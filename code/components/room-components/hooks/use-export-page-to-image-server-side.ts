// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Buffer } from "buffer";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { postExportPageToImageAsync } from "@/api/post-export-page-to-image-async";
import {
  WeaveExportFormats,
  WeaveExportNodesOptions,
} from "@inditextech/weave-types";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { useGetSession } from "./use-get-session";

export const useExportPageToImageServerSide = () => {
  const instance = useWeave((state) => state.instance);

  const { session } = useGetSession();

  const clientId = useCollaborationRoom((state) => state.clientId);
  const room = useCollaborationRoom((state) => state.room);
  const exporting = useCollaborationRoom((state) => state.images.exporting);
  const setImageExporting = useCollaborationRoom(
    (state) => state.setImageExporting,
  );

  const mutateExport = useMutation({
    mutationFn: async (
      params: {
        roomData: string;
        options: WeaveExportNodesOptions;
      } & (
        | {
            type: "nodes";
            nodes: string[];
          }
        | {
            type: "area";
            area: { x: number; y: number; width: number; height: number };
          }
      ),
    ) => {
      const { roomData, type, options } = params;

      switch (type) {
        case "nodes": {
          return await postExportPageToImageAsync({
            userId: session?.user.id ?? "",
            clientId: clientId ?? "",
            roomId: room ?? "",
            roomData,
            options,
            responseType: "zip",
            type: "nodes",
            nodes: params.nodes,
          });
        }
        case "area": {
          return await postExportPageToImageAsync({
            userId: session?.user.id ?? "",
            clientId: clientId ?? "",
            roomId: room ?? "",
            roomData,
            options,
            responseType: "zip",
            type: "area",
            area: params.area,
          });
        }
        default:
          return;
      }
    },
    onError(error) {
      console.error(error);
      toast.error("Export page to image", {
        description:
          "An error occurred while requesting the export. Please try again.",
      });
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

  const handleExportPageToImageServerSide = React.useCallback(
    async (
      params: {
        format: WeaveExportFormats;
        padding: number;
        backgroundColor: string;
        pixelRatio: number;
        quality?: number;
      } & (
        | {
            type: "nodes";
            nodes: string[];
          }
        | {
            type: "area";
            area: { x: number; y: number; width: number; height: number };
          }
      ),
    ) => {
      if (!instance) return;

      setImageExporting(true);

      const snapshot: Uint8Array<ArrayBufferLike> = instance
        .getStore()
        .getStateSnapshot();

      const { type, format, padding, backgroundColor, pixelRatio, quality } =
        params;

      if (type === "nodes") {
        mutateExport.mutate({
          roomData: Buffer.from(snapshot).toString("base64"),
          type: "nodes",
          nodes: params.nodes,
          options: {
            format,
            pixelRatio,
            padding,
            backgroundColor,
            ...(format === "image/jpeg" && { quality }),
          },
        });
      }

      if (type === "area") {
        mutateExport.mutate({
          roomData: Buffer.from(snapshot).toString("base64"),
          type: "area",
          area: params.area,
          options: {
            format,
            pixelRatio,
            padding,
            backgroundColor,
            ...(format === "image/jpeg" && { quality }),
          },
        });
      }
    },
    [instance, mutateExport, setImageExporting],
  );

  return {
    handlePrintStateSnapshotToClipboard,
    handleExportPageToImageServerSide,
    isExporting: exporting,
  };
};
