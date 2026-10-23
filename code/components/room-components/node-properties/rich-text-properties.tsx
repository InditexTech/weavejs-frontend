// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import {
  Bold,
  Indent,
  Italic,
  List,
  ListOrdered,
  Outdent,
  Strikethrough,
  Underline,
} from "lucide-react";
import type { WeaveElementInstance } from "@inditextech/weave-types";
import { useWeave } from "@inditextech/weave-react";
import { ToggleIconButton } from "../toggle-icon-button";
import { InputColor } from "../inputs/input-color";
import { InputNumber } from "../inputs/input-number";
import InputFontFamily from "../inputs/input-font-family";
import { Input } from "@/components/ui/input";

// Local structural types for the rich-text API of WeaveTextV2Node
// (weave-sdk). They are not exported by the published SDK yet.
type MarkKey =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "color"
  | "size"
  | "family"
  | "link";
type MarkQuery = { state: "all" | "none" | "some"; value?: unknown };
type Range = { start: number; end: number };
type SelectionFormat = {
  bold: MarkQuery;
  italic: MarkQuery;
  underline: MarkQuery;
  strike: MarkQuery;
  color: MarkQuery;
  size: MarkQuery;
  family: MarkQuery;
  link: MarkQuery;
  list: { kind: "ul" | "ol" | "none" | "mixed"; depth?: number };
};
interface RichTextHandler {
  isRichTextEnabled(node?: WeaveElementInstance): boolean;
  getSelectionFormat(
    node: WeaveElementInstance,
    range?: Range,
  ): SelectionFormat;
  toggleMark(node: WeaveElementInstance, key: MarkKey, range?: Range): boolean;
  applyMark(
    node: WeaveElementInstance,
    key: MarkKey,
    value: unknown,
    range?: Range,
  ): boolean;
  toggleList(
    node: WeaveElementInstance,
    kind: "ul" | "ol",
    range?: Range,
  ): boolean;
  indent(node: WeaveElementInstance, range?: Range): boolean;
  outdent(node: WeaveElementInstance, range?: Range): boolean;
}

type Props = { nodeInstance: WeaveElementInstance };

