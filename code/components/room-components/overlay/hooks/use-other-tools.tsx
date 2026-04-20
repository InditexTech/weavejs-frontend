// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import {
  ChevronsLeftRightEllipsis,
  Frame,
  LayoutPanelTop,
  MessageSquare,
  RulerDimensionLine,
  Tag,
} from "lucide-react";
import { SidebarActive, useCollaborationRoom } from "@/store/store";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { ShortcutElement } from "../../help/shortcut-element";
import { SYSTEM_OS } from "@/lib/utils";

export const useOtherTools = () => {
  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);

  const nodeCreateProps = useCollaborationRoom(
    (state) => state.nodeProperties.createProps,
  );
  const measurementUnits = useCollaborationRoom(
    (state) => state.measurement.units,
  );
  const measurementReferenceMeasureUnits = useCollaborationRoom(
    (state) => state.measurement.referenceMeasureUnits,
  );
  const measurementReferenceMeasurePixels = useCollaborationRoom(
    (state) => state.measurement.referenceMeasurePixels,
  );
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive,
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
    [instance, actualAction],
  );

  const sidebarToggle = React.useCallback(
    (element: SidebarActive) => {
      setSidebarActive(element);
    },
    [setSidebarActive],
  );

  const OTHER_TOOLS: Record<
    string,
    {
      icon: React.JSX.Element;
      label: React.JSX.Element;
      onClick: () => void;
      active: () => boolean;
    }
  > = React.useMemo(
    () => ({
      frameTool: {
        icon: <Frame className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Frame tool</p>
          </div>
        ),
        onClick: () => {
          triggerTool("frameTool", nodeCreateProps);
        },
        active: () => actualAction === "frameTool",
      },
      commentTool: {
        icon: <MessageSquare className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Comment tool</p>
          </div>
        ),
        onClick: () => {
          triggerTool("commentTool", nodeCreateProps);
          sidebarToggle(SIDEBAR_ELEMENTS.comments);
        },
        active: () => actualAction === "commentTool",
      },
      connectorTool: {
        icon: (
          <ChevronsLeftRightEllipsis
            className="px-2"
            size={40}
            strokeWidth={1}
          />
        ),
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Connector tool</p>
          </div>
        ),
        onClick: () => {
          triggerTool("connectorTool", nodeCreateProps);
        },
        active: () => actualAction === "connectorTool",
      },
      imageTemplateTool: {
        icon: <LayoutPanelTop className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Image Template tool</p>
          </div>
        ),
        onClick: () => {
          triggerTool("imageTemplateTool");
        },
        active: () => actualAction === "imageTemplateTool",
      },
      measureTool: {
        icon: <RulerDimensionLine className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Measure tool</p>
          </div>
        ),
        onClick: () => {
          if (!instance) {
            return;
          }
          triggerTool("measureTool", nodeCreateProps);
          const scale = measurementReferenceMeasurePixels
            ? measurementReferenceMeasurePixels /
              measurementReferenceMeasureUnits
            : 1;
          instance.updatePropsAction("measureTool", {
            color: "#FF3366",
            unit: measurementUnits,
            unitPerPixel: scale,
          });
        },
        active: () => actualAction === "measureTool",
      },
      colorTokenTool: {
        icon: <Tag className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Color Token Reference tool</p>
            <ShortcutElement
              shortcuts={{
                [SYSTEM_OS.MAC]: "K",
                [SYSTEM_OS.OTHER]: "K",
              }}
            />
          </div>
        ),
        onClick: () => triggerTool("colorTokenTool"),
        active: () => actualAction === "colorTokenTool",
      },
    }),
    [
      instance,
      actualAction,
      measurementReferenceMeasurePixels,
      measurementReferenceMeasureUnits,
      measurementUnits,
      nodeCreateProps,
      triggerTool,
      sidebarToggle,
    ],
  );

  return OTHER_TOOLS;
};
