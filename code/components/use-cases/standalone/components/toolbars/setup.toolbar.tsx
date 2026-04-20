// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Cog } from "lucide-react";
import { ToolbarButton } from "@/components/room-components/toolbar/toolbar-button";
import { useStandaloneUseCase } from "../../store/store";

export function SetupToolbar() {
  const instanceLoading = useStandaloneUseCase(
    (state) => state.instanceLoading,
  );
  const setConfigurationOpen = useStandaloneUseCase(
    (state) => state.setConfigurationOpen,
  );

  return (
    <>
      <ToolbarButton
        icon={<Cog size={20} strokeWidth={1} />}
        onClick={() => {
          setConfigurationOpen(true);
        }}
        disabled={instanceLoading}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>Setup</p>
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
