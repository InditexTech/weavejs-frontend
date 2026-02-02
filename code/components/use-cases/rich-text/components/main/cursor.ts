import Konva from "konva";
import { LineColumn, MoveCursorAction, RichTextRenderLine } from "./types";
import { DEFAULT_TEXT_STYLE } from "./constants";
import { measureLineElements } from "./models";
import { updateBackground } from "./render";

let blinkTimeout: number | null = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let isBlinking = false;
let blinkAnim: Konva.Animation | undefined = undefined;

export function stopCursorBlink() {
  if (blinkTimeout) {
    clearTimeout(blinkTimeout);
    blinkTimeout = null;
  }

  blinkAnim?.stop();
  isBlinking = false;
}

export function startCursorBlinkWithDelay(
  caret: Konva.Line,
  delay: number = 600
) {
  stopCursorBlink();

  caret.opacity(1);
  caret.visible(true);

  blinkTimeout = window.setTimeout(() => {
    blinkAnim?.start();
    isBlinking = true;
  }, delay);
}

export const initCursor = (instance: Konva.Group) => {
  const cursor = instance.findOne(".cursor");

  if (!cursor) {
    return;
  }

  blinkAnim = new Konva.Animation((frame) => {
    if (!frame) return;

    // Toggle every ~500ms
    if (Math.floor(frame.time / 500) % 2 === 0) {
      cursor.opacity(1);
    } else {
      cursor.opacity(0);
    }
  });
};

export const destroyCursor = () => {
  stopCursorBlink();
  blinkAnim = undefined;
};

export const moveCursorToLineColumn = (
  instance: Konva.Group,
  lineCol: LineColumn
) => {
  instance.setAttr("cursorPosition", lineCol);
  const renderModel: RichTextRenderLine[] =
    instance.getAttr("renderModel") ?? [];

  instance.fire(
    "textCursorChange",
    {
      line: lineCol.line,
      column: lineCol.column,
    },
    true
  );

  let x = 0;
  let y = 0;
  let lineHeight = DEFAULT_TEXT_STYLE.size;
  for (let i = 0; i < renderModel.length; i++) {
    const actLine = renderModel[i];
    lineHeight = actLine.lineHeight;
    if (i === lineCol.line) {
      let columnIndex = 0;
      const lineSegments = [];
      for (const actSegment of actLine.lineSegments) {
        const segmentText = actSegment.text;

        if (lineCol.column > columnIndex + segmentText.length) {
          columnIndex = columnIndex + actSegment.text.length;
          lineSegments.push(actSegment);
          continue;
        }

        let columnFound = false;
        let tempLineText = "";
        for (let j = -1; j < segmentText.length; j++) {
          const actChar = j === -1 ? "" : segmentText[j];
          tempLineText = `${tempLineText}${actChar}`;
          const size = measureLineElements([
            ...lineSegments,
            { ...actSegment, text: tempLineText },
          ]);

          x = size;

          if (lineCol.column === columnIndex + j + 1) {
            columnFound = true;
            break;
          }
        }

        if (columnFound) {
          break;
        }
      }

      break;
    }

    y = y + actLine.lineHeight;
  }

  const cursorNode = instance.findOne(".cursor") as Konva.Line | undefined;
  if (cursorNode) {
    cursorNode.points([x, y, x, y + lineHeight]);
  }

  fireCursorChangeEvent(instance);
};

export const setCursorAt = (
  instance: Konva.Group,
  newLine: LineColumn,
  move = true
) => {
  const cursor = instance.findOne(".cursor") as Konva.Line | undefined;
  if (!cursor) return;

  instance.setAttr("cursorPosition", newLine);
  if (move) {
    moveCursorToLineColumn(instance, newLine);
    startCursorBlinkWithDelay(cursor);
  }
};

export const getLineColumnFromLineColumn = (
  instance: Konva.Group,
  lineCol: LineColumn,
  amount: number
): LineColumn => {
  const renderModel: RichTextRenderLine[] =
    instance.getAttr("renderModel") ?? [];

  const newLineCol = { ...lineCol };

  // move forward
  if (amount >= 0) {
    let toMove = amount;
    let moving = false;

    // start at current cursor line
    for (let i = lineCol.line; i < renderModel.length; i++) {
      const line = renderModel[i];
      newLineCol.line = i;

      const realTextLength = line.text.length;

      if (!moving && lineCol.column > realTextLength) {
        // adjust column if out of bounds
        const diff = lineCol.column - line.text.length;
        toMove = toMove + diff;
        moving = true;
        continue;
      }
      if (!moving && lineCol.column + toMove > realTextLength) {
        // move to next line
        const diff = line.text.length - lineCol.column;
        toMove -= diff;
        moving = true;
        continue;
      }
      if (!moving && lineCol.column + toMove <= realTextLength) {
        // move within the same line
        newLineCol.column = lineCol.column + toMove;
        toMove -= toMove;
        break;
      }
      if (moving && toMove > realTextLength) {
        // move to next line
        toMove -= line.text.length;
        continue;
      }
      if (moving && toMove <= realTextLength) {
        // move within the same line
        newLineCol.column = toMove;
        toMove -= toMove;
        break;
      }
    }
  }

  // move backwards
  if (amount <= 0) {
    let toMove = -1 * amount;
    let moving = false;

    // start at current cursor line
    for (let i = lineCol.line; i >= 0; i--) {
      const line = renderModel[i];
      newLineCol.line = i;
      if (!moving && lineCol.column - toMove < 0) {
        // move to next line
        const diff = lineCol.column;
        toMove -= diff;
        moving = true;
        continue;
      }
      if (!moving && lineCol.column - toMove >= 0) {
        // move within the same line
        newLineCol.column = lineCol.column - toMove;
        toMove -= toMove;
        break;
      }
      if (moving && toMove > line.text.length) {
        // move to next line
        const diff = toMove - line.text.length;
        toMove -= diff;
        continue;
      }
      if (moving && line.text.length - toMove >= 0) {
        // move within the same line
        newLineCol.column = line.text.length - toMove;
        toMove -= toMove;
        break;
      }
    }
  }

  return newLineCol;
};

export const moveCursor = (
  instance: Konva.Group,
  amount: number,
  action: MoveCursorAction = "none"
): void => {
  const cursor = instance.findOne(".cursor") as Konva.Line | undefined;
  if (!cursor) return;

  const lineCol = instance.getAttr("cursorPosition") ?? { line: 0, column: 0 };

  switch (action) {
    case "add-line": {
      const newLineCol: LineColumn = {
        line: lineCol.line + 1,
        column: 0,
      };
      moveCursorToLineColumn(instance, newLineCol);
      startCursorBlinkWithDelay(cursor);
      updateBackground(instance);
      return;
    }
    case "delete-line": {
      const line = lineCol.line > 0 ? lineCol.line - 1 : lineCol.line;
      const column = amount;
      const newLineCol: LineColumn = {
        line,
        column,
      };
      moveCursorToLineColumn(instance, newLineCol);
      startCursorBlinkWithDelay(cursor);
      updateBackground(instance);
      return;
    }
    default:
      break;
  }

  const newLineCol: LineColumn = getLineColumnFromLineColumn(
    instance,
    lineCol,
    amount
  );

  moveCursorToLineColumn(instance, newLineCol);
  startCursorBlinkWithDelay(cursor);
};

export const fireCursorChangeEvent = (instance: Konva.Group) => {
  const lineCol = instance.getAttr("cursorPosition") ?? { line: 0, column: 0 };
  instance.fire("onPositionChange", { lineCol }, false);
};
