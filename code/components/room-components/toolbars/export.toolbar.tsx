// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { FileDown, ImageDown } from "lucide-react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { useCollaborationRoom } from "@/store/store";
import { useWeave } from "@inditextech/weave-react";
import { Divider } from "../overlay/divider";
import { useIsRoomReady } from "../hooks/use-is-room-ready";

export const ExportToolbar = () => {
  const isRoomSwitching = useWeave((state) => state.room.switching);

  const setExportNodes = useCollaborationRoom((state) => state.setExportNodes);
  const setExportPageToImageConfigVisible = useCollaborationRoom(
    (state) => state.setExportPageToImageConfigVisible,
  );
  const setExportRoomToPdfConfigVisible = useCollaborationRoom(
    (state) => state.setExportRoomToPdfConfigVisible,
  );

  const isRoomReady = useIsRoomReady();

  if (!isRoomReady || isRoomSwitching) {
    return null;
  }

  return (
    <>
      {/* <ToolbarButton
        icon={<ImageDown strokeWidth={1} />}
        onClick={async () => {
          if (!instance) {
            return;
          }

          const exportAreaReferencePlugin =
            instance.getPlugin<ExportAreaReferencePlugin>(
              EXPORT_AREA_REFERENCE_PLUGIN_KEY,
            );

          if (!exportAreaReferencePlugin) {
            return;
          }

          const exportAreaReferencePluginPrev =
            exportAreaReferencePlugin.isEnabled();

          exportAreaReferencePlugin.disable();

          const stage = instance.getStage();
          const exportRect = exportAreaReferencePlugin.getExportRect({
            relativeTo: stage,
          });

          const img = await instance.exportArea(exportRect, {
            format: "image/png",
            padding: 0,
            pixelRatio: 1,
            backgroundColor: "#ffffff",
          });

          if (exportAreaReferencePluginPrev) {
            exportAreaReferencePlugin.enable();
          }

          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;

          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          ctx.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            if (!blob) return;

            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "export-client.png";
            a.click();

            URL.revokeObjectURL(url);
          }, "image/png");
        }}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>Export page as image (client-side)</p>
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="top"
        tooltipAlign="center"
      /> */}
      <ToolbarButton
        icon={<ImageDown strokeWidth={1} />}
        onClick={() => {
          setExportNodes([]);
          setExportPageToImageConfigVisible(true);
        }}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>Export page as image</p>
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="top"
        tooltipAlign="center"
      />
      <ToolbarButton
        icon={<FileDown strokeWidth={1} />}
        onClick={() => {
          setExportNodes([]);
          setExportRoomToPdfConfigVisible(true);
        }}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>Export room as PDF</p>
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="top"
        tooltipAlign="center"
      />
      <Divider className="h-[20px]" />
    </>
  );
};
