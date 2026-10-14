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
  MATERIAL_CATEGORIES,
  MATERIAL_SWATCH_NODE_TYPE,
  RETAIL_MATERIAL_PRESETS,
} from "@/components/nodes/material-swatch/constants";

function useMaterialSwatchContext() {
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

export function MaterialSwatchProperties() {
  const { instance, activeTool, target, commitUpdate } =
    useMaterialSwatchContext();

  if (!instance || !target) return null;

  if (
    activeTool &&
    ["selectionTool"].includes(activeTool) &&
    target.type !== MATERIAL_SWATCH_NODE_TYPE
  ) {
    return null;
  }

  if (
    activeTool &&
    !["selectionTool", "materialSwatchTool"].includes(activeTool)
  ) {
    return null;
  }

  const defaultPreset = RETAIL_MATERIAL_PRESETS[0];
  const currentColor =
    (target.props?.color as string) ?? defaultPreset.color;
  const currentName =
    (target.props?.materialName as string) ?? defaultPreset.name;
  const currentFinish =
    (target.props?.finishCode as string) ?? defaultPreset.finish;
  const currentCategory =
    (target.props?.category as string) ?? defaultPreset.category;
  const isDark = Boolean(target.props?.darkTheme);

  return (
    <div className="p-[24px] pt-[16px] pb-0 flex flex-col gap-[16px]">
      {/* Preset Swatches Palette */}
      <div className="flex flex-col gap-2">
        <span className="text-[12px] font-inter font-light text-[#757575]">
          Retail Architectural Presets
        </span>
        <div className="grid grid-cols-5 gap-2 items-center">
          {RETAIL_MATERIAL_PRESETS.map((preset) => {
            const isSelected =
              currentColor.toLowerCase() === preset.color.toLowerCase() &&
              currentName === preset.name;
            return (
              <button
                key={preset.id}
                type="button"
                className={`flex flex-col items-center justify-center p-1 rounded-md border transition-all cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-primary ring-offset-1 scale-105 border-foreground/40"
                    : "border-black/10 hover:border-black/25"
                }`}
                title={`${preset.name} (${preset.category})`}
                onClick={() => {
                  commitUpdate({
                    materialName: preset.name,
                    finishCode: preset.finish,
                    category: preset.category,
                    color: preset.color,
                  });
                }}
              >
                <div
                  className="w-6 h-6 rounded-sm border border-black/10 shadow-xs"
                  style={{ backgroundColor: preset.color }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Selector Pills */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] font-inter font-light text-[#757575]">
          Category
        </span>
        <div className="flex flex-wrap gap-1">
          {Object.values(MATERIAL_CATEGORIES).map((cat) => {
            const isSelected = currentCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`py-0.5 px-2 rounded text-[10px] font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => commitUpdate({ category: cat })}
              >
                {cat.split(" / ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Material Details Inputs */}
      <div className="grid grid-cols-1 gap-3 w-full">
        <InputText
          label="Material Name"
          value={currentName}
          onChange={(value) => commitUpdate({ materialName: value })}
        />

        <InputText
          label="Finish / Reference Code"
          value={currentFinish}
          onChange={(value) => commitUpdate({ finishCode: value })}
        />

        <InputColor
          label="Custom Color (#HEX)"
          value={currentColor}
          onChange={(value) => commitUpdate({ color: value })}
        />

        <div className="flex justify-between items-center pt-1 border-t">
          <span className="text-xs text-muted-foreground">Dark Spec Card</span>
          <button
            type="button"
            className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
              isDark
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground"
            }`}
            onClick={() => commitUpdate({ darkTheme: !isDark })}
          >
            {isDark ? "Dark Theme" : "Light Theme"}
          </button>
        </div>
      </div>
    </div>
  );
}
