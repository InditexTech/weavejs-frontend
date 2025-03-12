import { InputNumber } from "../inputs/input-number";

import { InputText } from "../inputs/input-text";
import {
  AlignCenter,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignLeft,
  AlignRight,
  AlignStartHorizontal,
  Bold,
  CaseSensitive,
  CaseUpper,
  Italic,
  RemoveFormatting,
  Strikethrough,
  Underline,
} from "lucide-react";
import { ToggleIconButton } from "../toggle-icon-button";
import { InputColor } from "../inputs/input-color";
import withInstanceNode from "../with-instance-node";
import { Weave, WeaveStateElement } from "@inditextech/weavejs-sdk";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function TextOverlayOptions({
  instance,
  node,
}: {
  instance: Weave;
  node: WeaveStateElement;
}) {
  return (
    <AccordionItem value="typography">
      <div className="w-full flex justify-between items-center gap-3 p-4 py-3">
        <AccordionTrigger className="cursor-pointer hover:no-underline items-center py-0">
          <span className="text-xs font-noto-sans-mono font-light">
            Typography
          </span>
        </AccordionTrigger>
      </div>
      <AccordionContent className="px-4 pb-4">
        <div className="grid grid-cols-1 gap-3 w-full">
          <InputText
            label="Font Family"
            value={`${node.props.fontFamily ?? null}`}
            onChange={(value) => {
              console.log("NEW FONT", value);
            }}
          />
          <InputNumber
            label="Size"
            value={node.props.fontSize ?? 16}
            onChange={(value) => {
              const updatedNode = {
                ...node,
                props: {
                  ...node.props,
                  fontSize: value,
                },
              };
              instance.updateNode(updatedNode);
            }}
          />
          <div className="w-full flex justify-between items-center gap-4">
            <div className="text-xs font-noto-sans-mono font-light text-nowrap">
              Style
            </div>
            <div className="w-full flex justify-end items-center gap-1">
              <ToggleIconButton
                kind="switch"
                icon={<RemoveFormatting size={16} />}
                pressed={
                  (node.props.fontStyle ?? "normal").indexOf("normal") !== -1
                }
                onClick={() => {
                  const updatedNode = {
                    ...node,
                    props: {
                      ...node.props,
                      fontStyle: "normal",
                    },
                  };
                  instance.updateNode(updatedNode);
                }}
              />
              <ToggleIconButton
                kind="switch"
                icon={<Italic size={16} />}
                pressed={
                  (node.props.fontStyle ?? "normal").indexOf("italic") !== -1
                }
                onClick={() => {
                  let items = [
                    ...(node.props.fontStyle ?? "normal")
                      .split(" ")
                      .filter((e: string) => e !== "normal"),
                  ];
                  if (
                    (node.props.fontStyle ?? "normal").indexOf("italic") !== -1
                  ) {
                    items = items.filter((e: string) => e !== "italic");
                  }
                  if (
                    (node.props.fontStyle ?? "normal").indexOf("italic") === -1
                  ) {
                    items = [...items];
                    items.push("italic");
                  }

                  if (items.length === 0) {
                    items = ["normal"];
                  }

                  const updatedNode = {
                    ...node,
                    props: {
                      ...node.props,
                      fontStyle: items.join(" "),
                    },
                  };
                  instance.updateNode(updatedNode);
                }}
              />
              <ToggleIconButton
                kind="switch"
                icon={<Bold size={16} />}
                pressed={
                  (node.props.fontStyle ?? "normal").indexOf("bold") !== -1
                }
                onClick={() => {
                  let items = [
                    ...(node.props.fontStyle ?? "normal")
                      .split(" ")
                      .filter((e: string) => e !== "normal"),
                  ];
                  if (
                    (node.props.fontStyle ?? "normal").indexOf("bold") !== -1
                  ) {
                    items = items.filter((e: string) => e !== "bold");
                  }
                  if (
                    (node.props.fontStyle ?? "normal").indexOf("bold") === -1
                  ) {
                    items = [...items];
                    items.push("bold");
                  }

                  if (items.length === 0) {
                    items = ["normal"];
                  }

                  const updatedNode = {
                    ...node,
                    props: {
                      ...node.props,
                      fontStyle: items.join(" "),
                    },
                  };
                  instance.updateNode(updatedNode);
                }}
              />
            </div>
          </div>
          <div className="w-full flex justify-between items-center gap-4">
            <div className="text-xs font-noto-sans-mono font-light text-nowrap">
              Variant
            </div>
            <div className="w-full flex justify-end items-center gap-1">
              <ToggleIconButton
                kind="switch"
                icon={<CaseSensitive size={16} />}
                pressed={node.props.fontVariant === "normal"}
                onClick={() => {
                  const updatedNode = {
                    ...node,
                    props: {
                      ...node.props,
                      fontVariant: "normal",
                    },
                  };
                  instance.updateNode(updatedNode);
                }}
              />
              <ToggleIconButton
                kind="switch"
                icon={<CaseUpper size={16} />}
                pressed={node.props.fontVariant === "small-caps"}
                onClick={() => {
                  const updatedNode = {
                    ...node,
                    props: {
                      ...node.props,
                      fontVariant: "small-caps",
                    },
                  };
                  instance.updateNode(updatedNode);
                }}
              />
            </div>
          </div>
          <div className="w-full flex justify-between items-center gap-4">
            <div className="text-xs font-noto-sans-mono font-light text-nowrap">
              Decoration
            </div>
            <div className="w-full flex justify-end items-center gap-1">
              <ToggleIconButton
                kind="switch"
                icon={<RemoveFormatting size={16} />}
                pressed={(node.props.textDecoration ?? "") === ""}
                onClick={() => {
                  const updatedNode = {
                    ...node,
                    props: {
                      ...node.props,
                      textDecoration: "",
                    },
                  };
                  instance.updateNode(updatedNode);
                }}
              />
              <ToggleIconButton
                kind="switch"
                icon={<Strikethrough size={16} />}
                pressed={(node.props.textDecoration ?? "") === "line-through"}
                onClick={() => {
                  const updatedNode = {
                    ...node,
                    props: {
                      ...node.props,
                      textDecoration: "line-through",
                    },
                  };
                  instance.updateNode(updatedNode);
                }}
              />
              <ToggleIconButton
                kind="switch"
                icon={<Underline size={16} />}
                pressed={(node.props.textDecoration ?? "") === "underline"}
                onClick={() => {
                  const updatedNode = {
                    ...node,
                    props: {
                      ...node.props,
                      textDecoration: "underline",
                    },
                  };
                  instance.updateNode(updatedNode);
                }}
              />
            </div>
          </div>
          <div className="w-full flex justify-between items-center gap-4">
            <div className="text-xs font-noto-sans-mono font-light text-nowrap">
              Alignment
            </div>
            <div className="w-full flex justify-end items-center gap-1">
              <ToggleIconButton
                kind="switch"
                icon={<AlignLeft size={16} />}
                pressed={(node.props.align ?? "") === "left"}
                onClick={() => {
                  const updatedNode = {
                    ...node,
                    props: {
                      ...node.props,
                      align: "left",
                    },
                  };
                  instance.updateNode(updatedNode);
                }}
              />
              <ToggleIconButton
                kind="switch"
                icon={<AlignCenter size={16} />}
                pressed={(node.props.align ?? "") === "center"}
                onClick={() => {
                  const updatedNode = {
                    ...node,
                    props: {
                      ...node.props,
                      align: "center",
                    },
                  };
                  instance.updateNode(updatedNode);
                }}
              />
              <ToggleIconButton
                kind="switch"
                icon={<AlignRight size={16} />}
                pressed={(node.props.align ?? "") === "right"}
                onClick={() => {
                  const updatedNode = {
                    ...node,
                    props: {
                      ...node.props,
                      align: "right",
                    },
                  };
                  instance.updateNode(updatedNode);
                }}
              />
            </div>
          </div>

          <div className="w-full flex justify-between items-center gap-4">
            <div className="text-xs font-noto-sans-mono font-light text-nowrap">
              Vertical Alignment
            </div>
            <div className="w-full flex justify-end items-center gap-1">
              <ToggleIconButton
                kind="switch"
                icon={<AlignStartHorizontal size={16} />}
                pressed={(node.props.verticalAlign ?? "top") === "top"}
                onClick={() => {
                  const updatedNode = {
                    ...node,
                    props: {
                      ...node.props,
                      verticalAlign: "top",
                    },
                  };
                  instance.updateNode(updatedNode);
                }}
              />
              <ToggleIconButton
                kind="switch"
                icon={<AlignCenterHorizontal size={16} />}
                pressed={(node.props.verticalAlign ?? "top") === "middle"}
                onClick={() => {
                  const updatedNode = {
                    ...node,
                    props: {
                      ...node.props,
                      verticalAlign: "middle",
                    },
                  };
                  instance.updateNode(updatedNode);
                }}
              />
              <ToggleIconButton
                kind="switch"
                icon={<AlignEndHorizontal size={16} />}
                pressed={(node.props.verticalAlign ?? "") === "bottom"}
                onClick={() => {
                  const updatedNode = {
                    ...node,
                    props: {
                      ...node.props,
                      verticalAlign: "bottom",
                    },
                  };
                  instance.updateNode(updatedNode);
                }}
              />
            </div>
          </div>
          <InputNumber
            label="Line Height"
            value={node.props.lineHeight ?? 1}
            onChange={(value) => {
              const updatedNode = {
                ...node,
                props: {
                  ...node.props,
                  lineHeight: value,
                },
              };
              instance.updateNode(updatedNode);
            }}
          />
          <InputColor
            label="Color"
            value={`${node.props.fill.replace("#", "")}`}
            onChange={(value) => {
              const updatedNode = {
                ...node,
                props: {
                  ...node.props,
                  fill: `#${value}`,
                },
              };
              instance.updateNode(updatedNode);
            }}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

const TextOverlayOptionsWithInstance = withInstanceNode(TextOverlayOptions);
TextOverlayOptionsWithInstance.displayName = "TextOverlayOptions";

export default TextOverlayOptionsWithInstance;
