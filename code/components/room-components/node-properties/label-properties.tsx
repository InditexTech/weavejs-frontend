// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import {
  AlignCenter,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignLeft,
  AlignRight,
  AlignStartHorizontal,
  Bold,
  Italic,
  RemoveFormatting,
  Strikethrough,
  Type,
  Underline,
} from "lucide-react";
import {
  mergeExceptArrays,
  WEAVE_SHAPE_LABEL_DEFAULTS,
} from "@inditextech/weave-sdk";
import { WeaveFont, WeaveStateElement } from "@inditextech/weave-types";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { InputColor } from "../inputs/input-color";
import { ToggleIconButton } from "../toggle-icon-button";
import InputFontFamily from "../inputs/input-font-family";
import { InputNumber } from "../inputs/input-number";

const LIGHT_WEIGHT = 300;

export function LabelProperties() {
  const instance = useWeave((state) => state.instance);
  const node = useWeave((state) => state.selection.node);
  const actualAction = useWeave((state) => state.actions.actual);

  const fontsValues = useCollaborationRoom((state) => state.fonts.values);
  const nodePropertiesAction = useCollaborationRoom(
    (state) => state.nodeProperties.action,
  );

  const nodeCreateProps = useCollaborationRoom(
    (state) => state.nodeProperties.createProps,
  );

  const [selectedFontFamily, setSelectedFontFamily] = React.useState<
    string | null
  >(null);

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

  React.useEffect(() => {
    setSelectedFontFamily(actualNode?.props?.labelFontFamily ?? null);
  }, [actualNode]);

  const weaveFont = React.useMemo(() => {
    return fontsValues.find(
      (font: WeaveFont) => font.name === selectedFontFamily,
    );
  }, [fontsValues, selectedFontFamily]);

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

  const actualLabelProperties = React.useMemo(() => {
    if (!actualNode) return WEAVE_SHAPE_LABEL_DEFAULTS;

    return mergeExceptArrays(WEAVE_SHAPE_LABEL_DEFAULTS, actualNode.props);
  }, [actualNode]);

  if (!instance || !actualAction || !actualNode) {
    return null;
  }

  if (!actualAction && !actualNode) return null;

  if (
    !["rectangle", "ellipse", "polygon", "regular-polygon"].includes(
      actualNode.type,
    )
  ) {
    return null;
  }

  if (actualNode.props.labelText === "") {
    return null;
  }

  return (
    <div className="p-[24px] pt-[16px] pb-0 flex flex-col gap-[16px]">
      <div className="w-full flex justify-between items-center gap-3">
        <div className="cursor-pointer hover:no-underline items-center py-0">
          <span className="text-[13px] font-inter font-light uppercase">
            LABEL
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full">
        <InputNumber
          label="Padding X"
          value={actualNode.props.labelPaddingX ?? 8}
          onChange={(value) => {
            const updatedNode: WeaveStateElement = {
              ...actualNode,
              props: {
                ...actualNode.props,
                labelPaddingX: value,
              },
            };
            updateElement(updatedNode);
          }}
        />
        <InputNumber
          label="Padding Y"
          value={actualNode.props.labelPaddingY ?? 8}
          onChange={(value) => {
            const updatedNode: WeaveStateElement = {
              ...actualNode,
              props: {
                ...actualNode.props,
                labelPaddingY: value,
              },
            };
            updateElement(updatedNode);
          }}
        />
        <div className="col-span-2">
          <InputFontFamily
            value={`${actualLabelProperties.labelFontFamily ?? null}`}
            onChange={(value) => {
              const updatedNode: WeaveStateElement = {
                ...actualNode,
                props: {
                  ...actualNode.props,
                  labelFontFamily: value,
                },
              };

              updateElement(updatedNode);
            }}
          />
        </div>
        <div className="col-span-2">
          <InputColor
            label="Font color"
            value={actualNode.props.labelFill}
            onChange={(value) => {
              const updatedNode: WeaveStateElement = {
                ...actualNode,
                props: {
                  ...actualNode.props,
                  labelFill: value,
                },
              };
              updateElement(updatedNode);
            }}
          />
        </div>
        <InputNumber
          label="Font size (px)"
          value={actualNode.props.labelFontSize ?? 16}
          onChange={(value) => {
            const updatedNode: WeaveStateElement = {
              ...actualNode,
              props: {
                ...actualNode.props,
                labelFontSize: value,
              },
            };
            updateElement(updatedNode);
          }}
        />
        <InputNumber
          label="Line Height"
          value={actualNode.props.labelLineHeight ?? 1}
          onChange={(value) => {
            const updatedNode: WeaveStateElement = {
              ...actualNode,
              props: {
                ...actualNode.props,
                labelLineHeight: value,
              },
            };
            updateElement(updatedNode);
          }}
        />

        <div className="w-full flex justify-between items-center gap-4 col-span-2">
          <div className="text-[12px] text-[#757575] font-inter font-light text-nowrap">
            Style
          </div>
          <div className="w-full flex justify-end items-center gap-1">
            <ToggleIconButton
              kind="switch"
              icon={<RemoveFormatting size={20} strokeWidth={1} />}
              disabled={!weaveFont?.supportedStyles?.includes("normal")}
              pressed={
                (actualNode.props.labelFontStyle ?? "normal").indexOf(
                  "normal",
                ) !== -1
              }
              onClick={(e) => {
                e.stopPropagation();
                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    labelFontStyle: "normal",
                  },
                };
                updateElement(updatedNode);
              }}
            />
            <ToggleIconButton
              kind="switch"
              disabled={!weaveFont?.supportedStyles?.includes("italic")}
              icon={<Italic size={20} strokeWidth={1} />}
              pressed={
                (actualNode.props.labelFontStyle ?? "normal").indexOf(
                  "italic",
                ) !== -1
              }
              onClick={(e) => {
                e.stopPropagation();
                let items = [
                  ...(actualNode.props.labelFontStyle ?? "normal")
                    .split(" ")
                    .filter((e: string) => e !== "normal"),
                ];
                if (
                  (actualNode.props.labelFontStyle ?? "normal").indexOf(
                    "italic",
                  ) !== -1
                ) {
                  items = items.filter((e: string) => e !== "italic");
                }
                if (
                  (actualNode.props.labelFontStyle ?? "normal").indexOf(
                    "italic",
                  ) === -1
                ) {
                  items = [...items];
                  items.push("italic");
                }

                if (items.length === 0) {
                  items = ["normal"];
                }

                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    labelFontStyle: items.join(" "),
                  },
                };
                updateElement(updatedNode);
              }}
            />
            <ToggleIconButton
              kind="switch"
              icon={<Bold size={20} strokeWidth={1} />}
              disabled={!weaveFont?.supportedStyles?.includes("bold")}
              pressed={
                (actualNode.props.labelFontStyle ?? "normal").indexOf(
                  "bold",
                ) !== -1
              }
              onClick={(e) => {
                e.stopPropagation();
                let items = [
                  ...(actualNode.props.labelFontStyle ?? "normal")
                    .split(" ")
                    .filter((e: string) => e !== "normal"),
                ];
                if (
                  (actualNode.props.labelFontStyle ?? "normal").indexOf(
                    "bold",
                  ) !== -1
                ) {
                  items = items.filter((e: string) => e !== "bold");
                }
                if (
                  (actualNode.props.labelFontStyle ?? "normal").indexOf(
                    "bold",
                  ) === -1
                ) {
                  items = [...items];
                  items.push("bold");
                }

                if (items.length === 0) {
                  items = ["normal"];
                }

                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    labelFontStyle: items.join(" "),
                  },
                };
                updateElement(updatedNode);
              }}
            />
            <ToggleIconButton
              kind="switch"
              icon={<Type size={20} strokeWidth={1} />}
              // disabled={!weaveFont?.supportedStyles?.includes(100)}
              pressed={
                (actualNode.props.labelFontStyle ?? "normal").indexOf(
                  LIGHT_WEIGHT,
                ) !== -1
              }
              onClick={(e) => {
                e.stopPropagation();
                let items = [
                  ...(actualNode.props.labelFontStyle ?? "normal")
                    .split(" ")
                    .filter((e: string | number) => e !== "normal"),
                ];
                if (
                  (actualNode.props.labelFontStyle ?? "normal").indexOf(
                    LIGHT_WEIGHT,
                  ) !== -1
                ) {
                  items = items.filter(
                    (e: string | number) => e !== LIGHT_WEIGHT,
                  );
                }
                if (
                  (actualNode.props.labelFontStyle ?? "normal").indexOf(
                    LIGHT_WEIGHT,
                  ) === -1
                ) {
                  items = [...items];
                  items.push(LIGHT_WEIGHT);
                }

                if (items.length === 0) {
                  items = ["normal"];
                }

                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    labelFontStyle: items.join(" "),
                  },
                };
                updateElement(updatedNode);
              }}
            />
          </div>
        </div>
        <div className="w-full flex justify-between items-center gap-4 col-span-2">
          <div className="text-[12px] text-[#757575] font-inter font-light text-nowrap">
            Decoration
          </div>
          <div className="w-full flex justify-end items-center gap-1">
            <ToggleIconButton
              kind="switch"
              icon={<RemoveFormatting size={20} strokeWidth={1} />}
              pressed={(actualNode.props.labelTextDecoration ?? "") === ""}
              onClick={() => {
                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    labelTextDecoration: "",
                  },
                };
                updateElement(updatedNode);
              }}
            />
            <ToggleIconButton
              kind="switch"
              icon={<Strikethrough size={20} strokeWidth={1} />}
              pressed={
                (actualNode.props.labelTextDecoration ?? "") === "line-through"
              }
              onClick={() => {
                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    labelTextDecoration: "line-through",
                  },
                };
                updateElement(updatedNode);
              }}
            />
            <ToggleIconButton
              kind="switch"
              icon={<Underline size={20} strokeWidth={1} />}
              pressed={
                (actualNode.props.labelTextDecoration ?? "") === "underline"
              }
              onClick={() => {
                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    labelTextDecoration: "underline",
                  },
                };
                updateElement(updatedNode);
              }}
            />
          </div>
        </div>
        <div className="w-full flex justify-between items-center gap-4 col-span-2">
          <div className="text-[12px] text-[#757575] font-inter font-light text-nowrap">
            Horizontal alignment
          </div>
          <div className="w-full flex justify-end items-center gap-1">
            <ToggleIconButton
              kind="switch"
              icon={<AlignLeft size={20} strokeWidth={1} />}
              pressed={(actualNode.props.labelAlign ?? "") === "left"}
              onClick={() => {
                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    labelAlign: "left",
                  },
                };
                updateElement(updatedNode);
              }}
            />
            <ToggleIconButton
              kind="switch"
              icon={<AlignCenter size={20} strokeWidth={1} />}
              pressed={(actualNode.props.labelAlign ?? "") === "center"}
              onClick={() => {
                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    labelAlign: "center",
                  },
                };
                updateElement(updatedNode);
              }}
            />
            <ToggleIconButton
              kind="switch"
              icon={<AlignRight size={20} strokeWidth={1} />}
              pressed={(actualNode.props.labelAlign ?? "") === "right"}
              onClick={() => {
                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    labelAlign: "right",
                  },
                };
                updateElement(updatedNode);
              }}
            />
          </div>
        </div>
        <div className="w-full flex justify-between items-center gap-4 col-span-2">
          <div className="text-[12px] text-[#757575] font-inter font-light text-nowrap">
            Vertical alignment
          </div>
          <div className="w-full flex justify-end items-center gap-1">
            <ToggleIconButton
              kind="switch"
              icon={<AlignStartHorizontal size={20} strokeWidth={1} />}
              pressed={(actualNode.props.labelVerticalAlign ?? "top") === "top"}
              onClick={() => {
                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    labelVerticalAlign: "top",
                  },
                };
                updateElement(updatedNode);
              }}
            />
            <ToggleIconButton
              kind="switch"
              icon={<AlignCenterHorizontal size={20} strokeWidth={1} />}
              pressed={
                (actualNode.props.labelVerticalAlign ?? "top") === "middle"
              }
              onClick={() => {
                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    labelVerticalAlign: "middle",
                  },
                };
                updateElement(updatedNode);
              }}
            />
            <ToggleIconButton
              kind="switch"
              icon={<AlignEndHorizontal size={20} strokeWidth={1} />}
              pressed={(actualNode.props.labelVerticalAlign ?? "") === "bottom"}
              onClick={() => {
                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    labelVerticalAlign: "bottom",
                  },
                };
                updateElement(updatedNode);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
