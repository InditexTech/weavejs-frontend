// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { WeaveStateElement } from "@inditextech/weave-types";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { ToggleIconButton } from "../toggle-icon-button";
import { ArrowUpRight, Circle, Minus, Square } from "lucide-react";
import InputSelect from "../inputs/input-select";
import { WEAVE_STROKE_SINGLE_NODE_TIP_TYPE } from "@inditextech/weave-sdk";
import { InputColor } from "../inputs/input-color";

export const ARROW_SIZE_OPTIONS = [
  { label: "Small", value: "1" },
  { label: "Medium", value: "3" },
  { label: "Large", value: "5" },
];

export const ARROW_DASH_OPTIONS = [
  [
    { label: "Dashed (long)", value: [8, 4] },
    { label: "Dashed (short)", value: [4, 2] },
    { label: "Normal", value: [] },
  ],
  [
    { label: "Dashed (long)", value: [16, 8] },
    { label: "Dashed (short)", value: [8, 4] },
    { label: "Normal", value: [] },
  ],
  [
    { label: "Dashed (long)", value: [24, 12] },
    { label: "Dashed (short)", value: [12, 6] },
    { label: "Normal", value: [] },
  ],
];

export const ARROW_TIP_SIZE_OPTIONS = {
  [WEAVE_STROKE_SINGLE_NODE_TIP_TYPE.NONE]: [],
  [WEAVE_STROKE_SINGLE_NODE_TIP_TYPE.ARROW]: [
    {
      label: "Small",
      value: "5",
    },
    {
      label: "Medium",
      value: "10",
    },
    {
      label: "Large",
      value: "20",
    },
  ],
  [WEAVE_STROKE_SINGLE_NODE_TIP_TYPE.CIRCLE]: [
    {
      label: "Small",
      value: "2.5",
    },
    {
      label: "Medium",
      value: "5",
    },
    {
      label: "Large",
      value: "10",
    },
  ],
  [WEAVE_STROKE_SINGLE_NODE_TIP_TYPE.SQUARE]: [
    {
      label: "Small",
      value: "5",
    },
    {
      label: "Medium",
      value: "10",
    },
    {
      label: "Large",
      value: "20",
    },
  ],
};

