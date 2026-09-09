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
  Link2,
  RemoveFormatting,
  Strikethrough,
  Type,
  Underline,
} from "lucide-react";
import { WeaveFont, WeaveStateElement } from "@inditextech/weave-types";
import type { WeaveElementInstance } from "@inditextech/weave-types";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { Input } from "@/components/ui/input";
import { InputColor } from "../inputs/input-color";
import { ToggleIconButton } from "../toggle-icon-button";
import InputFontFamily from "../inputs/input-font-family";
import { InputNumber } from "../inputs/input-number";

const LIGHT_WEIGHT = 300;

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Matches the subset of WeaveTextNode's public API (weave-sdk) this panel
// needs. Declared locally rather than importing WeaveTextNode's type because
// getLink/setLink/removeLink aren't in the currently published weave-sdk
// types yet (only in the aliased local dev build via DEV_WEAVEJS_REPO_PATH).
// Persisting/validating the link, and restoring the node's fill/decoration
// on removal, is entirely weave-sdk's responsibility — this panel only calls
// the three public methods, never touches `props` directly for `link`.
interface WeaveTextLinkHandler {
  getLink(nodeInstance: WeaveElementInstance): string | undefined;
  setLink(nodeInstance: WeaveElementInstance, url: string): void;
  removeLink(nodeInstance: WeaveElementInstance): void;
}

