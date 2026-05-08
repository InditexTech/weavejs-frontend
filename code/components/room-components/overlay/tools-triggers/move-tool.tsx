// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { ToolbarButton } from "../../toolbar/toolbar-button";
import { Hand } from "lucide-react";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { formatForDisplay } from "@tanstack/react-hotkeys";

type MoveToolTriggerProps = {
  tooltipSide?: "top" | "bottom" | "left" | "right";
  tooltipAlign?: "start" | "center" | "end";
};

export const MoveToolTrigger = ({
  tooltipSide = "top",
  tooltipAlign = "center",
}: Readonly<MoveToolTriggerProps>) => {
  const instance = useWeave((state) => state.instance);
  const isSwitchingRoom = useWeave((state) => state.room.switching);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);
  const actualAction = useWeave((state) => state.actions.actual);

  const triggerTool = React.useCallback(
    (toolName: string, params?: unknown) => {
      if (instance && actualAction !== toolName) {
        instance.triggerAction(toolName, params);
        return;
      }
      if (instance && actualAction === toolName) {
        instance.cancelAction(toolName);
      }
    },
    [instance, actualAction],
  );

  return (
    <ToolbarButton
      className="rounded-none !w-[40px]"
      icon={<Hand className="px-2" size={40} strokeWidth={1} />}
      disabled={
        weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED ||
        isSwitchingRoom
      }
      active={actualAction === "moveTool"}
      onClick={() => {
        triggerTool("moveTool");
      }}
      label={
        <div className="flex gap-3 justify-start items-center">
          <p>Move tool</p>
          {formatForDisplay("M")}
        </div>
      }
      tooltipSide={tooltipSide}
      tooltipAlign={tooltipAlign}
      size="medium"
    />
  );
};