// The root carries `data-weave-text-edit-keep`, so clicking here does not end
// the text edit session: commands apply to the live editor selection. When the
// node is not being edited they apply to the whole text.
export function RichTextProperties({ nodeInstance }: Readonly<Props>) {
  const instance = useWeave((state) => state.instance);

  const handler = React.useMemo(
    () => instance?.getNodeHandler<RichTextHandler>("text"),
    [instance],
  );
  const enabled = !!handler?.isRichTextEnabled?.(nodeInstance);

  const [linkDraft, setLinkDraft] = React.useState<string>("");
  const [linkError, setLinkError] = React.useState<string | null>(null);
  const [format, setFormat] = React.useState<SelectionFormat | null>(null);

  const refresh = React.useCallback(() => {
    if (!handler || !enabled) return;
    setFormat(handler.getSelectionFormat(nodeInstance));
  }, [handler, enabled, nodeInstance]);

  React.useEffect(() => {
    refresh();
  }, [nodeInstance, refresh]);

  React.useEffect(() => {
    if (!instance || !enabled) return;

    function onSelection(e: {
      node: WeaveElementInstance;
      start: number;
      end: number;
      format: SelectionFormat;
    }) {
      if (e.node !== nodeInstance) return;
      setFormat(e.format);
    }
    function onFormat(e: { node: WeaveElementInstance }) {
      if (e.node !== nodeInstance) return;
      refresh();
    }

    instance.addEventListener("onTextSelectionChange", onSelection);
    instance.addEventListener("onTextFormatChange", onFormat);
    return () => {
      instance.removeEventListener("onTextSelectionChange", onSelection);
      instance.removeEventListener("onTextFormatChange", onFormat);
    };
  }, [instance, enabled, nodeInstance, refresh]);

  const currentLink =
    typeof format?.link.value === "string" ? format.link.value : "";
  React.useEffect(() => {
    setLinkDraft(currentLink);
    setLinkError(null);
  }, [currentLink]);

  if (!handler || !enabled || !format) return null;

  const applyLink = () => {
    const url = linkDraft.trim();
    if (url === "") {
      handler.applyMark(nodeInstance, "link", undefined);
      return;
    }
    try {
      const u = new URL(url);
      if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error();
    } catch {
      setLinkError("Enter a valid http(s) URL");
      return;
    }
    setLinkError(null);
    if (!handler.applyMark(nodeInstance, "link", url)) {
      setLinkError("Select some text first");
    }
  };

  const baseFamily =
    (nodeInstance as unknown as { getAttr(k: string): string }).getAttr(
      "fontFamily",
    ) ?? "";
  const familyValue =
    typeof format.family.value === "string" ? format.family.value : baseFamily;

  const toggle = (key: MarkKey) => handler.toggleMark(nodeInstance, key);

  const marks = [
    { key: "bold", icon: Bold, query: format.bold },
    { key: "italic", icon: Italic, query: format.italic },
    { key: "underline", icon: Underline, query: format.underline },
    { key: "strike", icon: Strikethrough, query: format.strike },
  ] as const;

  const sizeValue =
    typeof format.size.value === "number" ? Math.round(format.size.value) : 0;
  const colorValue =
    typeof format.color.value === "string" ? format.color.value : "#000000";

  return (
    <div data-weave-text-edit-keep="" className="grid grid-cols-2 gap-3 w-full">
      <div className="col-span-2 text-[12px] text-[#757575] font-inter font-light uppercase">
        Rich text (selection)
      </div>
      <div className="w-full flex justify-between items-center gap-4 col-span-2">
        <div className="text-[12px] text-[#757575] font-inter font-light text-nowrap">
          Style
        </div>
        <div className="w-full flex justify-end items-center gap-1">
          {marks.map(({ key, icon: Icon, query }) => (
            <ToggleIconButton
              key={key}
              kind="switch"
              icon={<Icon size={20} strokeWidth={1} />}
              pressed={query.state === "all"}
              onClick={(e) => {
                e.stopPropagation();
                toggle(key);
              }}
            />
          ))}
        </div>
      </div>
      <div className="col-span-2">
        <InputFontFamily
          keepTextEditing
          value={familyValue}
          onChange={(value) => handler.applyMark(nodeInstance, "family", value)}
        />
      </div>
      <div className="col-span-2 flex flex-col gap-1">
        <div className="text-[12px] text-[#757575] font-inter font-light">
          Link (selection)
        </div>
        <div className="flex gap-1">
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
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
            }}
          />
          <button
            className="px-3 text-[12px] bg-black text-white cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              applyLink();
            }}
          >
            Apply
          </button>
          <button
            className="px-3 text-[12px] bg-white text-black border border-black cursor-pointer disabled:opacity-50"
            disabled={currentLink === ""}
            onClick={(e) => {
              e.stopPropagation();
              setLinkDraft("");
              handler.applyMark(nodeInstance, "link", undefined);
            }}
          >
            Remove
          </button>
        </div>
        {linkError && (
          <div className="text-[11px] text-red-600 font-inter font-light">
            {linkError}
          </div>
        )}
      </div>
      <div className="col-span-2">
        <InputColor
          label="Selection color"
          value={colorValue}
          onChange={(value) => handler.applyMark(nodeInstance, "color", value)}
        />
      </div>
      <div className="col-span-2">
        <InputNumber
          label="Selection size"
          value={sizeValue}
          min={1}
          onChange={(value) => handler.applyMark(nodeInstance, "size", value)}
        />
      </div>
      <div className="w-full flex justify-between items-center gap-4 col-span-2">
        <div className="text-[12px] text-[#757575] font-inter font-light text-nowrap">
          List
        </div>
        <div className="w-full flex justify-end items-center gap-1">
          <ToggleIconButton
            kind="switch"
            icon={<List size={20} strokeWidth={1} />}
            pressed={format.list.kind === "ul"}
            onClick={(e) => {
              e.stopPropagation();
              handler.toggleList(nodeInstance, "ul");
            }}
          />
          <ToggleIconButton
            kind="switch"
            icon={<ListOrdered size={20} strokeWidth={1} />}
            pressed={format.list.kind === "ol"}
            onClick={(e) => {
              e.stopPropagation();
              handler.toggleList(nodeInstance, "ol");
            }}
          />
          <ToggleIconButton
            kind="switch"
            icon={<Outdent size={20} strokeWidth={1} />}
            pressed={false}
            disabled={format.list.kind === "none"}
            onClick={(e) => {
              e.stopPropagation();
              handler.outdent(nodeInstance);
            }}
          />
          <ToggleIconButton
            kind="switch"
            icon={<Indent size={20} strokeWidth={1} />}
            pressed={false}
            disabled={format.list.kind === "none"}
            onClick={(e) => {
              e.stopPropagation();
              handler.indent(nodeInstance);
            }}
          />
        </div>
      </div>
    </div>
  );
}
