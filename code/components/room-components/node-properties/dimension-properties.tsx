// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { WeaveStateElement } from "@inditextech/weave-types";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { InputColor } from "../inputs/input-color";
import { InputText } from "../inputs/input-text";
import {
  DEFAULT_DIMENSION_STROKE,
  DEFAULT_DIMENSION_TERMINATOR,
  DEFAULT_DIMENSION_UNIT,
  DIMENSION_TERMINATOR,
  DIMENSION_UNIT,
} from "@/components/nodes/dimension/constants";

function useDimensionPropertyContext() {
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

export function DimensionProperties() {
  const { instance, activeTool, target, commitUpdate } =
    useDimensionPropertyContext();

  if (!instance || !target) return null;

  if (
    activeTool &&
    ["selectionTool"].includes(activeTool) &&
    target.type !== "dimension"
  ) {
    return null;
  }

  if (
    activeTool &&
    !["selectionTool", "dimensionTool"].includes(activeTool)
  ) {
    return null;
  }

  const currentUnit =
    (target.props?.unit as string) ?? DEFAULT_DIMENSION_UNIT;
  const currentTerminator =
    (target.props?.terminator as string) ?? DEFAULT_DIMENSION_TERMINATOR;
  const currentStroke =
    (target.props?.stroke as string) ?? DEFAULT_DIMENSION_STROKE;
  const currentCustomLabel = (target.props?.customLabel as string) ?? "";

  return (
    <div className="p-[24px] pt-[16px] pb-0 flex flex-col gap-[16px]">
      {/* Unit Selector */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] font-inter font-light text-[#757575]">
          Measurement Unit
        </span>
        <div className="grid grid-cols-5 gap-1 w-full bg-muted/40 p-1 rounded-md border text-center text-xs">
          {Object.values(DIMENSION_UNIT).map((u) => {
            const isSelected = currentUnit === u;
            return (
              <button
                key={u}
                type="button"
                className={`py-1 px-1.5 rounded transition-all cursor-pointer font-medium uppercase ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => commitUpdate({ unit: u })}
              >
                {u}
              </button>
            );
          })}
        </div>
      </div>

      {/* Terminator Style Selector */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] font-inter font-light text-[#757575]">
          Terminator Style
        </span>
        <div className="grid grid-cols-3 gap-1 w-full bg-muted/40 p-1 rounded-md border text-center text-xs">
          {Object.entries(DIMENSION_TERMINATOR).map(([key, val]) => {
            const isSelected = currentTerminator === val;
            return (
              <button
                key={val}
                type="button"
                className={`py-1 px-2 rounded transition-all cursor-pointer font-medium uppercase text-[11px] ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => commitUpdate({ terminator: val })}
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Label and Stroke Color */}
      <div className="grid grid-cols-1 gap-3 w-full">
        <InputText
          label="Label Prefix (e.g. WIDTH:)"
          value={currentCustomLabel}
          onChange={(value) => commitUpdate({ customLabel: value })}
        />

        <InputColor
          label="Dimension Line Color"
          value={currentStroke}
          onChange={(value) => commitUpdate({ stroke: value })}
        />
      </div>
    </div>
  );
}
