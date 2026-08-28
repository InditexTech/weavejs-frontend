import Konva from "konva";
import { measureLineElements } from "./models";
import {
  LineColumn,
  //RichTextModel,
  RichTextRenderLine,
} from "./types";
import { normalizeLineColumn } from "./keyboard";

export const setSelectionStartChange = (
  instance: Konva.Group,
  actualLineColumn: { line: number; column: number } | undefined,
) => {
  const selectionStart = actualLineColumn ? { ...actualLineColumn } : undefined;
  instance.setAttr("selectionStart", selectionStart);

  instance.fire(
    "textSelectionStartChange",
    actualLineColumn
      ? {
          selectionStart,
        }
      : undefined,
    true,
  );
};

export const setSelectionEndChange = (
  instance: Konva.Group,
  actualLineColumn: { line: number; column: number } | undefined,
) => {
  const nodes = instance.find(".selection");
  nodes.forEach((n) => n.destroy());

  const selectionEnd = actualLineColumn ? { ...actualLineColumn } : undefined;
  instance.setAttr("selectionEnd", selectionEnd);

  renderSelection(instance);

  const selectedCharsAmount = amountOfSelectionChars(instance);

  instance.fire(
    "textSelectionEndChange",
    actualLineColumn
      ? {
          selectionEnd,
          selectedCharsAmount,
        }
      : undefined,
    true,
  );
};

export const renderSelection = (instance: Konva.Group) => {
  const renderModel = instance.getAttr("renderModel") ?? [];
  const actSelectionStart = instance.getAttr("selectionStart");
  const actSelectionEnd = instance.getAttr("selectionEnd");

  if (actSelectionStart === undefined || actSelectionEnd === undefined) {
    return;
  }

  // normalize selection start and end
  let selectionStart = actSelectionStart;
  let selectionEnd = actSelectionEnd;
  if (actSelectionEnd.line < actSelectionStart.line) {
    selectionStart = actSelectionEnd;
    selectionEnd = actSelectionStart;
  }
  if (
    actSelectionEnd.line === actSelectionStart.line &&
    selectionEnd.column < selectionStart.column
  ) {
    selectionStart = actSelectionEnd;
    selectionEnd = actSelectionStart;
  }

  if (selectionStart && selectionEnd) {
    let y = 0;
    for (let i = 0; i < selectionStart.line; i++) {
      y += renderModel[i].lineHeight;
    }

    for (let i = selectionStart.line; i <= selectionEnd.line; i++) {
      const actualLine = renderModel[i];

      let startX = 0;
      let endX = 0;
      let setStartX = false;
      let setEndX = false;

      if (i === selectionStart.line && i !== selectionEnd.line) {
        // start line is different than end line, render from start column to line end
        let actualColumn = 0;
        const lineSegments = [];
        for (const segment of actualLine.lineSegments) {
          const segmentText = segment.text;

          if (
            !setStartX &&
            selectionStart.column > actualColumn + segmentText.length
          ) {
            actualColumn += segmentText.length;
            lineSegments.push(segment);
            continue;
          }

          if (!setStartX) {
            startX = measureLineElements([
              ...lineSegments,
              {
                ...segment,
                text: segmentText.slice(
                  0,
                  selectionStart.column - actualColumn,
                ),
              },
            ]);
            setStartX = true;
          }

          if (setStartX) {
            break;
          }
        }

        endX = measureLineElements(actualLine.lineSegments);
        setEndX = true;
      }

      if (i === selectionStart.line && i === selectionEnd.line) {
        // start and end line are the same, render from start column to end column
        let actualColumn = 0;
        const lineSegments = [];
        for (const segment of actualLine.lineSegments) {
          const segmentText = segment.text;

          if (
            !setStartX &&
            selectionStart.column > actualColumn + segmentText.length
          ) {
            actualColumn += segmentText.length;
            lineSegments.push(segment);
            continue;
          }

          if (!setStartX) {
            startX = measureLineElements([
              ...lineSegments,
              {
                ...segment,
                text: segmentText.slice(
                  0,
                  selectionStart.column - actualColumn,
                ),
              },
            ]);
            setStartX = true;
          }

          if (
            setStartX &&
            !setEndX &&
            selectionEnd.column > actualColumn + segmentText.length
          ) {
            actualColumn += segmentText.length;
            lineSegments.push(segment);
            continue;
          }

          if (!setEndX) {
            endX = measureLineElements([
              ...lineSegments,
              {
                ...segment,
                text: segmentText.slice(0, selectionEnd.column - actualColumn),
              },
            ]);
            setEndX = true;
          }

          if (setStartX && setEndX) {
            break;
          }
        }
      }

      if (i !== selectionStart.line && i !== selectionEnd.line) {
        // render from line start to line end, its an intermediate line
        startX = 0;
        setStartX = true;
        endX = measureLineElements(actualLine.lineSegments);
        setEndX = true;
      }

      if (i !== selectionStart.line && i === selectionEnd.line) {
        // end line is different than start line, render from line start to end column
        startX = 0;
        setStartX = true;

        let actualColumn = 0;
        const lineSegments = [];
        for (const segment of actualLine.lineSegments) {
          const segmentText = segment.text;

          if (
            setStartX &&
            !setEndX &&
            selectionEnd.column > actualColumn + segmentText.length
          ) {
            actualColumn += segmentText.length;
            lineSegments.push(segment);
            continue;
          }

          if (!setEndX) {
            endX = measureLineElements([
              ...lineSegments,
              {
                ...segment,
                text: segmentText.slice(0, selectionEnd.column - actualColumn),
              },
            ]);
            setEndX = true;
          }

          if (setEndX) {
            break;
          }
        }
      }

      if (setStartX && setEndX) {
        const selectionRect = new Konva.Rect({
          name: "selection",
          x: startX,
          y: y,
          width: endX - startX,
          height: actualLine.lineHeight,
          fill: "#0D99FF",
          opacity: 0.25,
        });
        instance.add(selectionRect);
      }

      y += renderModel[i].lineHeight;
    }
  }
};

