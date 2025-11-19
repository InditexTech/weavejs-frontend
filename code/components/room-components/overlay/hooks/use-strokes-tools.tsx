// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { ArrowUpRight, Brush, PenLine, PenTool } from "lucide-react";
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
    [instance, actualAction]
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
      penTool: {
        icon: <PenTool className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Pen tool</p>
            <ShortcutElement
              shortcuts={{
                [SYSTEM_OS.MAC]: "Q",
                [SYSTEM_OS.OTHER]: "Q",
              }}
            />
          </div>
        ),
        onClick: () => triggerTool("penTool"),
        active: () => actualAction === "penTool",
      },
      lineTool: {
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
        onClick: () => triggerTool("lineTool"),
        active: () => actualAction === "lineTool",
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
      arrowTool: {
        icon: <ArrowUpRight className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Arrow tool</p>
            <ShortcutElement
              shortcuts={{
                [SYSTEM_OS.MAC]: "A",
                [SYSTEM_OS.OTHER]: "A",
              }}
            />
          </div>
        ),
        onClick: () => triggerTool("arrowTool"),
        active: () => actualAction === "arrowTool",
      },
    }),
    [actualAction, triggerTool]
  );

  return STROKES_TOOLS;
};
