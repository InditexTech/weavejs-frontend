// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { useIACapabilities } from "@/store/ia";
import { ToolbarButton } from "../../toolbar/toolbar-button";
import { Hand } from "lucide-react";
import { ShortcutElement } from "../../help/shortcut-element";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { SYSTEM_OS } from "@/lib/utils";

type MoveToolTriggerProps = {
  tooltipSide?: "top" | "bottom" | "left" | "right";
  tooltipAlign?: "start" | "center" | "end";
};

export const MoveToolTrigger = ({
  tooltipSide = "top",
  tooltipAlign = "center",
}: Readonly<MoveToolTriggerProps>) => {
  const instance = useWeave((state) => state.instance);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);
  const actualAction = useWeave((state) => state.actions.actual);

  const imagesLLMPopupVisible = useIACapabilities(
    (state) => state.llmPopup.visible
  );

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
    [instance, actualAction]
  );

  return (
    <ToolbarButton
      className="rounded-full !w-[40px]"
      icon={<Hand className="px-2" size={40} strokeWidth={1} />}
      disabled={
        weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
      }
      active={actualAction === "moveTool"}
      onClick={() => {
        if (imagesLLMPopupVisible) {
          triggerTool("moveTool", {
            triggerSelectionTool: false,
          });
        } else {
          triggerTool("moveTool");
        }
      }}
      label={
        <div className="flex gap-3 justify-start items-center">
          <p>Move tool</p>
          <ShortcutElement
            shortcuts={{
              [SYSTEM_OS.MAC]: "M",
              [SYSTEM_OS.OTHER]: "M",
            }}
          />
        </div>
      }
      tooltipSide={tooltipSide}
      tooltipAlign={tooltipAlign}
    />
  );
};
