// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import { v4 as uuidv4 } from "uuid";
import React from "react";
import Konva from "konva";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { generateRichText } from "./node";
import { EXAMPLE_MODEL } from "./constants";
import { useRichText } from "./store";
import { FontFamily } from "./controls/font-family";
import { FontSize } from "./controls/font-size";
import { FontStyle } from "./controls/font-style";
import { FontColor } from "./controls/font-color";
import { FontAlignment } from "./controls/font-alignment";
import { TextLayout } from "./controls/text-layout";
import { Cog } from "lucide-react";
import { normalizeLineColumn } from "./keyboard";

export const RichTextPage = () => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const konvaStageRef = React.useRef<Konva.Stage | null>(null);

  const [setuped, setSetuped] = React.useState(false);
  const [editCursorLine, setEditCursorLine] = React.useState(0);
  const [editCursorColumn, setEditCursorColumn] = React.useState(0);
  const [selectionStart, setSelectionStart] = React.useState<
    { line: number; column: number } | undefined
  >(undefined);
  const [selectionEnd, setSelectionEnd] = React.useState<
    { line: number; column: number } | undefined
  >(undefined);
  const [selectionChars, setSelectionChars] = React.useState<number>(0);
  const [change, setChange] = React.useState<string>(uuidv4);

  const model = useRichText((state) => state.model);
  const guidesBounds = useRichText((state) => state.guides.bounds);
  const guidesBaselines = useRichText((state) => state.guides.baselines);
  const guidesSegments = useRichText((state) => state.guides.segments);
  const editing = useRichText((state) => state.editing);
  const setModel = useRichText((state) => state.setModel);
  const setGuidesBounds = useRichText((state) => state.setGuidesBounds);
  const setGuidesBaselines = useRichText((state) => state.setGuidesBaselines);
  const setGuidesSegments = useRichText((state) => state.setGuidesSegments);
  const setEditing = useRichText((state) => state.setEditing);
  const setStyle = useRichText((state) => state.setStyle);
  const setStyles = useRichText((state) => state.setStyles);
  const setStage = useRichText((state) => state.setStage);

  React.useEffect(() => {
    if (ref.current && !setuped) {
      const { width, height } = ref.current.getBoundingClientRect();
      const stage = new Konva.Stage({
        container: ref.current!,
        width,
        height,
      });

      const layer = new Konva.Layer({
        listening: true,
      });
      stage.add(layer);

      stage.on("pointermove", (e) => {
        if (e.target === stage) {
          document.body.style.cursor = "default";
        }
      });

      stage.on("pointerdown", (e) => {
        if (e.target === stage) {
          document.body.style.cursor = "default";
          stage.setAttr("editingMode", "none");
          stage.fire("editingMode:change");
          tr.nodes([]);
          return;
        }
        if (e.target !== stage) {
          tr.nodes([e.target]);
        }
      });

      stage.on("editingMode:change", () => {
        const editingMode = stage.getAttr("editingMode");
        setEditing(editingMode === "text");
        if (editingMode === "text") {
          tr.visible(false);
        } else {
          tr.visible(true);
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stage.on("textCursorChange", (e: any) => {
        setEditCursorLine(e.line);
        setEditCursorColumn(e.column);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stage.on("textSelectionStartChange", (e: any) => {
        if (e?.selectionStart !== undefined) {
          setSelectionStart(e.selectionStart);
        } else {
          setSelectionStart(undefined);
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stage.on("textSelectionEndChange", (e: any) => {
        if (e?.selectionEnd !== undefined) {
          setSelectionEnd(e.selectionEnd);
          setSelectionChars(e.selectedCharsAmount);
        } else {
          setSelectionEnd(undefined);
          setSelectionChars(0);
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stage.on("text:change", (e: any) => {
        const newModel = e.model;
        setModel(newModel);
        setChange(uuidv4());
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stage.on("textStyleChange", (e: any) => {
        const styles = e.styles;
        setStyles(styles);
        if (styles && styles.length === 1) {
          setStyle({ ...styles[0] });
          return;
        }
      });

      const pos = { x: 50, y: 50 };
      const maxWidth = 500;

      const richText = generateRichText(stage, pos, maxWidth, EXAMPLE_MODEL);
      layer.add(richText);

      richText.fire("text:change", { model: richText.getAttr("model") }, true);

      const tr = new Konva.Transformer({
        resizeEnabled: false,
      });
      layer.add(tr);
      tr.moveToTop();

      konvaStageRef.current = stage;

      setStage(stage);

      setSetuped(true);
    }
  }, [setuped, setEditing, setStyle, setModel]);

  React.useEffect(() => {
    if (konvaStageRef.current) {
      const bounds = konvaStageRef.current.findOne(".bounds");
      if (bounds) {
        bounds.visible(guidesBounds);
      }
    }
  }, [guidesBounds, change]);

  React.useEffect(() => {
    if (konvaStageRef.current) {
      const baselines = konvaStageRef.current.find(".baseline");
      if (baselines.length > 0) {
        for (const baseline of baselines) {
          baseline.visible(guidesBaselines);
        }
      }
    }
  }, [guidesBaselines, change]);

  React.useEffect(() => {
    if (konvaStageRef.current) {
      const segments = konvaStageRef.current.find(".segment");
      if (segments.length > 0) {
        for (const segment of segments) {
          segment.visible(guidesSegments);
        }
      }
    }
  }, [guidesSegments, change]);

  const { from: selectionFrom, to: selectionTo } = React.useMemo(() => {
    if (selectionStart === undefined || selectionEnd === undefined) {
      return { from: selectionStart, to: selectionEnd };
    }
    return normalizeLineColumn(selectionStart, selectionEnd);
  }, [selectionStart, selectionEnd]);

  return (
    <>
      <main className="relative w-full h-full grid grid-rows-[auto_1fr]">
        <div className="border-b border-[#c9c9c9] min-h-[80px] p-5 flex justify-between items-center">
          <div className="text-2xl text-nowrap">RICH TEXT PLAYGROUND</div>
          <div className="flex justify-end gap-1 items-center">
            {editing && (
              <>
                <div className="flex flex-col font-mono text-xs justify-end text-right text-nowrap">
                  <div>
                    <b>Cursor</b> l:{editCursorLine},c:{editCursorColumn}
                  </div>
                  {selectionFrom && selectionTo && (
                    <>
                      <div>
                        <b>Selection</b> <span className="underline">from</span>{" "}
                        l:
                        {selectionFrom?.line},c:{selectionFrom?.column}
                        {selectionTo && (
                          <>
                            {" "}
                            <span className="underline">to</span> l:
                            {selectionTo?.line},c:{selectionTo?.column} (Chars:{" "}
                            {selectionChars})
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="w-[1px] h-[40px] bg-[#c9c9c9] mx-3" />
                <div className="w-[200px] min-w-[200px]">
                  <FontFamily />
                </div>
                <div className="w-[100px] min-w-[100px]">
                  <FontSize />
                </div>
                <FontStyle />
                <FontColor />
                <div className="w-[1px] h-[40px] bg-[#c9c9c9] mx-3" />
                <FontAlignment />
                <div className="w-[1px] h-[40px] bg-[#c9c9c9] mx-3" />
                <div className="w-[150px] min-w-[150px]">
                  <TextLayout />
                </div>
                <div className="w-[1px] h-[40px] bg-[#c9c9c9] mx-3" />
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="cursor-pointer">
                  <Cog strokeWidth={1} size={20} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="bottom"
                alignOffset={0}
                sideOffset={8}
                className="min-w-auto font-inter rounded-none shadow-none flex flex-row !z-[1000000000]"
              >
                <div
                  className="flex !flex-col gap-0 w-[200px] p-4"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="flex flex-col gap-3 justify-start items-start">
                    <div className="w-full flex justify-between items-center gap-2">
                      <Label htmlFor="bounds" className="uppercase">
                        Bounds
                      </Label>
                      <Checkbox
                        id="bounds"
                        className="rounded-none"
                        checked={guidesBounds}
                        onCheckedChange={setGuidesBounds}
                      />
                    </div>
                    <div className="w-full flex justify-between items-center gap-2">
                      <Label htmlFor="baselines" className="uppercase">
                        Baselines
                      </Label>
                      <Checkbox
                        id="baselines"
                        className="rounded-none"
                        checked={guidesBaselines}
                        onCheckedChange={setGuidesBaselines}
                      />
                    </div>
                    <div className="w-full flex justify-between items-center gap-2">
                      <Label htmlFor="segments" className="uppercase">
                        Segments
                      </Label>
                      <Checkbox
                        id="segments"
                        className="rounded-none"
                        checked={guidesSegments}
                        onCheckedChange={setGuidesSegments}
                      />
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="w-full h-full">
          <div className="w-full h-full grid grid-cols-[minmax(0,1fr)_600px]">
            <div>
              <div
                id="konva-container"
                tabIndex={0}
                ref={ref}
                className="w-full h-full"
              ></div>
            </div>
            <div className="border-l border-[#c9c9c9]">
              {model && (
                <textarea
                  className="w-full h-full font-mono"
                  value={JSON.stringify(model, null, 2)}
                  onChange={() => {
                    console.log("change");
                  }}
                />
              )}
              {model === undefined && (
                <div className="w-full h-full flex justify-center items-center">
                  NOT EDITING TEXT
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
