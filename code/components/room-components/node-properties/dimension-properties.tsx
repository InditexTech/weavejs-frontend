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

export function DimensionProperties() {
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
    !["dimension"].includes(actualNode.type)
  ) {
    return null;
  }

  if (
    actualAction &&
    !["selectionTool", "dimensionTool"].includes(actualAction)
  ) {
    return null;
  }

  const currentUnit = actualNode.props?.unit ?? DEFAULT_DIMENSION_UNIT;
  const currentTerminator = actualNode.props?.terminator ?? DEFAULT_DIMENSION_TERMINATOR;
  const currentStroke = actualNode.props?.stroke ?? DEFAULT_DIMENSION_STROKE;
  const currentCustomLabel = actualNode.props?.customLabel ?? "";

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
                onClick={() => {
                  const updatedNode: WeaveStateElement = {
                    ...actualNode,
                    props: {
                      ...actualNode.props,
                      unit: u,
                    },
                  };
                  updateElement(updatedNode);
                }}
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
                onClick={() => {
                  const updatedNode: WeaveStateElement = {
                    ...actualNode,
                    props: {
                      ...actualNode.props,
                      terminator: val,
                    },
                  };
                  updateElement(updatedNode);
                }}
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
          onChange={(value) => {
            const updatedNode: WeaveStateElement = {
              ...actualNode,
              props: {
                ...actualNode.props,
                customLabel: value,
              },
            };
            updateElement(updatedNode);
          }}
        />

        <InputColor
          label="Dimension Line Color"
          value={currentStroke}
          onChange={(value) => {
            const updatedNode: WeaveStateElement = {
              ...actualNode,
              props: {
                ...actualNode.props,
                stroke: value,
              },
            };
            updateElement(updatedNode);
          }}
        />
      </div>
    </div>
  );
}
