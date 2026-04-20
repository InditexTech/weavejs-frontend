// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import {
  Brush,
  Circle,
  Hexagon,
  MoveUpRight,
  PenLine,
  Square,
  Star,
} from "lucide-react";
import React from "react";
import { ShortcutElement } from "../../help/shortcut-element";
import { SYSTEM_OS } from "@/lib/utils";
import { useWeave } from "@inditextech/weave-react";

export const useShapesTools = () => {
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

  const SHAPES_TOOLS: Record<
    string,
    {
      icon: React.JSX.Element;
      label: React.JSX.Element;
      onClick: () => void;
      active: () => boolean;
    }
  > = React.useMemo(
    () => ({
      rectangleTool: {
        icon: <Square className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Rectangle tool</p>
            <ShortcutElement
              shortcuts={{
                [SYSTEM_OS.MAC]: "R",
                [SYSTEM_OS.OTHER]: "R",
              }}
            />
          </div>
        ),
        onClick: () => triggerTool("rectangleTool"),
        active: () => actualAction === "rectangleTool",
      },
      ellipseTool: {
        icon: <Circle className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Ellipsis tool</p>
            <ShortcutElement
              shortcuts={{
                [SYSTEM_OS.MAC]: "E",
                [SYSTEM_OS.OTHER]: "E",
              }}
            />
          </div>
        ),
        onClick: () => triggerTool("ellipseTool"),
        active: () => actualAction === "ellipseTool",
      },
      regularPolygonTool: {
        icon: <Hexagon className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Regular Polygon tool</p>
            <ShortcutElement
              shortcuts={{
                [SYSTEM_OS.MAC]: "P",
                [SYSTEM_OS.OTHER]: "P",
              }}
            />
          </div>
        ),
        onClick: () => triggerTool("regularPolygonTool"),
        active: () => actualAction === "regularPolygonTool",
      },
      starTool: {
        icon: <Star className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Star tool</p>
            <ShortcutElement
              shortcuts={{
                [SYSTEM_OS.MAC]: "J",
                [SYSTEM_OS.OTHER]: "J",
              }}
            />
          </div>
        ),
        onClick: () => triggerTool("starTool"),
        active: () => actualAction === "starTool",
      },
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

  return SHAPES_TOOLS;
};