export const amountOfSelectionChars = (instance: Konva.Group) => {
  const selectionStart = instance.getAttr("selectionStart");
  const selectionEnd = instance.getAttr("selectionEnd");

  if (!selectionStart || !selectionEnd) {
    return 0;
  }

  return amountOfCharsBetween(instance, selectionStart, selectionEnd, true);
};

export const amountOfCharsBetween = (
  instance: Konva.Group,
  from: LineColumn,
  to: LineColumn,
  withSplittedLinesBreak: boolean,
) => {
  let selectionStart = from;
  let selectionEnd = to;

  const renderModel = instance.getAttr("renderModel") as RichTextRenderLine[];

  const { from: finalFrom, to: finalTo } = normalizeLineColumn(
    selectionStart,
    selectionEnd,
  );

  selectionStart = finalFrom;
  selectionEnd = finalTo as LineColumn;

  let foundStart = false;
  let foundEnd = false;
  let amountOfChars = 0;
  for (let i = selectionStart.line; i <= selectionEnd.line; i++) {
    const line = renderModel[i];

    let columnIndex = 0;
    const newLine = { ...line };
    newLine.lineSegments = [];

    for (let j = 0; j < line.lineSegments.length; j++) {
      const segment = line.lineSegments[j];
      // start column and end column are in the same line but not same segment, start column segment
      if (
        selectionStart.line === i &&
        selectionStart.line === selectionEnd.line &&
        !foundStart &&
        selectionStart.column >= columnIndex &&
        selectionStart.column <= columnIndex + segment.text.length &&
        selectionEnd.column >= columnIndex + segment.text.length
      ) {
        amountOfChars += segment.text.length;
        foundStart = true;
      }
      // start column and end column are in the same line but not same segment, intermediate segment
      if (
        selectionStart.line === i &&
        selectionStart.line === selectionEnd.line &&
        foundStart &&
        selectionStart.column < columnIndex &&
        selectionStart.column < columnIndex + segment.text.length &&
        selectionEnd.column >= columnIndex &&
        selectionEnd.column >= columnIndex + segment.text.length
      ) {
        amountOfChars += segment.text.length;
      }
      // start column and end column are in the same line but not same segment, end column segment
      if (
        selectionStart.line === i &&
        selectionStart.line === selectionEnd.line &&
        foundStart &&
        selectionStart.column < columnIndex &&
        selectionStart.column < columnIndex + segment.text.length &&
        selectionEnd.column >= columnIndex &&
        selectionEnd.column <= columnIndex + segment.text.length
      ) {
        amountOfChars += selectionEnd.column - columnIndex;
        foundEnd = true;
        break;
      }
      // start column and end column are in the same line, start column segment and end column in same segment
      if (
        selectionStart.line === i &&
        selectionStart.line === selectionEnd.line &&
        !foundStart &&
        !foundEnd &&
        selectionStart.column >= columnIndex &&
        selectionStart.column <= columnIndex + segment.text.length &&
        selectionEnd.column >= columnIndex &&
        selectionEnd.column <= columnIndex + segment.text.length
      ) {
        amountOfChars +=
          selectionEnd.column -
          columnIndex -
          (selectionStart.column - columnIndex);
        foundStart = true;
        foundEnd = true;
        break;
      }
      // start column and end column are not in the same line, on start line, before start column segments
      if (
        selectionStart.line === i &&
        selectionStart.line !== selectionEnd.line &&
        !foundStart &&
        selectionStart.line === i &&
        selectionStart.column > columnIndex &&
        selectionStart.column > columnIndex + segment.text.length
      ) {
        amountOfChars += segment.text.length;
      }
      // start column and end column are not in the same line, on start line, start column segment found
      if (
        selectionStart.line === i &&
        selectionStart.line !== selectionEnd.line &&
        !foundStart &&
        selectionStart.column >= columnIndex &&
        selectionStart.column < columnIndex + segment.text.length
      ) {
        amountOfChars +=
          segment.text.length - (selectionStart.column - columnIndex);
        foundStart = true;
      }
      // start column and end column are not in the same line, on start line, after start column segments
      if (
        selectionStart.line === i &&
        selectionStart.line !== selectionEnd.line &&
        foundStart &&
        selectionStart.column < columnIndex &&
        selectionStart.column < columnIndex + segment.text.length
      ) {
        amountOfChars += segment.text.length;
      }
      // start column and end column are not in the same line, in intermediate line
      if (
        foundStart &&
        !foundEnd &&
        selectionStart.line < i &&
        selectionEnd.line > i
      ) {
        amountOfChars += segment.text.length;
      }
      // start column and end column are not in the same line, on end line, before end column segments
      if (
        selectionEnd.line === i &&
        selectionStart.line !== selectionEnd.line &&
        foundStart &&
        !foundEnd &&
        selectionEnd.column > columnIndex &&
        selectionEnd.column > columnIndex + segment.text.length
      ) {
        amountOfChars += segment.text.length;
      }
      // start column and end column are not in the same line, on end line, end column segment found
      if (
        selectionEnd.line === i &&
        selectionStart.line !== selectionEnd.line &&
        foundStart &&
        !foundEnd &&
        selectionEnd.column >= columnIndex &&
        selectionEnd.column <= columnIndex + segment.text.length
      ) {
        amountOfChars += selectionEnd.column - columnIndex;
        foundEnd = true;
        break;
      }
      columnIndex += segment.text.length;
    }

    if (line.splitted && !withSplittedLinesBreak && i < selectionEnd.line) {
      amountOfChars -= 1;
    }
  }

  return amountOfChars;
};

