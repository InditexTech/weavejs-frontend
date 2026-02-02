import Konva from "konva";
import { RichTextRenderLine, TextStyle } from "./types";
import { normalizeLineColumn, renderModifiedTextModel } from "./keyboard";
import {
  getLineColumnFromLineColumn,
  moveCursorToLineColumn,
  startCursorBlinkWithDelay,
} from "./cursor";
import {
  renderSelection,
  setSelectionEndChange,
  setSelectionStartChange,
} from "./selection";

export const updateStyles = (
  instance: Konva.Group,
  style: Partial<TextStyle>
) => {
  let selectionStart = instance.getAttr("selectionStart");
  let selectionEnd = instance.getAttr("selectionEnd");

  instance.setAttr("stylesUpdate", style);

  if (selectionStart && selectionEnd) {
    const renderModel = instance.getAttr("renderModel") as RichTextRenderLine[];

    const { from, to, orientation } = normalizeLineColumn(
      selectionStart,
      selectionEnd
    );

    selectionStart = from;
    selectionEnd = to;

    let foundStart = false;
    let foundEnd = false;
    let amountOfChars = 0;
    const newLines = [];
    for (let i = selectionStart.line; i <= selectionEnd.line; i++) {
      const line = renderModel[i];

      let columnIndex = 0;
      const newLine = { ...line };
      newLine.lineSegments = [];

      for (let j = 0; j < line.lineSegments.length; j++) {
        const segment = line.lineSegments[j];
        // not on start column yet
        if (
          !foundStart &&
          selectionStart.line === i &&
          selectionStart.column > columnIndex &&
          selectionStart.column > columnIndex + segment.text.length - 1
        ) {
          newLine.lineSegments.push(segment);
        }
        // on start column, without end column
        if (
          !foundStart &&
          selectionStart.line === i &&
          selectionStart.column >= columnIndex &&
          selectionStart.column < columnIndex + segment.text.length &&
          (selectionEnd.line !== i ||
            (selectionEnd.line === i &&
              selectionEnd.column > columnIndex + segment.text.length))
        ) {
          const prevSegment = {
            ...segment,
            text: segment.text.slice(0, selectionStart.column - columnIndex),
          };
          const lastSegment = {
            ...segment,
            style: mergeStyles(segment.style, style),
            text: segment.text.slice(selectionStart.column - columnIndex),
          };

          if (prevSegment.text.length > 0) {
            newLine.lineSegments.push(prevSegment);
          }
          if (lastSegment.text.length > 0) {
            newLine.lineSegments.push(lastSegment);
          }

          amountOfChars +=
            segment.text.length - (selectionStart.column - columnIndex);
          foundStart = true;
        }
        // on start column, with end column
        if (
          !foundStart &&
          selectionStart.line === i &&
          selectionStart.column >= columnIndex &&
          selectionStart.column <= columnIndex + segment.text.length &&
          selectionEnd.line === i &&
          selectionEnd.column >= columnIndex &&
          selectionEnd.column <= columnIndex + segment.text.length
        ) {
          const prevSegment = {
            ...segment,
            text: segment.text.slice(0, selectionStart.column - columnIndex),
          };
          const midSegment = {
            ...segment,
            style: mergeStyles(segment.style, style),
            text: segment.text.slice(
              selectionStart.column - columnIndex,
              selectionEnd.column - columnIndex
            ),
          };
          const lastSegment = {
            ...segment,
            text: segment.text.slice(selectionEnd.column - columnIndex),
          };

          if (prevSegment.text.length > 0) {
            newLine.lineSegments.push(prevSegment);
          }
          if (midSegment.text.length > 0) {
            newLine.lineSegments.push(midSegment);
          }
          if (lastSegment.text.length > 0) {
            newLine.lineSegments.push(lastSegment);
          }

          amountOfChars +=
            selectionEnd.column -
            columnIndex -
            (selectionStart.column - columnIndex);

          foundStart = true;
          foundEnd = true;
        }
        // in intermediate line
        if (
          foundStart &&
          !foundEnd &&
          selectionStart.line < i &&
          selectionEnd.line > i
        ) {
          newLine.lineSegments.push({
            ...segment,
            style: mergeStyles(segment.style, style),
          });
          amountOfChars += segment.text.length;
        }
        // on end column
        if (
          foundStart &&
          !foundEnd &&
          selectionEnd.line === i &&
          selectionEnd.column >= columnIndex &&
          selectionEnd.column <= columnIndex + segment.text.length
        ) {
          const prevSegment = {
            ...segment,
            style: mergeStyles(segment.style, style),
            text: segment.text.slice(0, selectionEnd.column - columnIndex),
          };
          const lastSegment = {
            ...segment,
            text: segment.text.slice(selectionEnd.column - columnIndex),
          };

          if (prevSegment.text.length > 0) {
            newLine.lineSegments.push(prevSegment);
          }
          if (lastSegment.text.length > 0) {
            newLine.lineSegments.push(lastSegment);
          }

          amountOfChars += selectionEnd.column - columnIndex;
          foundEnd = true;
        }
        // on start line, after start column
        if (
          foundStart &&
          !foundEnd &&
          selectionStart.line === i &&
          selectionStart.column < columnIndex &&
          selectionStart.column < columnIndex + segment.text.length
        ) {
          newLine.lineSegments.push({
            ...segment,
            style: mergeStyles(segment.style, style),
          });
          amountOfChars += segment.text.length;
        }
        // before end column
        if (
          foundStart &&
          !foundEnd &&
          selectionStart.line !== i &&
          selectionEnd.line === i &&
          selectionEnd.column > columnIndex &&
          selectionEnd.column > columnIndex + segment.text.length
        ) {
          newLine.lineSegments.push({
            ...segment,
            style: mergeStyles(segment.style, style),
          });
          amountOfChars += segment.text.length;
        }
        // after end column
        if (
          foundStart &&
          foundEnd &&
          selectionEnd.line === i &&
          selectionEnd.column > 0 &&
          selectionEnd.column <= columnIndex &&
          selectionEnd.column < columnIndex + segment.text.length
        ) {
          newLine.lineSegments.push({
            ...segment,
          });
        }
        columnIndex += segment.text.length;
      }

      newLines.push(newLine);
    }

    const originalSelectionLines = selectionEnd.line - selectionStart.line;

    const newRenderModel = [];
    const leftSide = renderModel.slice(0, selectionStart.line);
    if (leftSide.length > 0) {
      newRenderModel.push(...leftSide);
    }
    if (newLines.length > 0) {
      newRenderModel.push(...newLines);
    }
    const rightSide = renderModel.slice(selectionEnd.line + 1);
    if (rightSide.length > 0) {
      newRenderModel.push(...rightSide);
    }

    renderModifiedTextModel(instance, newRenderModel);

    let newSelectionStart = { ...selectionStart };
    let newSelectionEnd = getLineColumnFromLineColumn(
      instance,
      newSelectionStart,
      amountOfChars
    );

    const newSelectionLines = newSelectionEnd.line - newSelectionStart.line;

    if (newSelectionLines !== originalSelectionLines) {
      newSelectionStart = { ...selectionStart };
      newSelectionEnd = getLineColumnFromLineColumn(
        instance,
        newSelectionStart,
        amountOfChars + (newSelectionLines - originalSelectionLines)
      );
    }

    setSelectionStartChange(instance, newSelectionStart);
    setSelectionEndChange(instance, newSelectionEnd);

    renderSelection(instance);

    if (orientation === "forward") {
      moveCursorToLineColumn(instance, newSelectionEnd);
    } else {
      moveCursorToLineColumn(instance, newSelectionStart);
    }

    const cursor = instance.findOne(".cursor") as Konva.Line | undefined;
    if (cursor) {
      startCursorBlinkWithDelay(cursor);
    }

    instance.fire("text:change", { model: instance.getAttr("model") }, true);
  }
};

export const mergeStyles = (
  baseStyles: TextStyle,
  newStyles: Partial<TextStyle>
): TextStyle => {
  const resultStyles = { ...baseStyles };

  if (newStyles.font !== undefined) {
    resultStyles.font = newStyles.font;
  }
  if (newStyles.size !== undefined) {
    resultStyles.size = newStyles.size;
  }
  if (newStyles.style !== undefined) {
    resultStyles.style = newStyles.style;
  }
  if (newStyles.decoration !== undefined) {
    resultStyles.decoration = newStyles.decoration;
  }
  if (newStyles.align !== undefined) {
    resultStyles.align = newStyles.align;
  }
  if (newStyles.color !== undefined) {
    resultStyles.color = newStyles.color;
  }
  if (newStyles.lineHeight !== undefined) {
    resultStyles.lineHeight = newStyles.lineHeight;
  }

  return resultStyles;
};
