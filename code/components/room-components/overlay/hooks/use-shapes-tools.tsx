// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import {
  Brush,
  Circle,
  // Hexagon,
  MoveUpRight,
  PenLine,
  Pentagon,
  Square,
  Star,
} from "lucide-react";
import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { WeavePolygonToolAction } from "@inditextech/weave-sdk";
import { formatForDisplay } from "@tanstack/react-hotkeys";

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
          <div className="text-xs flex gap-3 justify-start items-center">
            <p>Rectangle tool</p>
            {formatForDisplay("R")}
          </div>
        ),
        onClick: () => triggerTool("rectangleTool"),
        active: () => actualAction === "rectangleTool",
      },
      ellipseTool: {
        icon: <Circle className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="text-xs flex gap-3 justify-start items-center">
            <p>Ellipsis tool</p>
            {formatForDisplay("E")}
          </div>
        ),
        onClick: () => triggerTool("ellipseTool"),
        active: () => actualAction === "ellipseTool",
      },
      // regularPolygonTool: {
      //   icon: <Hexagon className="px-2" size={40} strokeWidth={1} />,
      //   label: (
      //     <div className="text-xs flex gap-3 justify-start items-center">
      //       <p>Regular Polygon tool</p>
      //       {formatForDisplay("P")}
      //     </div>
      //   ),
      //   onClick: () => triggerTool("regularPolygonTool"),
      //   active: () => actualAction === "regularPolygonTool",
      // },
      polygonTool: {
        icon: <Pentagon className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="text-xs flex gap-3 justify-start items-center">
            <p>Polygon tool</p>
            {formatForDisplay("P")}
          </div>
        ),
        onClick: () => {
          if (!instance) return;

          triggerTool("polygonTool");

          const polygonTool =
            instance.getActionHandler<WeavePolygonToolAction>("polygonTool");

          if (!polygonTool) return;

          polygonTool.updateProps({
            scaleFactor: 2,
          });
        },
        active: () => actualAction === "polygonTool",
      },
      starTool: {
        icon: <Star className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="text-xs flex gap-3 justify-start items-center">
            <p>Star tool</p>
            {formatForDisplay("J")}
          </div>
        ),
        onClick: () => triggerTool("starTool"),
        active: () => actualAction === "starTool",
      },
      strokeTool: {
        icon: <PenLine className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="text-xs flex gap-3 justify-start items-center">
            <p>Line tool</p>
            {formatForDisplay("L")}
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
          <div className="text-xs flex gap-3 justify-start items-center">
            <p>Arrow tool</p>
            {formatForDisplay("L")}
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
          <div className="text-xs flex gap-3 justify-start items-center">
            <p>Brush tool</p>
            {formatForDisplay("B")}
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