export function TextProperties() {
  const instance = useWeave((state) => state.instance);
  const node = useWeave((state) => state.selection.node);
  const selectedNodes = useWeave((state) => state.selection.nodes);
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

  const [linkEnabled, setLinkEnabled] = React.useState<boolean>(false);
  const [linkDraft, setLinkDraft] = React.useState<string>("");
  const [linkError, setLinkError] = React.useState<string | null>(null);

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

  // The live Konva node instance behind the current selection — only
  // available when editing an already-placed node (nodePropertiesAction ===
  // "update"), never while just configuring defaults for the next node the
  // create-tool will place. Hyperlink editing requires this real instance,
  // since getLink/setLink/removeLink are instance methods on the SDK's text
  // node handler, not something derivable from the serialized props alone.
  const selectedTextInstance = React.useMemo(() => {
    if (nodePropertiesAction !== "update") return undefined;
    if (selectedNodes.length !== 1) return undefined;
    const [selected] = selectedNodes;
    if (selected.node?.type !== "text") return undefined;
    return selected.instance as unknown as WeaveElementInstance;
  }, [selectedNodes, nodePropertiesAction]);

  const textLinkHandler = React.useMemo(() => {
    return instance?.getNodeHandler<WeaveTextLinkHandler>("text");
  }, [instance]);

  React.useEffect(() => {
    setSelectedFontFamily(actualNode?.props?.fontFamily ?? null);
  }, [actualNode]);

  React.useEffect(() => {
    if (!textLinkHandler || !selectedTextInstance) {
      setLinkEnabled(false);
      setLinkDraft("");
      setLinkError(null);
      return;
    }
    const currentLink = textLinkHandler.getLink(selectedTextInstance) ?? "";
    setLinkEnabled(!!currentLink);
    setLinkDraft(currentLink);
    setLinkError(null);
  }, [textLinkHandler, selectedTextInstance]);

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

  if (!instance || !actualAction || !actualNode) {
    return null;
  }

  if (!actualAction && !actualNode) return null;

  if (
    !["textTool"].includes(actualAction) &&
    !["text"].includes(actualNode.type)
  ) {
    return null;
  }

  return (
    <div className="p-[24px] pt-[16px] pb-0 flex flex-col gap-[16px]">
      {/* <div className="w-full flex justify-between items-center gap-3">
        <div className="cursor-pointer hover:no-underline items-center py-0">
          <span className="text-[13px] font-inter font-light uppercase">
            Typography
          </span>
        </div>
      </div> */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="col-span-2">
          <InputFontFamily
            value={`${actualNode.props.fontFamily ?? null}`}
            onChange={(value) => {
              const updatedNode: WeaveStateElement = {
                ...actualNode,
                props: {
                  ...actualNode.props,
                  fontFamily: value,
                },
              };

              updateElement(updatedNode);
            }}
          />
        </div>
        <div className="col-span-2">
          <div
            className={
              linkEnabled ? "pointer-events-none opacity-50" : undefined
            }
          >
            <InputColor
              label="Font color"
              value={actualNode.props.fill}
              onChange={(value) => {
                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    fill: value,
                  },
                };
                updateElement(updatedNode);
              }}
            />
          </div>
        </div>
        <InputNumber
          label="Font size (px)"
          value={actualNode.props.fontSize ?? 16}
          onChange={(value) => {
            const updatedNode: WeaveStateElement = {
              ...actualNode,
              props: {
                ...actualNode.props,
                fontSize: value,
              },
            };
            updateElement(updatedNode);
          }}
        />
        <InputNumber
          label="Line Height"
          value={actualNode.props.lineHeight ?? 1}
          onChange={(value) => {
            const updatedNode: WeaveStateElement = {
              ...actualNode,
              props: {
                ...actualNode.props,
                lineHeight: value,
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
                (actualNode.props.fontStyle ?? "normal").indexOf("normal") !==
                -1
              }
              onClick={(e) => {
                e.stopPropagation();
                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    fontStyle: "normal",
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
                (actualNode.props.fontStyle ?? "normal").indexOf("italic") !==
                -1
              }
              onClick={(e) => {
                e.stopPropagation();
                let items = [
                  ...(actualNode.props.fontStyle ?? "normal")
                    .split(" ")
                    .filter((e: string) => e !== "normal"),
                ];
                if (
                  (actualNode.props.fontStyle ?? "normal").indexOf("italic") !==
                  -1
                ) {
                  items = items.filter((e: string) => e !== "italic");
                }
                if (
                  (actualNode.props.fontStyle ?? "normal").indexOf("italic") ===
                  -1
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
                    fontStyle: items.join(" "),
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
                (actualNode.props.fontStyle ?? "normal").indexOf("bold") !== -1
              }
              onClick={(e) => {
                e.stopPropagation();
                let items = [
                  ...(actualNode.props.fontStyle ?? "normal")
                    .split(" ")
                    .filter((e: string) => e !== "normal"),
                ];
                if (
                  (actualNode.props.fontStyle ?? "normal").indexOf("bold") !==
                  -1
                ) {
                  items = items.filter((e: string) => e !== "bold");
                }
                if (
                  (actualNode.props.fontStyle ?? "normal").indexOf("bold") ===
                  -1
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
                    fontStyle: items.join(" "),
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
                (actualNode.props.fontStyle ?? "normal").indexOf(
                  LIGHT_WEIGHT,
                ) !== -1
              }
              onClick={(e) => {
                e.stopPropagation();
                let items = [
                  ...(actualNode.props.fontStyle ?? "normal")
                    .split(" ")
                    .filter((e: string | number) => e !== "normal"),
                ];
                if (
                  (actualNode.props.fontStyle ?? "normal").indexOf(
                    LIGHT_WEIGHT,
                  ) !== -1
                ) {
                  items = items.filter(
                    (e: string | number) => e !== LIGHT_WEIGHT,
                  );
                }
                if (
                  (actualNode.props.fontStyle ?? "normal").indexOf(
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
                    fontStyle: items.join(" "),
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
              disabled={linkEnabled}
              pressed={(actualNode.props.textDecoration ?? "") === ""}
              onClick={() => {
                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    textDecoration: "",
                  },
                };
                updateElement(updatedNode);
              }}
            />
            <ToggleIconButton
              kind="switch"
              icon={<Strikethrough size={20} strokeWidth={1} />}
              disabled={linkEnabled}
              pressed={
                (actualNode.props.textDecoration ?? "") === "line-through"
              }
              onClick={() => {
                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    textDecoration: "line-through",
                  },
                };
                updateElement(updatedNode);
              }}
            />
            <ToggleIconButton
              kind="switch"
              icon={<Underline size={20} strokeWidth={1} />}
              disabled={linkEnabled}
              pressed={(actualNode.props.textDecoration ?? "") === "underline"}
              onClick={() => {
                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    textDecoration: "underline",
                  },
                };
                updateElement(updatedNode);
              }}
            />
          </div>
        </div>
        {linkEnabled && (
          <div className="text-[11px] text-[#757575] font-inter font-light col-span-2 -mt-2">
            Underline is forced on while hyperlink is enabled.
          </div>
        )}
        <div className="w-full flex justify-between items-center gap-4 col-span-2">
          <div className="text-[12px] text-[#757575] font-inter font-light text-nowrap">
            Horizontal alignment
          </div>
          <div className="w-full flex justify-end items-center gap-1">
            <ToggleIconButton
              kind="switch"
              icon={<AlignLeft size={20} strokeWidth={1} />}
              pressed={(actualNode.props.align ?? "") === "left"}
              onClick={() => {
                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    align: "left",
                  },
                };
                updateElement(updatedNode);
              }}
            />
            <ToggleIconButton
              kind="switch"
              icon={<AlignCenter size={20} strokeWidth={1} />}
              pressed={(actualNode.props.align ?? "") === "center"}
              onClick={() => {
                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    align: "center",
                  },
                };
                updateElement(updatedNode);
              }}
            />
            <ToggleIconButton
              kind="switch"
              icon={<AlignRight size={20} strokeWidth={1} />}
              pressed={(actualNode.props.align ?? "") === "right"}
              onClick={() => {
                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    align: "right",
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
              pressed={(actualNode.props.verticalAlign ?? "top") === "top"}
              onClick={() => {
                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    verticalAlign: "top",
                  },
                };
                updateElement(updatedNode);
              }}
            />
            <ToggleIconButton
              kind="switch"
              icon={<AlignCenterHorizontal size={20} strokeWidth={1} />}
              pressed={(actualNode.props.verticalAlign ?? "top") === "middle"}
              onClick={() => {
                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    verticalAlign: "middle",
                  },
                };
                updateElement(updatedNode);
              }}
            />
            <ToggleIconButton
              kind="switch"
              icon={<AlignEndHorizontal size={20} strokeWidth={1} />}
              pressed={(actualNode.props.verticalAlign ?? "") === "bottom"}
              onClick={() => {
                const updatedNode: WeaveStateElement = {
                  ...actualNode,
                  props: {
                    ...actualNode.props,
                    verticalAlign: "bottom",
                  },
                };
                updateElement(updatedNode);
              }}
            />
          </div>
        </div>
        {selectedTextInstance && textLinkHandler && (
          <>
            <div className="w-full flex justify-between items-center gap-4 col-span-2">
              <div className="text-[12px] text-[#757575] font-inter font-light text-nowrap">
                Hyperlink
              </div>
              <div className="w-full flex justify-end items-center gap-1">
                <ToggleIconButton
                  kind="switch"
                  icon={<Link2 size={20} strokeWidth={1} />}
                  pressed={linkEnabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (linkEnabled) {
                      setLinkEnabled(false);
                      setLinkDraft("");
                      setLinkError(null);
                      textLinkHandler.removeLink(selectedTextInstance);
                    } else {
                      setLinkEnabled(true);
                    }
                  }}
                />
              </div>
            </div>
            {linkEnabled && (
              <div className="col-span-2 flex flex-col gap-1">
                <Input
                  type="text"
                  placeholder="https://example.com"
                  className="w-full h-[40px] rounded-none !text-[14px] !border-black font-normal text-black focus:outline-none bg-transparent shadow-none"
                  value={linkDraft}
                  onChange={(e) => {
                    setLinkDraft(e.target.value);
                    if (linkError) setLinkError(null);
                  }}
                  onFocus={() => {
                    window.weaveOnFieldFocus = true;
                  }}
                  onBlur={() => {
                    window.weaveOnFieldFocus = false;
                    const trimmed = linkDraft.trim();
                    if (trimmed === "") {
                      setLinkEnabled(false);
                      setLinkError(null);
                      textLinkHandler.removeLink(selectedTextInstance);
                      return;
                    }
                    if (!isValidHttpUrl(trimmed)) {
                      setLinkError("Enter a valid http(s) URL");
                      return;
                    }
                    setLinkError(null);
                    textLinkHandler.setLink(selectedTextInstance, trimmed);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                />
                {linkError && (
                  <div className="text-[11px] text-red-600 font-inter font-light">
                    {linkError}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
