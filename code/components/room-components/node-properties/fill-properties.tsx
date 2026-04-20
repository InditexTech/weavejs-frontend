// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { WeaveStateElement } from "@inditextech/weave-types";
import { InputColor } from "./../inputs/input-color";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";

export function FillProperties() {
  const instance = useWeave((state) => state.instance);
  const node = useWeave((state) => state.selection.node);
  const nodes = useWeave((state) => state.selection.nodes);
  const actualAction = useWeave((state) => state.actions.actual);

  const nodePropertiesAction = useCollaborationRoom(
    (state) => state.nodeProperties.action,
  );

  const nodeCreateProps = useCollaborationRoom(
    (state) => state.nodeProperties.createProps,
  );

  const actualNode = React.useMemo(() => {
    if (actualAction && nodePropertiesAction === "create") {
      return {
        key: "creating",
        type: "undefined",
        props: {
          ...nodeCreateProps,
        },
      };
    }
    if (node && nodePropertiesAction === "update") {
      return node;
    }
    return undefined;
  }, [actualAction, node, nodePropertiesAction, nodeCreateProps]);

  const updateElement = React.useCallback(
    (updatedNode: WeaveStateElement) => {
      if (!instance) return;
      if (actualAction && nodePropertiesAction === "create") {
        instance.updatePropsAction(actualAction, updatedNode.props);
      }
      if (nodePropertiesAction === "update") {
        instance.updateNode(updatedNode);
      }
    },
    [instance, actualAction, nodePropertiesAction],
  );

  if (nodes && nodes.length > 1) return null;

  if (!instance || !actualNode || !nodePropertiesAction) {
    return null;
  }

  if (!actualAction && !actualNode) return null;

  if (
    actualAction &&
    ["selectionTool"].includes(actualAction) &&
    [
      "stroke",
      "image-template",
      "color-token",
      "line",
      "arrow",
      "stroke-single",
      "connector",
      "group",
      "mask",
      "fuzzy-mask",
      "text",
      "frame",
    ].includes(actualNode.type)
  ) {
    return null;
  }

  if (
    actualAction &&
    ![
      "brushTool",
      "selectionTool",
      "strokeTool",
      "arrowTool",
      "rectangleTool",
      "colorTokenTool",
      "ellipseTool",
      "starTool",
    ].includes(actualAction)
  ) {
    return null;
  }

  return (
    <div className="p-[24px] pt-[16px] pb-0 flex flex-col gap-[16px]">
      {/* <div className="w-full flex justify-between items-center gap-3">
        <div className="cursor-pointer hover:no-underline items-center py-0">
          <span className="text-[13px] font-inter font-light uppercase">
            Fill
          </span>
        </div>
        <ToggleIconButton
          kind="toggle"
          icon={<Eye size={16} strokeWidth={1} />}
          pressedIcon={<EyeOff size={16} strokeWidth={1} />}
          pressed={actualNode.props.fillEnabled ?? true}
          onClick={(e) => {
            e.stopPropagation();
            const updatedNode: WeaveStateElement = {
              ...actualNode,
              props: {
                ...actualNode.props,
                fillEnabled: !(actualNode.props.fillEnabled ?? true),
              },
            };
            updateElement(updatedNode);
          }}
        />
      </div> */}
      <div className="grid grid-cols-1 gap-3 w-full">
        <InputColor
          label="Fill color (#RGBA)"
          value={actualNode.props.fill}
          onChange={(value) => {
            const updatedNode: WeaveStateElement = {
              ...actualNode,
              props: {
                ...actualNode.props,
                fill: value,
              },
            };
            updateElement(updatedNode);
          }}
        />
      </div>
    </div>
  );
}
