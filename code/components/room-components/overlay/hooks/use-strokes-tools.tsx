// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Brush, MoveUpRight, PenLine } from "lucide-react";
import React from "react";
import { ShortcutElement } from "../../help/shortcut-element";
import { SYSTEM_OS } from "@/lib/utils";
import { useWeave } from "@inditextech/weave-react";

export const useStrokesTools = () => {
  const instance = useWeave((state) => state.instance);
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

  const STROKES_TOOLS: Record<
    string,
    {
      icon: React.JSX.Element;
      label: React.JSX.Element;
      onClick: () => void;
      active: () => boolean;
    }
  > = React.useMemo(
    () => ({
      strokeTool: {
        icon: <PenLine className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Line tool</p>
            <ShortcutElement
              shortcuts={{
                [SYSTEM_OS.MAC]: "L",
                [SYSTEM_OS.OTHER]: "L",
              }}
            />
          </div>
        ),
        onClick: () => {
          triggerTool("strokeTool");
        },
        active: () => actualAction === "strokeTool",
      },
      arrowTool: {
        icon: <MoveUpRight className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Arrow tool</p>
            <ShortcutElement
              shortcuts={{
                [SYSTEM_OS.MAC]: "L",
                [SYSTEM_OS.OTHER]: "L",
              }}
            />
          </div>
        ),
        onClick: () => {
          if (!instance) return;

          triggerTool("arrowTool");

          instance.updatePropsAction("arrowTool", {
            stroke: "#000000ff",
            strokeWidth: 1,
            opacity: 1,
            tipStartStyle: "none",
            tipEndStyle: "arrow",
            tipEndBase: 5,
            tipEndHeight: (Math.sqrt(3) / 2) * 5,
          });
        },
        active: () => actualAction === "arrowTool",
      },
      brushTool: {
        icon: <Brush className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Brush tool</p>
            <ShortcutElement
              shortcuts={{
                [SYSTEM_OS.MAC]: "B",
                [SYSTEM_OS.OTHER]: "B",
              }}
            />
          </div>
        ),
        onClick: () => triggerTool("brushTool"),
        active: () => actualAction === "brushTool",
      },
    }),
    [instance, actualAction, triggerTool],
  );

  return STROKES_TOOLS;
};
