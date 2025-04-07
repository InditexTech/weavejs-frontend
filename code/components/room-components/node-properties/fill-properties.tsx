"use client";

import React from "react";
import { WeaveStateElement } from "@inditextech/weavejs-types";
import { Eye, EyeOff } from "lucide-react";
import { InputColor } from "./../inputs/input-color";
import { ToggleIconButton } from "./../toggle-icon-button";
import { useWeave } from "@inditextech/weavejs-react";
import { useCollaborationRoom } from "@/store/store";

export function FillProperties() {
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

  if (!instance || !actualAction || !actualNode) {
    return null;
  }

  if (!actualAction && !actualNode) {
    return null;
  }

  if (actualNode.type !== "rectangle") {
    return null;
  }
  return (
    <div className="border-b border-zinc-200">
      <div className="w-full flex justify-between items-center gap-3 p-4 py-3">
        <div className="cursor-pointer hover:no-underline items-center py-0">
          <span className="text-xs font-noto-sans-mono font-light">Fill</span>
        </div>
        <ToggleIconButton
          kind="toggle"
          icon={<Eye size={12} />}
          pressedIcon={<EyeOff size={12} />}
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
      </div>
      <div className="px-4 pb-4">
        <div className="grid grid-cols-1 gap-3 w-full">
          <InputColor
            label="Color (#RGBA)"
            value={`${(actualNode.props.fill ?? "#000000FF").replace("#", "")}`}
            onChange={(value) => {
              const updatedNode: WeaveStateElement = {
                ...actualNode,
                props: {
                  ...actualNode.props,
                  fill: `#${value}`,
                },
              };
              updateElement(updatedNode);
            }}
          />
        </div>
      </div>
    </div>
  );
}
