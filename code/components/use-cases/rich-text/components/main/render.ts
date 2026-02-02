import Konva from "konva";
import { DEFAULT_TEXT_STYLE, GUIDES } from "./constants";
import {
  Cursor,
  LineColumn,
  RichTextModel,
  RichTextRenderLine,
  TextStyle,
} from "./types";
import { getNode } from "./utils";
import {
  destroyCursor,
  fireCursorChangeEvent,
  initCursor,
  moveCursorToLineColumn,
  startCursorBlinkWithDelay,
  stopCursorBlink,
} from "./cursor";
import { setSelectionEndChange, setSelectionStartChange } from "./selection";
import {
  compositionEndHandler,
  compositionStartHandler,
  keyboardHandler,
  normalizeLineColumn,
} from "./keyboard";
import {
  createBaseline,
  createBoundsRect,
  createSegmentBounds,
  createSegmentLineBounds,
  updateBoundsRect,
} from "./develop";
import { createTextarea, destroyTextarea, focusTextarea } from "./textarea";
import { getLineColumnFromPointerPosition } from "./pointer";
import { isEqual } from "lodash";
import { mergeStyles } from "./styles";

const renderSegment = (
  parent: Konva.Container,
  cursor: Cursor,
  segmentIndex: number,
  lineBaseline: number,
  text: string,
  textStyle: TextStyle
): Cursor => {
  const textNode = new Konva.Text({
    name: "segmentText",
    x: cursor.x,
    y: cursor.y,
    text: text,
    fontSize: textStyle.size,
    fontFamily: textStyle.font,
    fontStyle: textStyle.style,
    textDecoration: textStyle.decoration,
    fill: textStyle.color,
    wrap: "none",
    align: "left",
    verticalAlign: "middle",
    listening: false,
  });

  const size = textNode.measureSize(text);
  const offset = size.height + size.emHeightDescent - lineBaseline;
  textNode.x(cursor.x + (segmentIndex === 0 ? size.actualBoundingBoxLeft : 0));
  textNode.y(cursor.y - offset);

  parent.add(textNode);

  createSegmentBounds(parent, cursor, offset, size, textStyle);

  return {
    x: cursor.x + size.width,
    y: cursor.y,
    width: size.width,
    height: size.height,
  };
};

export const renderTextModel = (
  instance: Konva.Group,
  maxWidth: number,
  renderModel: RichTextRenderLine[]
) => {
  const textNodes: Konva.Text[] = instance.find(".segmentText");
  textNodes.forEach((node) => node.destroy());
  const textSegmentNodes: Konva.Text[] = instance.find(".segment");
  textSegmentNodes.forEach((node) => node.destroy());
  const textBaselineNodes: Konva.Text[] = instance.find(".baseline");
  textBaselineNodes.forEach((node) => node.destroy());
  const textBounds: Konva.Text[] = instance.find(".bounds");
  textBounds.forEach((node) => node.destroy());
  const selection: Konva.Rect[] = instance.find(".selection");
  selection.forEach((node) => node.destroy());

  let actualCursor: Cursor = {
    x: 0,
    y: 0,
    width: 0,
    height: DEFAULT_TEXT_STYLE.size,
  };

  for (const line of renderModel) {
    let segmentIndex = 0;

    const lineStart = { ...actualCursor };

    for (const segment of line.lineSegments) {
      actualCursor = renderSegment(
        instance,
        actualCursor,
        segmentIndex,
        line.lineBaseline,
        segment.text,
        segment.style
      );
      segmentIndex++;
    }

    createSegmentLineBounds(
      instance,
      lineStart,
      actualCursor.x - lineStart.x,
      line.lineHeight
    );

    createBaseline(instance, maxWidth, line, actualCursor);

    actualCursor.x = 0;
    actualCursor.y += line.lineHeight;
  }

  createBoundsRect(instance, maxWidth);

  updateBackground(instance);
};

