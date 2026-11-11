// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { WeaveStateElement } from "@inditextech/weave-types";
import { STICKY_NOTE_PASTEL_COLORS } from "@inditextech/weave-sdk";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { cn } from "@/lib/utils";
import { InputText } from "../inputs/input-text";

export function StickyNoteProperties() {
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
    actualNode.type !== "sticky-note"
  ) {
    return null;
  }

  if (
    actualAction &&
    !["selectionTool", "stickyNoteTool"].includes(actualAction)
  ) {
    return null;
  }

  return (
    <div className="p-[24px] pt-[16px] pb-0 flex flex-col gap-[16px]">
      <div className="grid grid-cols-1 gap-3 w-full">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-inter font-light uppercase">
            Note color
          </span>
          <div className="grid grid-cols-8 gap-2">
            {STICKY_NOTE_PASTEL_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Note color ${color}`}
                className={cn(
                  "h-[24px] w-full cursor-pointer border border-[#c9c9c9]",
                  {
                    ["ring-1 ring-black ring-offset-1"]:
                      actualNode.props.color?.toLowerCase() ===
                      color.toLowerCase(),
                  },
                )}
                style={{ backgroundColor: color }}
                onClick={() => {
                  const updatedNode: WeaveStateElement = {
                    ...actualNode,
                    props: {
                      ...actualNode.props,
                      color,
                    },
                  };
                  updateElement(updatedNode);
                }}
              />
            ))}
          </div>
        </div>
        <InputText
          label="Author"
          value={actualNode.props.author ?? ""}
          onChange={(value) => {
            const updatedNode: WeaveStateElement = {
              ...actualNode,
              props: {
                ...actualNode.props,
                author: value,
              },
            };
            updateElement(updatedNode);
          }}
        />
      </div>
    </div>
  );
}
