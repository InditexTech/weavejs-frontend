"use client";

import React from "react";
import { WeaveStateElement } from "@inditextech/weave-types";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { InputColor } from "../inputs/input-color";

export function ColorTokenProperties() {
  const instance = useWeave((state) => state.instance);
  const node = useWeave((state) => state.selection.node);
  const actualAction = useWeave((state) => state.actions.actual);

  const nodePropertiesAction = useCollaborationRoom(
    (state) => state.nodeProperties.action
  );

  const nodeCreateProps = useCollaborationRoom(
    (state) => state.nodeProperties.createProps
  );

  const [actualNode, setActualNode] = React.useState<
    WeaveStateElement | undefined
  >(node);

  React.useEffect(() => {
    if (!instance) return;
    if (actualAction && nodePropertiesAction === "create") {
      setActualNode({
        key: "creating",
        type: "undefined",
        props: {
          ...nodeCreateProps,
        },
      });
    }
    if (node && nodePropertiesAction === "update") {
      setActualNode(node);
    }
    if (!actualAction && !node) {
      setActualNode(undefined);
    }
  }, [instance, actualAction, node, nodePropertiesAction, nodeCreateProps]);

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
    [instance, actualAction, nodePropertiesAction]
  );

  if (!instance || !actualNode) return null;

  if (!actualAction && !actualNode) return null;

  if (
    actualAction &&
    ["selectionTool"].includes(actualAction) &&
    !["color-token"].includes(actualNode.type)
  ) {
    return null;
  }

  if (
    actualAction &&
    !["selectionTool", "colorTokenTool"].includes(actualAction)
  )
    return null;

  return (
    <div className="border-b border-[#c9c9c9] p-[24px] flex flex-col gap-[16px]">
      <div className="w-full flex justify-between items-center gap-3">
        <div className="cursor-pointer hover:no-underline items-center py-0">
          <span className="text-[13px] font-inter font-light uppercase">
            Color Token
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 w-full">
        <InputColor
          label="Color (#RGBA)"
          value={actualNode.props.colorToken}
          onChange={(value) => {
            const updatedNode: WeaveStateElement = {
              ...actualNode,
              props: {
                ...actualNode.props,
                colorToken: value,
              },
            };
            updateElement(updatedNode);
          }}
        />
      </div>
    </div>
  );
}
