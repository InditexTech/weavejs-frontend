import Konva from "konva";
import { RichTextRenderLine } from "./types";
import { measureLineElements } from "./models";

export const getLineColumnFromPointerPosition = (
  instance: Konva.Group,
  pos: Konva.Vector2d,
  isShiftPressed: boolean
) => {
  const renderModel: RichTextRenderLine[] =
    instance.getAttr("renderModel") ?? [];

  if (renderModel.length === 0) {
    return { line: 0, column: 0 };
  }

  let selectedLine = -1;
  let selectedColumn = -1;

  let lineStartHeight = 0;
  let lineEndHeight = 0;
  for (let i = 0; i < renderModel.length; i++) {
    const line = renderModel[i];
    lineStartHeight = lineEndHeight;
    lineEndHeight += line.lineHeight;
    if (pos.y >= lineStartHeight && pos.y <= lineEndHeight) {
      selectedLine = i;
      break;
    }
  }

  if (selectedLine === -1 && pos.y < 0) {
    selectedLine = 0;
  }

  if (selectedLine === -1 && pos.y > lineEndHeight) {
    selectedLine = renderModel.length - 1;
  }

  const lineSegments = [];
  let lineLength = 0;
  let lineText = "";
  for (let i = 0; i < renderModel[selectedLine].lineSegments.length; i++) {
    const actSegment = renderModel[selectedLine].lineSegments[i];

    let columnFound = false;
    let tempLineText = "";
    let lastMeasure = lineLength;
    for (let j = 0; j < actSegment.text.length; j++) {
      const actChar = actSegment.text[j];
      lineText = `${lineText}`;
      tempLineText = `${tempLineText}${actChar}`;
      const measure = measureLineElements([
        ...lineSegments,
        { ...actSegment, text: tempLineText },
      ]);

      const diff = measure - lastMeasure;
      const letterMid = diff / 2;

      if (
        pos.x >= lineLength &&
        pos.x <= measure &&
        pos.x < measure - diff + letterMid
      ) {
        columnFound = true;
        lineText = `${lineText}${tempLineText}`;
        selectedColumn = lineText.length - 1;
        break;
      }
      if (
        pos.x >= lineLength &&
        pos.x <= measure &&
        pos.x >= measure - diff + letterMid
      ) {
        columnFound = true;
        lineText = `${lineText}${tempLineText}`;
        selectedColumn = lineText.length;
        break;
      }

      lastMeasure = measure;
    }

    if (columnFound) {
      break;
    }

    lineLength = lineLength + measureLineElements([actSegment]);
    lineText = `${lineText}${tempLineText}`;

    lineSegments.push(actSegment);
  }

  if (selectedColumn === -1) {
    selectedColumn = renderModel[selectedLine].text.length;
  }

  if (!isShiftPressed) {
    const line = renderModel[selectedLine];
    if (selectedColumn === line.text.length && line.text.endsWith("\n")) {
      selectedColumn = selectedColumn - 1;
    }
  }

  return { line: selectedLine, column: selectedColumn };
};