export const modelToKonvaNodes = (
  stage: Konva.Stage,
  pos: Konva.Vector2d,
  maxWidth: number,
  initialModel: RichTextModel,
  renderModel: RichTextRenderLine[]
) => {
  const richText = new Konva.Group({
    id: "rich-text-editor",
    name: "node",
    nodeType: "text",
    x: pos.x,
    y: pos.y,
    rotation: 0,
    listening: true,
    draggable: true,
    cursorPosition: undefined,
    selectionStart: undefined,
    selectionEnd: undefined,
    maxWidth: maxWidth,
  });

  renderTextModel(richText, maxWidth, renderModel);

  const rect = richText.getClientRect();

  const bg = new Konva.Rect({
    name: "background",
    x: 0 - 1,
    y: 0 - 1,
    width: rect.width + 2,
    height: rect.height + 2,
    fill: "transparent",
    stroke: "#0D99FF",
    strokeWidth: 0,
    opacity: 1,
    listening: true,
  });
  richText.add(bg);
  bg.moveToBottom();

  if (GUIDES.BOUNDS) {
    const boundsNode = richText.findOne(".bounds");
    if (boundsNode) {
      boundsNode.moveToTop();
    }
  }

  const cursor = new Konva.Line({
    name: "cursor",
    x: 0,
    y: 0,
    points: [0, 0, 0, DEFAULT_TEXT_STYLE.size],
    // fill: "#cc0000",
    stroke: "#000000",
    strokeWidth: 1,
    visible: false,
    listening: false,
  });
  richText.add(cursor);
  cursor.moveToTop();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  richText.on("onPositionChange", (e: any) => {
    const lineCol: LineColumn = e.lineCol;
    const renderModel: RichTextRenderLine[] = richText.getAttr("renderModel");
    let selectionStart = richText.getAttr("selectionStart");
    let selectionEnd = richText.getAttr("selectionEnd");

    const styles = [];

    if (selectionStart && selectionEnd) {
      const { from: finalFrom, to: finalTo } = normalizeLineColumn(
        selectionStart,
        selectionEnd
      );

      selectionStart = finalFrom;
      selectionEnd = finalTo;

      let actualStyle = {};
      let foundStart = false;
      let foundEnd = false;

      if (renderModel.length === 0) {
        return;
      }

      for (let i = selectionStart.line; i <= selectionEnd.line; i++) {
        const actualLine = renderModel[i];
        let columnIndex = 0;
        for (let j = 0; j < actualLine.lineSegments.length; j++) {
          const segment = actualLine.lineSegments[j];
          // start line and end line same
          if (
            !foundStart &&
            i === selectionStart.line &&
            selectionStart.line === selectionEnd.line &&
            selectionStart.column >= columnIndex &&
            selectionStart.column < columnIndex + segment.text.length
          ) {
            if (!isEqual(actualStyle, segment.style)) {
              styles.push(segment.style);
              actualStyle = segment.style;
            }
            foundStart = true;
            columnIndex += segment.text.length;
            continue;
          }
          if (
            !foundEnd &&
            foundStart &&
            i === selectionStart.line &&
            selectionStart.line === selectionEnd.line &&
            columnIndex < selectionEnd.column &&
            columnIndex + segment.text.length < selectionEnd.column
          ) {
            if (!isEqual(actualStyle, segment.style)) {
              styles.push(segment.style);
              actualStyle = segment.style;
            }
            foundStart = true;
          }
          if (
            !foundEnd &&
            foundStart &&
            i === selectionStart.line &&
            selectionStart.line === selectionEnd.line &&
            selectionEnd.column >= columnIndex &&
            selectionEnd.column < columnIndex + segment.text.length
          ) {
            if (!isEqual(actualStyle, segment.style)) {
              styles.push(segment.style);
              actualStyle = segment.style;
            }
            foundEnd = true;
          }
          // start line of selection
          if (
            !foundStart &&
            i === selectionStart.line &&
            selectionStart.line !== selectionEnd.line &&
            selectionStart.column >= columnIndex &&
            selectionStart.column < columnIndex + segment.text.length
          ) {
            if (!isEqual(actualStyle, segment.style)) {
              styles.push(segment.style);
              actualStyle = segment.style;
            }
            foundStart = true;
          }
          // start line rest of selection
          if (
            foundStart &&
            i === selectionStart.line &&
            selectionStart.line !== selectionEnd.line &&
            columnIndex >= selectionStart.column &&
            columnIndex + segment.text.length >= selectionStart.column
          ) {
            if (!isEqual(actualStyle, segment.style)) {
              styles.push(segment.style);
              actualStyle = segment.style;
            }
          }
          // intermediate lines of selection
          if (
            foundStart &&
            selectionStart.line !== selectionEnd.line &&
            i > selectionStart.line &&
            i < selectionEnd.line
          ) {
            if (!isEqual(actualStyle, segment.style)) {
              styles.push(segment.style);
              actualStyle = segment.style;
            }
          }
          // end line start of selection
          if (
            foundStart &&
            i === selectionEnd.line &&
            selectionStart.line !== selectionEnd.line &&
            columnIndex < selectionEnd.column &&
            columnIndex + segment.text.length < selectionEnd.column
          ) {
            if (!isEqual(actualStyle, segment.style)) {
              styles.push(segment.style);
              actualStyle = segment.style;
            }
          }
          // end line of selection
          if (
            foundStart &&
            i === selectionEnd.line &&
            selectionStart.line !== selectionEnd.line &&
            columnIndex < selectionEnd.column &&
            columnIndex + segment.text.length >= selectionEnd.column
          ) {
            if (!isEqual(actualStyle, segment.style)) {
              styles.push(segment.style);
              actualStyle = segment.style;
            }
          }

          columnIndex += segment.text.length;
        }
      }
    } else {
      let actualStyle = DEFAULT_TEXT_STYLE;
      const actualLine = renderModel[lineCol.line];
      let columnIndex = 0;
      for (let i = 0; i < actualLine.lineSegments.length; i++) {
        const segment = actualLine.lineSegments[i];
        if (
          lineCol.column - 1 >= columnIndex &&
          lineCol.column - 1 < columnIndex + segment.text.length
        ) {
          actualStyle = mergeStyles(actualStyle, segment.style);
          break;
        }

        columnIndex += segment.text.length;
      }

      if (lineCol.line === 0 && lineCol.column === 0) {
        // first line, first column, use next char style
        actualStyle = mergeStyles(
          DEFAULT_TEXT_STYLE,
          renderModel[0].lineSegments[0].style
        );
      }
      if (lineCol.line > 0 && lineCol.column === 0) {
        // not first line, first column, use last char style of previous line
        const prevLine = renderModel[lineCol.line - 1];
        const lastSegment =
          prevLine.lineSegments[prevLine.lineSegments.length - 1];
        actualStyle = mergeStyles(DEFAULT_TEXT_STYLE, lastSegment.style);
      }

      styles.push(actualStyle);
    }

    richText.fire("textStyleChange", { styles }, true);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let keyboardCompositionStartHandlerRef: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let keyboardCompositionEndHandlerRef: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let keyboardHandlerRef: any = null;
  stage.on("editingMode:change", () => {
    const pointerPos = stage.getPointerPosition();

    const editingMode = stage.getAttr("editingMode");
    const cursorNode = richText.findOne(".cursor") as Konva.Line | undefined;
    const backgroundNode = richText.findOne(".background") as
      | Konva.Rect
      | undefined;
    if (cursorNode && backgroundNode && editingMode === "text") {
      richText.draggable(false);
      cursorNode.visible(true);
      backgroundNode.setAttrs({
        strokeWidth: 1,
      });

      if (
        keyboardHandlerRef &&
        keyboardCompositionStartHandlerRef &&
        keyboardCompositionEndHandlerRef
      ) {
        document.removeEventListener("keydown", keyboardHandlerRef);
        document.removeEventListener(
          "compositionstart",
          keyboardCompositionStartHandlerRef
        );
        document.removeEventListener(
          "compositionend",
          keyboardCompositionEndHandlerRef
        );
      }

      createTextarea();

      document.body.style.cursor = "text";
      keyboardHandlerRef = keyboardHandler(stage, richText);
      keyboardCompositionStartHandlerRef = compositionStartHandler();
      keyboardCompositionEndHandlerRef = compositionEndHandler(richText);
      document.addEventListener("keydown", keyboardHandlerRef);
      document.addEventListener(
        "compositionstart",
        keyboardCompositionStartHandlerRef
      );
      document.addEventListener(
        "compositionend",
        keyboardCompositionEndHandlerRef
      );

      initCursor(richText);

      startCursorBlinkWithDelay(cursorNode);

      if (pointerPos) {
        const transform = richText.getAbsoluteTransform().copy().invert();
        const pointerRealRelPos = transform.point(pointerPos);

        const actualLineColumn = getLineColumnFromPointerPosition(
          richText,
          {
            x: pointerRealRelPos.x,
            y: pointerRealRelPos.y,
          },
          false
        );

        moveCursorToLineColumn(richText, actualLineColumn);

        setSelectionStartChange(richText, actualLineColumn);
        setSelectionEndChange(richText, undefined);

        fireCursorChangeEvent(richText);
      }

      richText.fire("text:change", { model: richText.getAttr("model") }, true);
      return;
    }
    if (cursorNode && backgroundNode && editingMode !== "text") {
      richText.draggable(true);
      cursorNode.visible(false);
      backgroundNode.setAttrs({
        strokeWidth: 0,
      });

      destroyTextarea();

      destroyCursor();

      richText.setAttr("cursorPosition", undefined);
      setSelectionStartChange(richText, undefined);
      setSelectionEndChange(richText, undefined);
    }

    document.removeEventListener("keydown", keyboardHandlerRef);
  });

  richText.on("pointerover", (e) => {
    const editingMode = stage.getAttr("editingMode");

    if (editingMode === "text") {
      document.body.style.cursor = "text";
      e.cancelBubble = true;
    } else {
      document.body.style.cursor = "pointer";
      e.cancelBubble = true;
    }
  });

  richText.on("pointerdblclick", () => {
    stage.setAttr("editingMode", "text");
    stage.fire("editingMode:change");
  });

  let dragging = false;
  let dragged = false;
  let originalLineColumn: LineColumn | null = null;

  richText.on("pointermove", (e) => {
    const node = getNode(e.target);

    if (node && node.getAttr("nodeType") === "text") {
      const isEditing = stage.getAttr("editingMode") === "text";
      document.body.style.cursor = isEditing
        ? "text"
        : document.body.style.cursor;
    }
  });

  richText.on("pointerup", (e) => {
    dragging = false;

    const isShiftPressed = e.evt.shiftKey;

    if (!dragged) {
      richText.setAttr("isSelecting", false);
    }

    const node = getNode(e.target);
    const editingMode = stage.getAttr("editingMode");

    if (node && node.getAttr("nodeType") === "text") {
      const pointerPos = stage.getPointerPosition();

      if (editingMode === "text") {
        setTimeout(() => {
          focusTextarea();
        }, 0);
      }

      const cursorNode = (node as Konva.Group).findOne(".cursor") as
        | Konva.Line
        | undefined;

      stopCursorBlink();

      const isEditing = stage.getAttr("editingMode") === "text";
      if (pointerPos && isEditing && cursorNode) {
        const transform = richText.getAbsoluteTransform().copy().invert();
        const pointerRealRelPos = transform.point(pointerPos);

        const actualLineColumn = getLineColumnFromPointerPosition(
          richText,
          {
            x: pointerRealRelPos.x,
            y: pointerRealRelPos.y,
          },
          isShiftPressed
        );

        moveCursorToLineColumn(richText, actualLineColumn);

        startCursorBlinkWithDelay(cursorNode);

        if (dragged) {
          richText.setAttr("isSelecting", true);
          if (originalLineColumn) {
            setSelectionStartChange(richText, originalLineColumn);
          }
          setSelectionEndChange(richText, actualLineColumn);
        }
        if (!dragged && e.evt.shiftKey) {
          setSelectionEndChange(richText, actualLineColumn);
        }
        if (!dragged && !e.evt.shiftKey) {
          richText.setAttr("isSelecting", false);
          setSelectionStartChange(richText, actualLineColumn);
          setSelectionEndChange(richText, undefined);
        }

        fireCursorChangeEvent(richText);
      }
    }

    originalLineColumn = null;
    dragged = false;
  });

  stage.on("pointermove", (e) => {
    if (!dragging) return;

    const isShiftPressed = e.evt.shiftKey;

    dragged = true;

    const node = getNode(e.target);

    const editingMode = stage.getAttr("editingMode");

    if (node && node.getAttr("nodeType") === "text") {
      const pointerPos = stage.getPointerPosition();

      if (editingMode === "text") {
        setTimeout(() => {
          focusTextarea();
        }, 0);
      }

      const cursorNode = (node as Konva.Group).findOne(".cursor") as
        | Konva.Line
        | undefined;

      stopCursorBlink();

      const isEditing = stage.getAttr("editingMode") === "text";
      if (pointerPos && isEditing && cursorNode) {
        const transform = richText.getAbsoluteTransform().copy().invert();
        const pointerRealRelPos = transform.point(pointerPos);

        const actualLineColumn = getLineColumnFromPointerPosition(
          richText,
          {
            x: pointerRealRelPos.x,
            y: pointerRealRelPos.y,
          },
          isShiftPressed
        );

        moveCursorToLineColumn(richText, actualLineColumn);

        startCursorBlinkWithDelay(cursorNode);

        richText.setAttr("isSelecting", true);
        if (dragged && originalLineColumn) {
          setSelectionStartChange(richText, originalLineColumn);
        }
        setSelectionEndChange(richText, actualLineColumn);
      }
    }
  });

  richText.on("pointerdown", (e) => {
    const node = getNode(e.target);

    const isShiftPressed = e.evt.shiftKey;

    if (node && node.getAttr("nodeType") === "text") {
      const pointerPos = stage.getPointerPosition();

      dragging = true;
      dragged = false;

      const isEditing = stage.getAttr("editingMode") === "text";
      if (pointerPos && isEditing) {
        const transform = richText.getAbsoluteTransform().copy().invert();
        const pointerRealRelPos = transform.point(pointerPos);

        originalLineColumn = getLineColumnFromPointerPosition(
          richText,
          {
            x: pointerRealRelPos.x,
            y: pointerRealRelPos.y,
          },
          isShiftPressed
        );
      }
    }
  });

  richText.setAttr("maxWidth", maxWidth);
  richText.setAttr("renderModel", renderModel);
  richText.setAttr("model", initialModel);

  updateBackground(richText);

  return richText;
};

export const updateBackground = (instance: Konva.Group) => {
  updateBoundsRect(instance);

  const background = instance.findOne(".background") as Konva.Rect | undefined;
  const cursorNode = instance.findOne(".cursor") as Konva.Line | undefined;
  const boundsNode = instance.findOne(".bounds") as Konva.Rect | undefined;

  if (background && cursorNode && boundsNode) {
    const boundsClone = boundsNode.clone();
    boundsNode.destroy();

    background.visible(false);
    cursorNode.visible(false);

    const rect = instance.getClientRect();

    if (rect.height === 0) {
      background.setAttr("strokeWidth", 0);
    } else {
      background.setAttr("strokeWidth", 1);
    }

    background.width(rect.width + 2);
    background.height(rect.height + 2);

    background.visible(true);
    cursorNode.visible(true);

    instance.add(boundsClone);
    boundsClone.moveToBottom();
  }
};
