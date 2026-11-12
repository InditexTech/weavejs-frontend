// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { WeaveStateElement } from "@inditextech/weave-types";
import {
  DEFAULT_STICKY_NOTE_COLOR,
  STICKY_NOTE_LABEL_DEFAULTS,
  STICKY_NOTE_PASTEL_COLORS,
} from "@inditextech/weave-sdk";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { cn } from "@/lib/utils";
import { InputNumber } from "../inputs/input-number";

export function StickyNoteProperties() {
  const instance = useWeave((state) => state.instance);
  const node = useWeave((state) => state.selection.node);
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

  if (!instance || !actualNode || !nodePropertiesAction) {
    return null;
  }

  if (
    actualAction === "selectionTool" &&
    !["sticky-note"].includes(actualNode.type)
  ) {
    return null;
  }

  if (
    actualAction &&
    !["selectionTool", "stickyNoteTool"].includes(actualAction)
  ) {
    return null;
  }

  const currentColor = actualNode.props.color ?? DEFAULT_STICKY_NOTE_COLOR;

  return (
    <div className="p-[24px] pt-[16px] pb-0 flex flex-col gap-[16px]">
      <div className="w-full flex flex-col gap-3">
        <span className="text-[13px] font-inter font-light uppercase">
          Note color
        </span>
        <div className="grid grid-cols-8 gap-2 w-full">
          {STICKY_NOTE_PASTEL_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Note color ${color}`}
              className={cn(
                "h-[24px] w-full cursor-pointer border border-[#c9c9c9]",
                {
                  ["ring-1 ring-black ring-offset-1"]:
                    currentColor.toLowerCase() === color.toLowerCase(),
                },
              )}
              style={{ backgroundColor: color }}
              onClick={() => {
                updateElement({
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    color,
                  },
                } as WeaveStateElement);
              }}
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full">
        <InputNumber
          label="Padding X (px)"
          min={0}
          max={100}
          value={
            actualNode.props.labelPaddingX ??
            STICKY_NOTE_LABEL_DEFAULTS.labelPaddingX
          }
          onChange={(value) => {
            updateElement({
              ...actualNode,
              props: {
                ...actualNode.props,
                labelPaddingX: value,
              },
            } as WeaveStateElement);
          }}
        />
        <InputNumber
          label="Padding Y (px)"
          min={0}
          max={100}
          value={
            actualNode.props.labelPaddingY ??
            STICKY_NOTE_LABEL_DEFAULTS.labelPaddingY
          }
          onChange={(value) => {
            updateElement({
              ...actualNode,
              props: {
                ...actualNode.props,
                labelPaddingY: value,
              },
            } as WeaveStateElement);
          }}
        />
      </div>
    </div>
  );
}
