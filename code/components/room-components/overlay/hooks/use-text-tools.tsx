// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { ALargeSmall, Type } from "lucide-react";
import { useWeave } from "@inditextech/weave-react";
import { formatForDisplay } from "@tanstack/react-hotkeys";

export const useTextTools = () => {
  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);

  const triggerTool = React.useCallback(
    (toolName: string) => {
      if (instance && actualAction !== toolName) {
        instance.triggerAction(toolName);
        return;
      }
      if (instance && actualAction === toolName) {
        instance.cancelAction(toolName);
      }
    },
    [instance, actualAction],
  );

  const TEXT_TOOLS: Record<
    string,
    {
      icon: React.JSX.Element;
      label: React.JSX.Element;
      onClick: () => void;
      active: () => boolean;
    }
  > = React.useMemo(
    () => ({
      richTextTool: {
        icon: <ALargeSmall className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Rich text tool</p>
            {formatForDisplay("Shift+T")}
          </div>
        ),
        onClick: () => triggerTool("richTextTool"),
        active: () => actualAction === "richTextTool",
      },
      textTool: {
        icon: <Type className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Text tool</p>
            {formatForDisplay("T")}
          </div>
        ),
        onClick: () => triggerTool("textTool"),
        active: () => actualAction === "textTool",
      },
    }),
    [actualAction, triggerTool],
  );

  return TEXT_TOOLS;
};