export const getSelectedText = (
  instance: Konva.Group,
  // formatted: boolean = false,
) => {
  const selectionStart = instance.getAttr("selectionStart");
  const selectionEnd = instance.getAttr("selectionEnd");

  if (!selectionStart || !selectionEnd) {
    return "";
  }

  // const model = instance.getAttr("model") as RichTextModel;
  const renderModel = instance.getAttr("renderModel") as RichTextRenderLine[];

  const { from: finalFrom, to: finalTo } = normalizeLineColumn(
    selectionStart,
    selectionEnd,
  );

  if (!finalFrom || !finalTo) {
    return "";
  }

  const selectedTextLines = [];
  let foundStart = false;
  for (let i = finalFrom.line; i <= finalTo.line; i++) {
    const line = renderModel[i];

    let lineText = "";
    let columnIndex = 0;
    for (const segment of line.lineSegments) {
      // is start line and end line is different than start line, found start column in segment
      if (
        !foundStart &&
        i === finalFrom.line &&
        finalTo.line !== finalFrom.line &&
        finalFrom.column >= columnIndex &&
        finalFrom.column <= columnIndex + segment.text.length
      ) {
        lineText += segment.text.slice(finalFrom.column - columnIndex);
        foundStart = true;
      }
      // is start line and end line is different than start line, found start already found
      if (
        foundStart &&
        i === finalFrom.line &&
        finalTo.line !== finalFrom.line &&
        finalFrom.column > columnIndex &&
        finalFrom.column > columnIndex + segment.text.length
      ) {
        lineText += segment.text;
      }
      // is start line and end line is different than start line, intermediate line
      if (
        foundStart &&
        i !== finalFrom.line &&
        i !== finalTo.line &&
        finalTo.line !== finalFrom.line
      ) {
        lineText += segment.text;
      }
      // is end line and end line is different than start line, not found end column yet
      if (
        foundStart &&
        i === finalTo.line &&
        finalTo.line !== finalFrom.line &&
        finalTo.column > columnIndex &&
        finalTo.column > columnIndex + segment.text.length
      ) {
        lineText += segment.text;
      }
      // is end line and end line is different than start line, found end column in segment
      if (
        foundStart &&
        i === finalTo.line &&
        finalTo.line !== finalFrom.line &&
        finalTo.column >= columnIndex &&
        finalTo.column <= columnIndex + segment.text.length
      ) {
        lineText += segment.text.slice(0, finalTo.column - columnIndex);
        break;
      }
      // is start line and end line is the same, found start and end column in segment
      if (
        !foundStart &&
        i === finalFrom.line &&
        finalTo.line === finalFrom.line &&
        finalFrom.column >= columnIndex &&
        finalFrom.column <= columnIndex + segment.text.length &&
        finalTo.column >= columnIndex &&
        finalTo.column <= columnIndex + segment.text.length
      ) {
        lineText += segment.text.slice(
          finalFrom.column - columnIndex,
          finalTo.column - columnIndex,
        );
        break;
      }
      // is start line and end line is the same, found start in segment
      if (
        !foundStart &&
        i === finalFrom.line &&
        finalTo.line === finalFrom.line &&
        finalFrom.column >= columnIndex &&
        finalFrom.column <= columnIndex + segment.text.length &&
        finalTo.column > columnIndex &&
        finalTo.column > columnIndex + segment.text.length
      ) {
        lineText += segment.text.slice(finalFrom.column - columnIndex);
        foundStart = true;
      }
      // is start line and end line is the same, intermediate segment
      if (
        foundStart &&
        i === finalFrom.line &&
        finalTo.line === finalFrom.line &&
        finalFrom.column >= columnIndex &&
        finalFrom.column <= columnIndex + segment.text.length &&
        finalTo.column > columnIndex &&
        finalTo.column > columnIndex + segment.text.length
      ) {
        lineText += segment.text;
      }
      // is start line and end line is the same, found end in segment
      if (
        foundStart &&
        i === finalFrom.line &&
        finalTo.line === finalFrom.line &&
        finalTo.column >= columnIndex &&
        finalTo.column <= columnIndex + segment.text.length
      ) {
        lineText += segment.text.slice(0, finalTo.column - columnIndex);
      }

      columnIndex += segment.text.length;
    }

    selectedTextLines.push(lineText);
  }

  return selectedTextLines.join("");
};
