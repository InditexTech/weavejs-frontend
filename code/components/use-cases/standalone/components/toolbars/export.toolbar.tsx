// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { ImageDown } from "lucide-react";
import { ToolbarButton } from "@/components/room-components/toolbar/toolbar-button";
import { useCollaborationRoom } from "@/store/store";
import { useStandaloneUseCase } from "../../store/store";

export function ExportToolbar() {
  const instanceLoading = useStandaloneUseCase(
    (state) => state.instanceLoading,
  );

  const setExportNodes = useCollaborationRoom((state) => state.setExportNodes);
  const setExportConfigVisible = useCollaborationRoom(
    (state) => state.setExportPageToImageConfigVisible,
  );

  return (
    <>
      <ToolbarButton
        icon={<ImageDown size={20} strokeWidth={1} />}
        onClick={() => {
          setExportNodes([]);
          setExportConfigVisible(true);
        }}
        disabled={instanceLoading}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>Export</p>
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="bottom"
        tooltipAlign="center"
      />
    </>
  );
}
