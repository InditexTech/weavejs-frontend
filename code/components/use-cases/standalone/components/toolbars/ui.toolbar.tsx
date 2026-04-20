// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ToolbarButton } from "@/components/room-components/toolbar/toolbar-button";
import { useStandaloneUseCase } from "../../store/store";

export const UIToolbar = () => {
  const sidebarVisible = useStandaloneUseCase((state) => state.sidebar.visible);
  const instanceLoading = useStandaloneUseCase(
    (state) => state.instanceLoading,
  );
  const setSidebarVisible = useStandaloneUseCase(
    (state) => state.setSidebarVisible,
  );

  return (
    <>
      <ToolbarButton
        icon={
          sidebarVisible ? (
            <PanelLeftOpen strokeWidth={1} />
          ) : (
            <PanelLeftClose strokeWidth={1} />
          )
        }
        onClick={() => {
          setSidebarVisible(!sidebarVisible);
        }}
        disabled={instanceLoading}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>Toggle sidebar</p>
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="bottom"
        tooltipAlign="end"
      />
    </>
  );
};