export function ArrowProperties() {
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

  const tipStartStyle = React.useMemo(() => {
    if (!actualNode) return "none";
    return actualNode.props.tipStartStyle || "none";
  }, [actualNode]);

  const tipEndStyle = React.useMemo(() => {
    if (!actualNode) return "none";
    return actualNode.props.tipEndStyle || "none";
  }, [actualNode]);

  const arrowSizeIndex = React.useMemo(() => {
    if (!actualNode) return -1;
    return ARROW_SIZE_OPTIONS.findIndex(
      (option) => option.value === `${actualNode.props.strokeWidth ?? 1}`,
    );
  }, [actualNode]);

  if (!instance || !actualNode || !nodePropertiesAction) {
    return null;
  }

  if (!actualAction && !actualNode) return null;

  if (
    actualAction &&
    ["selectionTool"].includes(actualAction) &&
    !["stroke-single", "connector"].includes(actualNode.type)
  ) {
    return null;
  }

  if (
    actualAction &&
    !["selectionTool", "strokeTool", "arrowTool", "connectorTool"].includes(
      actualAction,
    )
  ) {
    return null;
  }

  return (
    <>
      <div className="border-b border-b-[0.5px] border-[#c9c9c9] p-[24px] flex flex-col gap-[16px]">
        <div className="w-full flex justify-between items-center gap-3">
          <div className="cursor-pointer hover:no-underline items-center py-0">
            <span className="text-[13px] font-inter font-light uppercase">
              Properties
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 w-full">
          <div className="grid grid-cols-2 gap-3 w-full">
            <InputColor
              label="Color (#RGBA)"
              value={actualNode.props.stroke}
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
            <InputSelect
              hideSearch
              label="Width"
              options={[
                { label: "Small", value: "1" },
                { label: "Medium", value: "3" },
                { label: "Large", value: "5" },
              ]}
              value={`${actualNode.props.strokeWidth ?? 1}`}
              onChange={(value) => {
                const index = ARROW_SIZE_OPTIONS.findIndex(
                  (option) => option.value === value,
                );

                const tipStartSize =
                  ARROW_TIP_SIZE_OPTIONS[tipStartStyle][index];
                const tipEndSize = ARROW_TIP_SIZE_OPTIONS[tipEndStyle][index];

                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    strokeWidth: parseInt(value),
                    tipStartBase: undefined,
                    tipStartHeight: undefined,
                    tipStartRadius: undefined,
                    tipStartWidth: undefined,
                    tipEndBase: undefined,
                    tipEndHeight: undefined,
                    tipEndRadius: undefined,
                    tipEndWidth: undefined,
                    ...(tipStartStyle === "arrow" && {
                      tipStartBase: parseInt(tipStartSize.value),
                      tipStartHeight:
                        (Math.sqrt(3) / 2) * parseInt(tipStartSize.value),
                    }),
                    ...(tipStartStyle === "circle" && {
                      tipStartRadius: parseInt(tipStartSize.value),
                    }),
                    ...(tipStartStyle === "square" && {
                      tipStartWidth: parseInt(tipStartSize.value),
                    }),
                    ...(tipEndStyle === "arrow" && {
                      tipEndBase: parseInt(tipEndSize.value),
                      tipEndHeight:
                        (Math.sqrt(3) / 2) * parseInt(tipEndSize.value),
                    }),
                    ...(tipEndStyle === "circle" && {
                      tipEndRadius: parseInt(tipEndSize.value),
                    }),
                    ...(tipEndStyle === "square" && {
                      tipEndWidth: parseInt(tipEndSize.value),
                    }),
                  },
                };
                updateElement(updatedNode);
              }}
            />
            <div className="col-span-2">
              <InputSelect
                hideSearch
                label="Style"
                options={
                  ARROW_DASH_OPTIONS[arrowSizeIndex]?.map((opt) => ({
                    label: opt.label,
                    value: opt.value.map((v) => `${v}`).join(","),
                  })) || []
                }
                value={
                  actualNode.props.dash && actualNode.props.dash.length > 0
                    ? actualNode.props.dash.map((e: number) => `${e}`).join(",")
                    : ""
                }
                onChange={(value) => {
                  const updatedNode: WeaveStateElement = {
                    ...actualNode,
                    props: {
                      ...actualNode.props,
                      dash: value.split(",").map((v) => parseInt(v)),
                    },
                  };
                  updateElement(updatedNode);
                }}
              />
            </div>
            <div className="w-full flex justify-between items-center gap-4 col-span-2 mt-3">
              <div className="text-[12px] text-[#757575] font-inter font-light text-nowrap">
                Start point style
              </div>
              <div className="w-full flex justify-end items-center gap-1">
                <ToggleIconButton
                  kind="switch"
                  icon={<ArrowUpRight size={20} strokeWidth={1} />}
                  pressed={tipStartStyle === "arrow"}
                  onClick={() => {
                    const index = ARROW_SIZE_OPTIONS.findIndex(
                      (option) =>
                        option.value === `${actualNode.props.strokeWidth ?? 1}`,
                    );

                    const newTipStartStyle =
                      tipStartStyle === "arrow" ? "none" : "arrow";

                    const tipStartSize =
                      ARROW_TIP_SIZE_OPTIONS[newTipStartStyle][index];

                    const updatedNode: WeaveStateElement = {
                      ...actualNode,
                      props: {
                        ...actualNode.props,
                        tipStartRadius: undefined,
                        tipStartHeight: undefined,
                        tipStartBase: undefined,
                        tipStartWidth: undefined,
                        ...(newTipStartStyle === "arrow" && {
                          tipStartBase: parseInt(tipStartSize.value),
                          tipStartHeight:
                            (Math.sqrt(3) / 2) * parseInt(tipStartSize.value),
                        }),
                        tipStartStyle: newTipStartStyle,
                      },
                    };
                    updateElement(updatedNode);
                  }}
                />
                <ToggleIconButton
                  kind="switch"
                  icon={<Circle size={20} strokeWidth={1} />}
                  pressed={tipStartStyle === "circle"}
                  onClick={() => {
                    const index = ARROW_SIZE_OPTIONS.findIndex(
                      (option) =>
                        option.value === `${actualNode.props.strokeWidth ?? 1}`,
                    );

                    const newTipStartStyle =
                      tipStartStyle === "circle" ? "none" : "circle";

                    const tipStartSize =
                      ARROW_TIP_SIZE_OPTIONS[newTipStartStyle][index];

                    const updatedNode: WeaveStateElement = {
                      ...actualNode,
                      props: {
                        ...actualNode.props,
                        tipStartRadius: undefined,
                        tipStartHeight: undefined,
                        tipStartBase: undefined,
                        tipStartWidth: undefined,
                        ...(newTipStartStyle === "circle" && {
                          tipStartRadius: parseInt(tipStartSize.value),
                        }),
                        tipStartStyle: newTipStartStyle,
                      },
                    };
                    updateElement(updatedNode);
                  }}
                />
                <ToggleIconButton
                  kind="switch"
                  icon={<Square size={20} strokeWidth={1} />}
                  pressed={tipStartStyle === "square"}
                  onClick={() => {
                    const index = ARROW_SIZE_OPTIONS.findIndex(
                      (option) =>
                        option.value === `${actualNode.props.strokeWidth ?? 1}`,
                    );

                    const newTipStartStyle =
                      tipStartStyle === "square" ? "none" : "square";

                    const tipStartSize =
                      ARROW_TIP_SIZE_OPTIONS[newTipStartStyle][index];

                    const updatedNode: WeaveStateElement = {
                      ...actualNode,
                      props: {
                        ...actualNode.props,
                        tipStartRadius: undefined,
                        tipStartHeight: undefined,
                        tipStartBase: undefined,
                        tipStartWidth: undefined,
                        ...(newTipStartStyle === "square" && {
                          tipStartWidth: parseInt(tipStartSize.value),
                        }),
                        tipStartStyle: newTipStartStyle,
                      },
                    };
                    updateElement(updatedNode);
                  }}
                />
                <ToggleIconButton
                  kind="switch"
                  icon={<Minus size={20} strokeWidth={1} />}
                  pressed={tipStartStyle === "none"}
                  onClick={() => {
                    const updatedNode: WeaveStateElement = {
                      ...actualNode,
                      props: {
                        ...actualNode.props,
                        tipStartRadius: undefined,
                        tipStartHeight: undefined,
                        tipStartBase: undefined,
                        tipStartWidth: undefined,
                        tipStartStyle: "none",
                      },
                    };
                    updateElement(updatedNode);
                  }}
                />
              </div>
            </div>
            <div className="w-full flex justify-between items-center gap-4 col-span-2">
              <div className="text-[12px] text-[#757575] font-inter font-light text-nowrap">
                End point style
              </div>
              <div className="w-full flex justify-end items-center gap-1">
                <ToggleIconButton
                  kind="switch"
                  icon={<ArrowUpRight size={20} strokeWidth={1} />}
                  pressed={tipEndStyle === "arrow"}
                  onClick={() => {
                    const index = ARROW_SIZE_OPTIONS.findIndex(
                      (option) =>
                        option.value === `${actualNode.props.strokeWidth ?? 1}`,
                    );

                    const newTipEndStyle =
                      tipEndStyle === "arrow" ? "none" : "arrow";

                    const tipEndSize =
                      ARROW_TIP_SIZE_OPTIONS[newTipEndStyle][index];

                    const updatedNode: WeaveStateElement = {
                      ...actualNode,
                      props: {
                        ...actualNode.props,
                        tipEndRadius: undefined,
                        tipEndHeight: undefined,
                        tipEndBase: undefined,
                        tipEndWidth: undefined,
                        ...(newTipEndStyle === "arrow" && {
                          tipEndBase: parseInt(tipEndSize.value),
                          tipEndHeight:
                            (Math.sqrt(3) / 2) * parseInt(tipEndSize.value),
                        }),
                        tipEndStyle: newTipEndStyle,
                      },
                    };
                    updateElement(updatedNode);
                  }}
                />
                <ToggleIconButton
                  kind="switch"
                  icon={<Circle size={20} strokeWidth={1} />}
                  pressed={tipEndStyle === "circle"}
                  onClick={() => {
                    const index = ARROW_SIZE_OPTIONS.findIndex(
                      (option) =>
                        option.value === `${actualNode.props.strokeWidth ?? 1}`,
                    );

                    const newTipEndStyle =
                      tipEndStyle === "circle" ? "none" : "circle";

                    const tipEndSize =
                      ARROW_TIP_SIZE_OPTIONS[newTipEndStyle][index];

                    const updatedNode: WeaveStateElement = {
                      ...actualNode,
                      props: {
                        ...actualNode.props,
                        tipEndRadius: undefined,
                        tipEndHeight: undefined,
                        tipEndBase: undefined,
                        tipEndWidth: undefined,
                        ...(newTipEndStyle === "circle" && {
                          tipEndRadius: parseInt(tipEndSize.value),
                        }),
                        tipEndStyle: newTipEndStyle,
                      },
                    };
                    updateElement(updatedNode);
                  }}
                />
                <ToggleIconButton
                  kind="switch"
                  icon={<Square size={20} strokeWidth={1} />}
                  pressed={tipEndStyle === "square"}
                  onClick={() => {
                    const index = ARROW_SIZE_OPTIONS.findIndex(
                      (option) =>
                        option.value === `${actualNode.props.strokeWidth ?? 1}`,
                    );

                    const newTipEndStyle =
                      tipEndStyle === "square" ? "none" : "square";

                    const tipEndSize =
                      ARROW_TIP_SIZE_OPTIONS[newTipEndStyle][index];

                    const updatedNode: WeaveStateElement = {
                      ...actualNode,
                      props: {
                        ...actualNode.props,
                        tipEndRadius: undefined,
                        tipEndHeight: undefined,
                        tipEndBase: undefined,
                        tipEndWidth: undefined,
                        ...(newTipEndStyle === "square" && {
                          tipEndWidth: parseInt(tipEndSize.value),
                        }),
                        tipEndStyle: newTipEndStyle,
                      },
                    };
                    updateElement(updatedNode);
                  }}
                />
                <ToggleIconButton
                  kind="switch"
                  icon={<Minus size={20} strokeWidth={1} />}
                  pressed={tipEndStyle === "none"}
                  onClick={() => {
                    const updatedNode: WeaveStateElement = {
                      ...actualNode,
                      props: {
                        ...actualNode.props,
                        tipEndRadius: undefined,
                        tipEndHeight: undefined,
                        tipEndBase: undefined,
                        tipEndWidth: undefined,
                        tipEndStyle: "none",
                      },
                    };
                    updateElement(updatedNode);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
