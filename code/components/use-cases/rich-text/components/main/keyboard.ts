import Konva from "konva";
import {
  LineColumn,
  MoveCursorAction,
  RichTextRenderLine,
  TextLimits,
  TextSegment,
  TextStyle,
} from "./types";
import {
  fireCursorChangeEvent,
  moveCursor,
  moveCursorToLineColumn,
  setCursorAt,
  startCursorBlinkWithDelay,
} from "./cursor";
import {
  amountOfCharsBetween,
  setSelectionEndChange,
  setSelectionStartChange,
} from "./selection";
import { generateRenderModel, renderInternalModelToModel } from "./models";
import { renderTextModel } from "./render";
import { DEFAULT_TEXT_STYLE } from "./constants";
import { isEqual } from "lodash";
import { mergeStyles } from "./styles";

let composing = false;

export const compositionStartHandler = () => () => {
  composing = true;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const compositionEndHandler = (instance: Konva.Group) => (e: any) => {
  composing = false;

  const isMetaPressed = e.metaKey || e.ctrlKey;
  const isShiftPressed = e.shiftKey;

  if (e?.data.length === 1) {
    handleKeyPressed(instance, e?.data ?? "", isMetaPressed, isShiftPressed);
  }
};

export const keyboardHandler =
  (stage: Konva.Stage, instance: Konva.Group) => (e: KeyboardEvent) => {
    const isMetaPressed = e.metaKey || e.ctrlKey;
    const isShiftPressed = e.shiftKey;

    const isEditing = stage.getAttr("editingMode") === "text";

    if (composing) {
      return;
    }

    if (isEditing) {
      // e.preventDefault();

      const cursor = instance.findOne(".cursor") as Konva.Line | undefined;
      if (cursor) {
        cursor.moveToTop();
      }

      if (e.key === "ArrowUp" && cursor) {
        handleArrowUp(e, instance);
      } else if (e.key === "ArrowLeft" && cursor) {
        handleArrowLeft(e, instance);
      } else if (e.key === "ArrowRight" && cursor) {
        handleArrowRight(e, instance);
      } else if (e.key === "ArrowDown" && cursor) {
        handleArrowDown(e, instance);
      } else if (cursor) {
        startCursorBlinkWithDelay(cursor);

        handleKeyPressed(instance, e.key, isMetaPressed, isShiftPressed);
      }
    }
  };

export const handleAddText = (
  instance: Konva.Group,
  from: LineColumn,
  to: LineColumn | undefined,
  text: string,
) => {
  const model = instance.getAttr("model") ?? [];
  const renderModel: RichTextRenderLine[] =
    instance.getAttr("renderModel") ?? [];

  if (to === undefined) {
    const modifiedRenderModel: RichTextRenderLine[] = [...renderModel];
    const actualLine = modifiedRenderModel[from.line];

    const prevLines = modifiedRenderModel.length;

    let prevChar = "";
    if (from.line > 0 && from.column === 0) {
      const previousLine = renderModel[from.line - 1];
      let columnIndex = 0;
      for (let i = 0; i < previousLine.lineSegments.length; i++) {
        const segment = previousLine.lineSegments[i];
        columnIndex += segment.text.length;
      }
      prevChar = previousLine.lineSegments
        .map((l) => l.text)
        .join("")
        .charAt(columnIndex - 1);

      if (previousLine.splitted && prevChar === "\n") {
        prevChar = "";
      }
    } else {
      const actualLine = renderModel[from.line];
      let columnIndex = 0;
      for (let i = 0; i < actualLine.lineSegments.length; i++) {
        const segment = actualLine.lineSegments[i];
        if (
          from.column >= columnIndex &&
          from.column <= columnIndex + segment.text.length
        ) {
          prevChar = segment.text.charAt(from.column - columnIndex - 1);
        }
        columnIndex += segment.text.length;
      }
    }

    if (!actualLine) {
      modifiedRenderModel.push({
        elementIndex: 0,
        text: text,
        lineHeight: 0,
        lineBaseline: 0,
        lineSegments: [
          {
            modelElementIndex: -1,
            text: text,
            x: 0,
            y: 0,
            style: DEFAULT_TEXT_STYLE,
          },
        ],
        splitted: false,
      });
    } else {
      let columnIndex = 0;
      for (let i = 0; i < actualLine.lineSegments.length; i++) {
        const segment = actualLine.lineSegments[i];
        if (from.column > columnIndex + segment.text.length) {
          columnIndex += segment.text.length;
          continue;
        }

        const updateStyle = instance.getAttr("stylesUpdate") as
          | Partial<TextStyle>
          | undefined;
        let newStyle: TextStyle = { ...segment.style };
        if (updateStyle) {
          newStyle = mergeStyles(newStyle, updateStyle);
        }

        if (
          isEqual(newStyle, segment.style) ||
          (!isEqual(newStyle, segment.style) && text === "\n")
        ) {
          // is same style
          modifiedRenderModel[from.line].lineSegments[i].text =
            modifiedRenderModel[from.line].lineSegments[i].text.slice(
              0,
              from.column - columnIndex,
            ) +
            text +
            modifiedRenderModel[from.line].lineSegments[i].text.slice(
              from.column - columnIndex,
            );

          instance.setAttr("stylesUpdate", undefined);

          break;
        } else {
          // different style
          const actualSegment = {
            ...modifiedRenderModel[from.line].lineSegments[i],
          };

          modifiedRenderModel[from.line].lineSegments[i].text =
            actualSegment.text.slice(0, from.column - columnIndex);

          const newSegment = {
            modelElementIndex: -1,
            text: text,
            x: 0,
            y: 0,
            style: newStyle,
          };

          const lastSegment = {
            modelElementIndex: -1,
            text: actualSegment.text.slice(from.column - columnIndex),
            x: 0,
            y: 0,
            style: segment.style,
          };

          let newLineSegments: TextSegment[] = [];
          if (
            newSegment.text === lastSegment.text &&
            lastSegment.text === "\n"
          ) {
            newLineSegments = [
              ...modifiedRenderModel[from.line].lineSegments.slice(0, i + 1),
              newSegment,
              ...modifiedRenderModel[from.line].lineSegments.slice(i + 1),
            ];
          } else {
            newLineSegments = [
              ...modifiedRenderModel[from.line].lineSegments.slice(0, i + 1),
              newSegment,
              lastSegment,
              ...modifiedRenderModel[from.line].lineSegments.slice(i + 1),
            ];
          }

          modifiedRenderModel[from.line].lineSegments = newLineSegments;

          instance.setAttr("stylesUpdate", undefined);

          break;
        }
      }

      if (
        text === "\n" &&
        from.line === modifiedRenderModel.length - 1 &&
        from.column ===
          modifiedRenderModel[modifiedRenderModel.length - 1].text.length
      ) {
        const lastSegment =
          modifiedRenderModel[modifiedRenderModel.length - 1].lineSegments[
            modifiedRenderModel[modifiedRenderModel.length - 1].lineSegments
              .length - 1
          ];

        const updateStyle = instance.getAttr("stylesUpdate") as
          | Partial<TextStyle>
          | undefined;
        let newStyle: TextStyle = { ...lastSegment.style };
        if (updateStyle) {
          newStyle = mergeStyles(newStyle, updateStyle);
        }

        modifiedRenderModel.push({
          elementIndex: model.length,
          text: "\n",
          lineHeight: 0,
          lineBaseline: 0,
          lineSegments: [
            {
              modelElementIndex: -1,
              text: "\n",
              x: 0,
              y: 0,
              style: newStyle,
            },
          ],
          splitted: false,
        });

        instance.setAttr("stylesUpdate", undefined);
      }
    }

    let firstNonSplittedLineIndex = from.line;

    for (let i = from.line; i >= 0; i--) {
      const line = renderModel[i];
      if (
        (i === 0 && !line.splitted) ||
        (i > 0 && !line.splitted && !renderModel[i - 1].splitted) ||
        (i > 0 && line.splitted && renderModel[i - 1].splitted === false)
      ) {
        firstNonSplittedLineIndex = i;
        break;
      }
    }

    const amountOfCharsFromFirstLine = amountOfCharsBetween(
      instance,
      { line: firstNonSplittedLineIndex, column: 0 },
      from,
      true,
    );

    renderModifiedTextModel(instance, [...modifiedRenderModel]);

    const newModel = instance.getAttr("renderModel") ?? [];
    const newLines = newModel.length;

    let moveAmount =
      amountOfCharsFromFirstLine +
      text.length +
      (newLines > prevLines ? newLines - prevLines - 1 : 0);
    let action: MoveCursorAction = "none";
    if (text === "\n" && from.line === 0 && from.column === 0) {
      action = "add-line";
      moveAmount = 0;
    }
    if (text === "\n" && prevChar === "\n") {
      action = "add-line";
      moveAmount = 0;
    }
    if (text === "\n" && from.column > 0) {
      action = "add-line";
      moveAmount = 0;
    }
    if (["add-line"].includes(action) && text === "\n" && prevChar !== "\n") {
      moveAmount = 0;
    }
    if (["none"].includes(action) && text === "\n" && prevChar !== "\n") {
      moveAmount = amountOfCharsFromFirstLine;
    }

    setSelectionStartChange(instance, from);
    setSelectionEndChange(instance, undefined);

    const prevCursor = instance.getAttr("cursorPosition");

    instance.setAttr("cursorPosition", {
      line: ["add-line"].includes(action)
        ? from.line
        : firstNonSplittedLineIndex,
      column: 0,
    });

    moveCursor(instance, moveAmount, action);

    const actualCursor = instance.getAttr("cursorPosition");

    if (prevCursor.line !== actualCursor.line && text !== "\n") {
      moveCursor(instance, 1);
    }
  } else {
    const {
      startSegmentIndex,
      startSegmentOffset,
      endSegmentIndex,
      endSegmentOffset,
    } = foundStartEndSegments(renderModel, from, to);

    const selectionLines = to.line - from.line;
    const prevLines = renderModel.length;

    const modifiedRenderModel = updateRenderModel(renderModel, from, to, text, {
      startSegmentIndex,
      startSegmentOffset,
      endSegmentIndex,
      endSegmentOffset,
    });

    renderModifiedTextModel(instance, modifiedRenderModel);

    const newModel = instance.getAttr("renderModel") ?? [];
    const newLines = newModel.length;

    setCursorAt(instance, from, false);
    setSelectionStartChange(instance, undefined);
    setSelectionEndChange(instance, undefined);

    const moveAmount =
      text.length +
      (newLines > prevLines ? newLines - prevLines + selectionLines : 0);
    moveCursor(instance, moveAmount, "none");
  }

  const actualCursor = instance.getAttr("cursorPosition");
  setSelectionStartChange(instance, actualCursor);

  instance.fire("text:change", { model: instance.getAttr("model") }, true);
};

const handleDeleteText = (
  instance: Konva.Group,
  from: LineColumn,
  to: LineColumn | undefined,
) => {
  const renderModel: RichTextRenderLine[] =
    instance.getAttr("renderModel") ?? [];

  const prevModelLines = renderModel.length;

  const originalFrom = { ...from };

  const originalLine = renderModel[originalFrom.line];

  let realFrom: LineColumn = from;
  let realTo: LineColumn = to ?? { line: 0, column: 0 };

  if (to === undefined) {
    // No previous chars to remove
    if (from.line === 0 && from.column === 0) {
      return;
    }
    if (from.line > 0 && from.column === 0) {
      // Not on first line and cursor at line start
      const previousLine = renderModel[from.line - 1];
      if (previousLine.splitted) {
        realFrom = {
          line: from.line - 1,
          column: previousLine.text.length - 2,
        };
        realTo = {
          line: from.line - 1,
          column: previousLine.text.length - 1,
        };
      } else {
        realFrom = {
          line: from.line - 1,
          column: previousLine.text.length - 1,
        };
        realTo = {
          line: from.line - 1,
          column: previousLine.text.length,
        };
      }
    }
    if (
      from.column > 0 &&
      from.column <= renderModel[from.line].text.length - 1
    ) {
      // Not on first line and cursor not at line start or end
      realFrom = { line: from.line, column: from.column - 1 };
      realTo = { line: from.line, column: from.column };
    }
    if (
      from.line <= renderModel.length - 1 &&
      from.column > 0 &&
      from.column === renderModel[from.line].text.length
    ) {
      // Not on first line and cursor at line end
      realFrom = {
        line: from.line,
        column: renderModel[from.line].text.length - 1,
      };
      realTo = {
        line: from.line,
        column: renderModel[from.line].text.length,
      };
    }
    if (realTo === undefined) {
      realTo = { ...from, column: from.column };
      realFrom = { ...from, column: from.column - 1 };
    }
  }

  let firstNonSplittedLineIndex = realFrom.line;

  for (let i = realFrom.line; i >= 0; i--) {
    const line = renderModel[i];
    if (
      (i === 0 && !line.splitted) ||
      (i > 0 && !line.splitted && !renderModel[i - 1].splitted) ||
      (i > 0 && line.splitted && renderModel[i - 1].splitted === false)
    ) {
      firstNonSplittedLineIndex = i;
      break;
    }
  }

  const amountOfCharsFromFirstLine = amountOfCharsBetween(
    instance,
    { line: firstNonSplittedLineIndex, column: 0 },
    originalFrom,
    true,
  );

  const {
    startSegmentIndex,
    startSegmentOffset,
    endSegmentIndex,
    endSegmentOffset,
  } = foundStartEndSegments(renderModel, realFrom, realTo);

  const moveAmount = amountOfCharsFromFirstLine - (to === undefined ? 1 : 0);

  const prevLine = renderModel[realFrom.line];

  let modifiedRenderModel = updateRenderModel(
    renderModel,
    realFrom,
    realTo,
    "",
    {
      startSegmentIndex,
      startSegmentOffset,
      endSegmentIndex,
      endSegmentOffset,
    },
  );

  renderModifiedTextModel(instance, modifiedRenderModel);

  modifiedRenderModel = instance.getAttr("renderModel") ?? [];

  setSelectionStartChange(instance, realFrom);
  setSelectionEndChange(instance, undefined);

  const prevCursor = instance.getAttr("cursorPosition");

  instance.setAttr("cursorPosition", {
    line: firstNonSplittedLineIndex,
    column: 0,
  });
  moveCursor(instance, moveAmount);

  let actualCursor = instance.getAttr("cursorPosition");

  const actualLine = modifiedRenderModel[actualCursor.line];

  if (
    renderModel.length === modifiedRenderModel.length &&
    actualCursor.line < originalFrom.line &&
    prevLine.splitted
  ) {
    moveCursor(instance, -1);
  }
  if (
    renderModel.length === modifiedRenderModel.length &&
    actualCursor.line > originalFrom.line &&
    prevLine.splitted
  ) {
    moveCursor(instance, 1);
  }

  actualCursor = instance.getAttr("cursorPosition");

  if (
    prevCursor.line !== actualCursor.line &&
    actualCursor.column === actualLine.text.length - 1 &&
    originalLine.text !== "\n"
  ) {
    moveCursor(instance, 1);
  }

  if (
    prevModelLines > modifiedRenderModel.length &&
    actualCursor.column === 0 &&
    prevCursor.column !== actualCursor.column
  ) {
    moveCursor(instance, -1);
  }

  instance.fire("text:change", { model: instance.getAttr("model") }, true);
};

export const normalizeLineColumn = (
  from: LineColumn,
  to: LineColumn | undefined,
) => {
  let orientation = "forward";
  let realFrom = { ...from };
  let realTo = to ? { ...to } : undefined;

  if (to !== undefined) {
    if (to.line < from.line) {
      orientation = "backward";
      realFrom = { ...to };
      realTo = { ...from };
    } else if (to.line === from.line && to.column < from.column) {
      orientation = "backward";
      realFrom = { ...to };
      realTo = { ...from };
    }
  }

  return { from: realFrom, to: realTo, orientation };
};

export const handleKeyPressed = (
  instance: Konva.Group,
  key: string,
  isMetaPressed: boolean,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isShiftPressed: boolean,
) => {
  const renderModel: RichTextRenderLine[] =
    instance.getAttr("renderModel") ?? [];
  const selectionStart = instance.getAttr("selectionStart");
  const selectionEnd = instance.getAttr("selectionEnd");
  const lineCol = instance.getAttr("cursorPosition") ?? {
    line: 0,
    column: 0,
  };

  let from: LineColumn = { ...lineCol };
  let to: LineColumn | undefined = undefined;
  if (selectionStart !== undefined && selectionEnd !== undefined) {
    from = { ...selectionStart };
    to = { ...selectionEnd };
  }

  switch (key) {
    case "Backspace": {
      // Delete previous character
      const { from: realFrom, to: realTo } = normalizeLineColumn(from, to);
      handleDeleteText(instance, realFrom, realTo);
      break;
    }
    case "Enter": {
      // Insert newline
      const { from: realFrom, to: realTo } = normalizeLineColumn(from, to);
      handleAddText(instance, realFrom, realTo, "\n");
      break;
    }
    default:
      break;
  }

  if (isMetaPressed && key.length === 1) {
    switch (key) {
      case "a": {
        // Select all
        if (renderModel.length === 0) {
          break;
        }

        const startLineCol = { line: 0, column: 0 };
        const renderModelLine = renderModel[renderModel.length - 1];

        let columnIndex = 0;
        for (let i = 0; i < renderModelLine.lineSegments.length; i++) {
          const segment = renderModelLine.lineSegments[i];
          columnIndex += segment.text.length;
        }

        const endLineCol = {
          line: renderModel.length - 1,
          column: columnIndex,
        };

        setCursorAt(instance, endLineCol);
        setSelectionStartChange(instance, startLineCol);
        setSelectionEndChange(instance, endLineCol);
        break;
      }
      default:
        break;
    }

    return;
  }

  if (!isMetaPressed && key.length === 1) {
    // Insert character
    const { from: realFrom, to: realTo } = normalizeLineColumn(from, to);
    handleAddText(instance, realFrom, realTo, `${key}`);
  }
};

const foundStartEndSegments = (
  renderModel: RichTextRenderLine[],
  from: LineColumn,
  to: LineColumn,
) => {
  let foundFrom = false;
  let foundTo = false;

  let startSegmentIndex = -1;
  let startSegmentOffset = -1;
  let endSegmentIndex = -1;
  let endSegmentOffset = -1;

  for (let i = from.line; i <= to.line; i++) {
    const line = renderModel[i];

    let columnIndex = 0;
    for (let j = 0; j < line.lineSegments.length; j++) {
      const segment = line.lineSegments[j];
      if (
        !foundFrom &&
        i === from.line &&
        from.column < columnIndex + segment.text.length
      ) {
        foundFrom = true;
        startSegmentIndex = j;
        startSegmentOffset = from.column - columnIndex;
      }
      if (
        foundFrom &&
        !foundTo &&
        i === to.line &&
        to.column <= columnIndex + segment.text.length
      ) {
        foundTo = true;
        endSegmentIndex = j;
        endSegmentOffset = to.column - columnIndex;
        break;
      }

      columnIndex = columnIndex + segment.text.length;
    }
  }

  return {
    startSegmentIndex,
    startSegmentOffset,
    endSegmentIndex,
    endSegmentOffset,
  };
};

const updateRenderModel = (
  renderModel: RichTextRenderLine[],
  from: LineColumn,
  to: LineColumn,
  text: string,
  segments: {
    startSegmentIndex: number;
    startSegmentOffset: number;
    endSegmentIndex: number;
    endSegmentOffset: number;
  },
) => {
  const {
    startSegmentIndex,
    startSegmentOffset,
    endSegmentIndex,
    endSegmentOffset,
  } = segments;

  let modifiedRenderModel: RichTextRenderLine[] = [
    ...renderModel.slice(0, from.line),
  ];

  const startLine = from.line;
  const endLine = to.line;

  if (startSegmentIndex === -1 && text === "") {
    const nextLine = renderModel[from.line + 1];
    if (nextLine.text === "" && from.line + 1 == renderModel.length - 1) {
      modifiedRenderModel = [...renderModel.slice(0, from.line + 1)];
    } else {
      modifiedRenderModel = [
        ...renderModel.slice(0, from.line + 1),
        ...renderModel.slice(from.line + 2),
      ];
    }
    modifiedRenderModel[modifiedRenderModel.length - 1].lineSegments[
      modifiedRenderModel[modifiedRenderModel.length - 1].lineSegments.length -
        1
    ].text = modifiedRenderModel[modifiedRenderModel.length - 1].lineSegments[
      modifiedRenderModel[modifiedRenderModel.length - 1].lineSegments.length -
        1
    ].text.slice(0, -1);
  } else {
    modifiedRenderModel = [...renderModel.slice(0, from.line)];

    for (let i = from.line; i <= to.line; i++) {
      const line = renderModel[i];

      if (i > from.line && i < to.line) {
        continue;
      }

      const newSegments = [];
      for (let j = 0; j < line.lineSegments.length; j++) {
        if (
          i === startLine &&
          j === startSegmentIndex &&
          i === endLine &&
          j === endSegmentIndex
        ) {
          newSegments.push({
            ...line.lineSegments[j],
            text:
              line.lineSegments[j].text.slice(0, startSegmentOffset) +
              line.lineSegments[j].text.slice(endSegmentOffset),
          });
          continue;
        } else if (i === startLine && j === startSegmentIndex) {
          newSegments.push({
            ...line.lineSegments[j],
            text: line.lineSegments[j].text.slice(0, startSegmentOffset),
          });
          continue;
        } else if (i === endLine && j === endSegmentIndex) {
          newSegments.push({
            ...line.lineSegments[j],
            text: line.lineSegments[j].text.slice(endSegmentOffset),
          });
          continue;
        } else if (j < startSegmentIndex && i === startLine) {
          newSegments.push(line.lineSegments[j]);
          continue;
        } else if (j > endSegmentIndex && i === endLine) {
          newSegments.push(line.lineSegments[j]);
        }
      }

      const newLine: RichTextRenderLine = { ...renderModel[i] };
      newLine.lineSegments = newSegments;

      if (i === from.line && text !== "") {
        newLine.lineSegments[startSegmentIndex].text =
          newLine.lineSegments[startSegmentIndex].text.slice(
            0,
            startSegmentOffset,
          ) +
          text +
          newLine.lineSegments[startSegmentIndex].text.slice(
            startSegmentOffset,
          );

        modifiedRenderModel.push(newLine);
      } else {
        modifiedRenderModel.push(newLine);
      }
    }

    modifiedRenderModel = [
      ...modifiedRenderModel,
      ...renderModel.slice(to.line + 1),
    ];
  }

  const realText = modifiedRenderModel
    .map((line) => line.lineSegments.map((seg) => seg.text).join(""))
    .join("\n");

  if (realText.trim() === "") {
    modifiedRenderModel = [];
  }

  return modifiedRenderModel;
};

export const renderModifiedTextModel = (
  instance: Konva.Group,
  renderModel: RichTextRenderLine[],
) => {
  const layout = instance.getAttr("layout");
  const limits: TextLimits = instance.getAttr("limits");

  if (layout === "fixed") {
    instance.setAttr("width", limits.width + 4);
    instance.setAttr("height", limits.height + 4);
    instance.setAttr("clip", {
      x: -2,
      y: -2,
      width: limits.width + 4,
      height: limits.height + 4,
    });
  } else {
    instance.setAttr("width", undefined);
    instance.setAttr("height", undefined);
    instance.setAttr("clip", undefined);
  }

  const newModel = renderInternalModelToModel(renderModel);
  instance.setAttr("model", newModel);
  const newRenderModel: RichTextRenderLine[] = generateRenderModel(
    { x: instance.x(), y: instance.y() },
    limits,
    newModel,
  );
  instance.setAttr("renderModel", newRenderModel);
  renderTextModel(instance, newRenderModel);
};

const handleArrowUp = (e: KeyboardEvent, instance: Konva.Group) => {
  const isMetaPressed = e.metaKey || e.ctrlKey;
  const isShiftPressed = e.shiftKey;

  const cursor = instance.findOne(".cursor") as Konva.Line | undefined;

  if (!cursor) {
    return;
  }

  const renderModel = instance.getAttr("renderModel") ?? [];
  let lineCol = instance.getAttr("cursorPosition") ?? {
    line: 0,
    column: 0,
  };

  const originalLineCol = { ...lineCol };

  if (lineCol.line - 1 >= 0) {
    lineCol.line = lineCol.line - 1;
  } else if (lineCol.line === 0) {
    lineCol.column = 0;
  }

  const newLine = renderModel[lineCol.line];
  if (lineCol.column > newLine.text.length) {
    if (
      !isShiftPressed &&
      newLine.text.length > 0 &&
      newLine.text.endsWith("\n")
    ) {
      lineCol.column = newLine.text.length - 1;
    } else if (
      isShiftPressed &&
      newLine.text.length > 0 &&
      newLine.text.endsWith("\n")
    ) {
      lineCol.column = newLine.text.length;
    } else {
      lineCol.column = 0;
    }
  }

  if (isMetaPressed) {
    lineCol = { line: 0, column: 0 };
  }

  moveCursorToLineColumn(instance, lineCol);
  startCursorBlinkWithDelay(cursor);

  if (isShiftPressed) {
    if (!instance.getAttr("isSelecting")) {
      setSelectionStartChange(instance, originalLineCol);
    }
    setSelectionEndChange(instance, lineCol);
    instance.setAttr("isSelecting", true);
  }
  if (!isShiftPressed) {
    instance.setAttr("isSelecting", true);
    setSelectionStartChange(instance, lineCol);
    setSelectionEndChange(instance, undefined);
  }

  fireCursorChangeEvent(instance);
};

const handleArrowDown = (e: KeyboardEvent, instance: Konva.Group) => {
  const isMetaPressed = e.metaKey || e.ctrlKey;
  const isShiftPressed = e.shiftKey;

  const cursor = instance.findOne(".cursor") as Konva.Line | undefined;

  if (!cursor) {
    return;
  }

  const renderModel = instance.getAttr("renderModel") ?? [];
  let lineCol = instance.getAttr("cursorPosition") ?? {
    line: 0,
    column: 0,
  };

  if (lineCol.line + 1 <= renderModel.length - 1) {
    lineCol.line = lineCol.line + 1;
  } else if (lineCol.line === renderModel.length - 1) {
    const actLine = renderModel[lineCol.line];
    if (!isShiftPressed && actLine.text.endsWith("\n")) {
      lineCol.column = actLine.text.length - 1;
    } else {
      lineCol.column = actLine.text.length;
    }
  }

  const newLine = renderModel[lineCol.line];
  if (lineCol.column > newLine.text.length) {
    if (
      !isShiftPressed &&
      newLine.text.length > 0 &&
      newLine.text.endsWith("\n")
    ) {
      lineCol.column = newLine.text.length - 1;
    } else if (
      isShiftPressed &&
      newLine.text.length > 0 &&
      newLine.text.endsWith("\n")
    ) {
      lineCol.column = newLine.text.length;
    } else {
      lineCol.column = 0;
    }
  }

  if (lineCol.column < 0) {
    lineCol.column = 0;
  }

  if (isMetaPressed) {
    let columnIndex = 0;
    for (
      let i = 0;
      i < renderModel[renderModel.length - 1].lineSegments.length;
      i++
    ) {
      const segment = renderModel[renderModel.length - 1].lineSegments[i];
      columnIndex += segment.text.length;
    }

    lineCol = { line: renderModel.length - 1, column: columnIndex };
  }

  moveCursorToLineColumn(instance, lineCol);
  startCursorBlinkWithDelay(cursor);

  if (isShiftPressed) {
    instance.setAttr("isSelecting", true);
    setSelectionEndChange(instance, lineCol);
  }

  if (!isShiftPressed) {
    instance.setAttr("isSelecting", false);
    setSelectionStartChange(instance, lineCol);
    setSelectionEndChange(instance, undefined);
  }

  fireCursorChangeEvent(instance);
};

const handleArrowLeft = (e: KeyboardEvent, instance: Konva.Group) => {
  const isMetaPressed = e.metaKey || e.ctrlKey;
  const isShiftPressed = e.shiftKey;

  const cursor = instance.findOne(".cursor") as Konva.Line | undefined;

  if (!cursor) {
    return;
  }

  const selectionStart = instance.getAttr("selectionStart");
  const selectionEnd = instance.getAttr("selectionEnd");

  if (selectionStart && selectionEnd && !isShiftPressed) {
    const { from } = normalizeLineColumn(selectionStart, selectionEnd);

    moveCursorToLineColumn(instance, from);
    startCursorBlinkWithDelay(cursor);

    setSelectionStartChange(instance, from);
    setSelectionEndChange(instance, undefined);
    return;
  }

  const renderModel = instance.getAttr("renderModel") ?? [];
  let lineCol = instance.getAttr("cursorPosition") ?? {
    line: 0,
    column: 0,
  };

  if (!isMetaPressed) {
    if (lineCol.column === 0) {
      const actLine = lineCol.line;
      if (actLine > 0) {
        lineCol.line = actLine - 1;
        const newLine = renderModel[lineCol.line];
        if (!isShiftPressed && newLine.text.endsWith("\n")) {
          lineCol.column = newLine.text.length - 1;
        } else {
          lineCol.column = newLine.text.length;
        }
      }
      if (actLine === 0) {
        lineCol.column = 0;
      }
    } else {
      lineCol.column = lineCol.column - 1 >= 0 ? lineCol.column - 1 : 0;
    }

    if (lineCol.column < 0) {
      lineCol.column = 0;
    }
  }

  if (isMetaPressed) {
    lineCol = {
      line: lineCol.line,
      column: 0,
    };
  }

  moveCursorToLineColumn(instance, lineCol);
  startCursorBlinkWithDelay(cursor);

  if (isShiftPressed) {
    setSelectionEndChange(instance, lineCol);
    instance.setAttr("isSelecting", true);
  }
  if (!isShiftPressed) {
    instance.setAttr("isSelecting", false);
    setSelectionStartChange(instance, lineCol);
    setSelectionEndChange(instance, undefined);
  }

  fireCursorChangeEvent(instance);
};

const handleArrowRight = (e: KeyboardEvent, instance: Konva.Group) => {
  const isMetaPressed = e.metaKey || e.ctrlKey;
  const isShiftPressed = e.shiftKey;

  const cursor = instance.findOne(".cursor") as Konva.Line | undefined;

  if (!cursor) {
    return;
  }

  const selectionStart = instance.getAttr("selectionStart");
  const selectionEnd = instance.getAttr("selectionEnd");

  if (selectionStart && selectionEnd && !isShiftPressed) {
    const { to } = normalizeLineColumn(selectionStart, selectionEnd);

    moveCursorToLineColumn(instance, to as LineColumn);
    startCursorBlinkWithDelay(cursor);

    setSelectionStartChange(instance, to);
    setSelectionEndChange(instance, undefined);
    return;
  }

  const renderModel = instance.getAttr("renderModel") ?? [];
  let lineCol = instance.getAttr("cursorPosition") ?? {
    line: 0,
    column: 0,
  };

  if (!isMetaPressed) {
    const actLine = renderModel[lineCol.line];

    if (lineCol.column === actLine.text.length) {
      if (lineCol.line < renderModel.length - 1) {
        lineCol.line = lineCol.line + 1;
        lineCol.column = 0;
      } else if (lineCol.line === renderModel.length - 1) {
        lineCol.column = actLine.text.length;
      }
    } else if (
      !isShiftPressed &&
      lineCol.column === actLine.text.length - 1 &&
      actLine.text.endsWith("\n")
    ) {
      if (lineCol.line < renderModel.length - 1) {
        lineCol.line = lineCol.line + 1;
        lineCol.column = 0;
      } else if (lineCol.line === renderModel.length - 1) {
        lineCol.column = actLine.text.length;
      }
    } else {
      lineCol.column =
        lineCol.column + 1 > actLine.text.length
          ? actLine.text.length
          : lineCol.column + 1;
    }

    if (lineCol.column < 0) {
      lineCol.column = 0;
    }
  }

  if (isMetaPressed) {
    let columnIndex = 0;
    for (let i = 0; i < renderModel[lineCol.line].lineSegments.length; i++) {
      const segment = renderModel[lineCol.line].lineSegments[i];
      columnIndex += segment.text.length;
    }

    if (renderModel.length - 1 !== lineCol.line) {
      columnIndex--;
    }

    lineCol = { line: lineCol.line, column: columnIndex };
  }

  moveCursorToLineColumn(instance, lineCol);
  startCursorBlinkWithDelay(cursor);

  if (isShiftPressed) {
    instance.setAttr("isSelecting", true);
    setSelectionEndChange(instance, lineCol);
  }
  if (!isShiftPressed) {
    instance.setAttr("isSelecting", false);
    setSelectionStartChange(instance, lineCol);
    setSelectionEndChange(instance, undefined);
  }

  fireCursorChangeEvent(instance);
};
