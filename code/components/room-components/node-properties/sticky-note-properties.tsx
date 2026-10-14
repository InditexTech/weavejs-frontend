// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { WeaveStateElement } from "@inditextech/weave-types";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { InputColor } from "../inputs/input-color";
import { InputText } from "../inputs/input-text";
import { STICKY_NOTE_PALETTE } from "@/components/nodes/sticky-note/constants";

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

  if (!instance || !actualNode) return null;

  if (
    actualAction &&
    ["selectionTool"].includes(actualAction) &&
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

  const currentColor = actualNode.props?.color ?? STICKY_NOTE_PALETTE.YELLOW;
  const currentText = actualNode.props?.text ?? "";
  const currentAuthor = actualNode.props?.author ?? "";

  return (
    <div className="p-[24px] pt-[16px] pb-0 flex flex-col gap-[16px]">
      <div className="flex flex-col gap-2">
        <span className="text-[12px] font-inter font-light text-[#757575]">
          Pastel Palette
        </span>
        <div className="flex flex-wrap gap-1.5 items-center">
          {Object.entries(STICKY_NOTE_PALETTE).map(([key, hex]) => {
            const isSelected = currentColor.toLowerCase() === hex.toLowerCase();
            return (
              <button
                key={key}
                type="button"
                className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-primary ring-offset-1 scale-110 border-foreground/40"
                    : "border-black/15 hover:scale-105"
                }`}
                style={{ backgroundColor: hex }}
                title={key}
                onClick={() => {
                  const updatedNode: WeaveStateElement = {
                    ...actualNode,
                    props: {
                      ...actualNode.props,
                      color: hex,
                    },
                  };
                  updateElement(updatedNode);
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 w-full">
        <InputColor
          label="Custom Color (#HEX)"
          value={currentColor}
          onChange={(value) => {
            const updatedNode: WeaveStateElement = {
              ...actualNode,
              props: {
                ...actualNode.props,
                color: value,
              },
            };
            updateElement(updatedNode);
          }}
        />

        <InputText
          label="Note Content"
          value={currentText}
          onChange={(value) => {
            const updatedNode: WeaveStateElement = {
              ...actualNode,
              props: {
                ...actualNode.props,
                text: value,
              },
            };
            updateElement(updatedNode);
          }}
        />

        <InputText
          label="Author Tag (optional)"
          value={currentAuthor}
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
