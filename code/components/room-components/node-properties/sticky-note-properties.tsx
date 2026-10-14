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

function useStickyNoteContext() {
  const instance = useWeave((s) => s.instance);
  const selectedNode = useWeave((s) => s.selection.node);
  const activeTool = useWeave((s) => s.actions.actual);
  const propertyAction = useCollaborationRoom((s) => s.nodeProperties.action);
  const creationDraftProps = useCollaborationRoom(
    (s) => s.nodeProperties.createProps,
  );

  const target = React.useMemo<WeaveStateElement | undefined>(() => {
    if (activeTool && propertyAction === "create") {
      return {
        key: "creating",
        type: "undefined",
        props: { ...creationDraftProps },
      };
    }
    return propertyAction === "update" ? selectedNode : undefined;
  }, [activeTool, propertyAction, creationDraftProps, selectedNode]);

  const commitUpdate = React.useCallback(
    (propsPatch: Record<string, unknown>) => {
      if (!instance || !target) return;
      const merged: WeaveStateElement = {
        ...target,
        props: { ...target.props, ...propsPatch },
      };
      if (activeTool && propertyAction === "create") {
        instance.updatePropsAction(activeTool, merged.props);
      } else if (propertyAction === "update") {
        instance.updateNode(merged);
      }
    },
    [instance, target, activeTool, propertyAction],
  );

  return { instance, activeTool, target, commitUpdate };
}

export function StickyNoteProperties() {
  const { instance, activeTool, target, commitUpdate } = useStickyNoteContext();

  if (!instance || !target) return null;

  if (
    activeTool &&
    ["selectionTool"].includes(activeTool) &&
    target.type !== "sticky-note"
  ) {
    return null;
  }

  if (
    activeTool &&
    !["selectionTool", "stickyNoteTool"].includes(activeTool)
  ) {
    return null;
  }

  const currentColor =
    (target.props?.color as string) ?? STICKY_NOTE_PALETTE.YELLOW;
  const currentText = (target.props?.text as string) ?? "";
  const currentAuthor = (target.props?.author as string) ?? "";

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
                onClick={() => commitUpdate({ color: hex })}
              />
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 w-full">
        <InputColor
          label="Custom Color (#HEX)"
          value={currentColor}
          onChange={(value) => commitUpdate({ color: value })}
        />

        <InputText
          label="Note Content"
          value={currentText}
          onChange={(value) => commitUpdate({ text: value })}
        />

        <InputText
          label="Author Tag (optional)"
          value={currentAuthor}
          onChange={(value) => commitUpdate({ author: value })}
        />
      </div>
    </div>
  );
}
