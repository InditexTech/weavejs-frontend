import Konva from "konva";
import {
  Cursor,
  RichTextElement,
  RichTextModel,
  RichTextRenderLine,
  TextLimits,
  TextSegment,
  TextStyle,
} from "./types";
import { DEFAULT_TEXT_STYLE } from "./constants";
import { indexOfPreviousBlankLine } from "./utils";
import { isEqual } from "lodash";

export const measureLineElements = (lineElements: TextSegment[]): number => {
  let lineSize: number = 0;

  for (const element of lineElements) {
    const textNode = new Konva.Text({
      text: element.text,
      fontSize: element.style.size,
      fontFamily: element.style.font,
      fontStyle: element.style.style,
      textDecoration:
        element.style.decoration === "none" ? "" : element.style.decoration,
      fill: "black",
      align: "left",
      verticalAlign: "middle",
    });

    const size = textNode.measureSize(element.text);
    lineSize += size.width;
  }

  return lineSize;
};

export const generateRenderModel = (
  origin: Konva.Vector2d,
  limits: TextLimits,
  model: RichTextModel,
): RichTextRenderLine[] => {
  const internalModel: RichTextRenderLine[] = [];

  let segmentSplitted = false;
  let wordStart = undefined;
  let lineText = "";
  let lineBaseline = -Infinity;
  let lineHeight = -Infinity;
  let lineSegments: TextSegment[] = [];
  const cursor: Cursor = {
    x: origin.x,
    y: origin.y,
    width: 0,
    height: DEFAULT_TEXT_STYLE.size,
  };
  let previousSegmentStyle: TextStyle | null = null;

  for (let i = 0; i < model.length; i++) {
    const element = model[i];
    const elementLines = element.text.match(/[^\r\n]+|\r?\n/g);

    if (!elementLines) continue;

    if (lineText !== "" && previousSegmentStyle) {
      if (
        (lineText !== " " && lineText.length > 0) ||
        (lineText === " " && lineSegments.length > 0)
      ) {
        lineSegments.push({
          modelElementIndex: i - 1,
          text: lineText,
          x: cursor.x,
          y: cursor.y,
          style: previousSegmentStyle,
        });
      }
      lineText = "";
    }

    const actualStyle = {
      ...DEFAULT_TEXT_STYLE,
      ...{
        ...(element.font && { font: element.font }),
        ...(element.size && { size: element.size }),
        ...(element.style && { style: element.style }),
        ...(element.decoration && { decoration: element.decoration }),
        ...(element.align && { align: element.align }),
        ...(element.color && { color: element.color }),
      },
    };
    previousSegmentStyle = actualStyle;

    for (let j = 0; j < elementLines.length; j++) {
      const line = elementLines[j];

      if (line === "\n") {
        const textMeasurer = new Konva.Text({
          text: " ",
          fontFamily: actualStyle.font,
          fontSize: actualStyle.size,
          fontStyle: actualStyle.style,
          textDecoration: actualStyle.decoration,
          fill: actualStyle.color,
          align: actualStyle.align,
        });
        const size = textMeasurer.measureSize(" ");

        lineBaseline = Math.max(
          lineBaseline,
          size.height + size.emHeightDescent,
        );
        lineHeight = Math.max(
          lineHeight,
          (size.height + size.fontBoundingBoxDescent) * actualStyle.lineHeight,
        );

        lineSegments.push({
          modelElementIndex: i - 1,
          text: `${lineText}\n`,
          x: cursor.x,
          y: cursor.y,
          style: actualStyle,
        });

        internalModel.push({
          elementIndex: i,
          lineBaseline,
          lineHeight,
          text: lineSegments.map((seg) => seg.text).join(""),
          lineSegments: [...lineSegments],
          splitted: false,
        });

        lineSegments = [];
        lineText = "";
        cursor.x = origin.x;
        cursor.y += lineHeight;

        lineBaseline = -Infinity;
        lineHeight = -Infinity;
      } else {
        const words = line.match(/\S+|[ ]/g) ?? [];

        for (
          let k = wordStart === undefined ? 0 : wordStart;
          k < words.length;
          k++
        ) {
          if (wordStart) {
            wordStart = undefined;
          }

          const word = words[k];

          const textToMeasure = `${lineText}${word}`;
          const textMeasurer = new Konva.Text({
            text: textToMeasure,
            fontFamily: actualStyle.font,
            fontSize: actualStyle.size,
            fontStyle: actualStyle.style,
            textDecoration: actualStyle.decoration,
            fill: actualStyle.color,
            align: "left",
          });
          const textToMeasureTrailingSpaces =
            textToMeasure.match(/\s*$/)?.[0] ?? "";
          let realTextToMeasure = textToMeasure;
          if (limits?.width !== undefined) {
            realTextToMeasure = `${textToMeasure.trimEnd()}${textToMeasureTrailingSpaces.length > 0 ? " " : ""}`;
          }
          const size = textMeasurer.measureSize(realTextToMeasure);

          lineBaseline = Math.max(
            lineBaseline,
            size.height + size.emHeightDescent,
          );
          lineHeight = Math.max(
            lineHeight,
            (size.height + size.fontBoundingBoxDescent) *
              actualStyle.lineHeight,
          );

          const lineSize = measureLineElements(lineSegments);

          if (lineSize + cursor.x + size.width > origin.x + limits.width) {
            const finalLineText =
              word === " " ? `${lineText}${word}` : lineText;
            const wordOffset = word;

            if (lineText === "") {
              let visited = 1;
              for (let m = lineSegments.length - 1; m >= 0; m--) {
                const actSegment = lineSegments[m];
                let index = indexOfPreviousBlankLine(actSegment.text);
                if (
                  actSegment.text[actSegment.text.length - 1] !== " " &&
                  index === -1
                ) {
                  visited++;
                  continue;
                }

                let endsInWhitespace = false;
                if (actSegment.text[actSegment.text.length - 1] === " ") {
                  index = actSegment.text.length - 1;
                  endsInWhitespace = true;
                }

                const segmentToSplitTextWithSpace = actSegment.text.slice(
                  0,
                  index + 1,
                );

                const segmentWords =
                  segmentToSplitTextWithSpace.match(/\S+|[ ]/g) ?? [];

                lineSegments = [
                  ...lineSegments.slice(0, m),
                  {
                    modelElementIndex: actSegment.modelElementIndex,
                    text: `${segmentToSplitTextWithSpace}\n`,
                    x: actSegment.x,
                    y: actSegment.y,
                    style: actSegment.style,
                  },
                ];

                internalModel.push({
                  elementIndex: i,
                  lineBaseline,
                  lineHeight,
                  text: lineSegments.map((seg) => seg.text).join(""),
                  lineSegments: [...lineSegments],
                  splitted: true,
                });

                lineSegments = [];
                lineText = "";
                cursor.x = origin.x;
                cursor.y += lineHeight;
                lineBaseline = -Infinity;
                lineHeight = -Infinity;

                if (endsInWhitespace) {
                  i = i - visited;
                  wordStart = 0;
                } else {
                  const words = actSegment.text.match(/\S+|[ ]/g) ?? [];
                  const offset =
                    words.length - (words.length - segmentWords.length);

                  i = actSegment.modelElementIndex - 1;
                  wordStart = offset;
                }

                segmentSplitted = true;

                break;
              }
            }

            if (segmentSplitted) {
              break;
            }

            lineSegments.push({
              modelElementIndex: i - 1,
              text: `${finalLineText}\n`,
              x: cursor.x,
              y: cursor.y,
              style: actualStyle,
            });

            internalModel.push({
              elementIndex: i,
              lineBaseline,
              lineHeight,
              text: lineSegments.map((seg) => seg.text).join(""),
              lineSegments: [...lineSegments],
              splitted: true,
            });

            lineSegments = [];

            lineText = wordOffset.trim() === "" ? "" : wordOffset;
            cursor.x = origin.x;
            cursor.y += lineHeight;
          } else {
            lineText = `${lineText}${word}`;
          }
        }
      }

      if (segmentSplitted) {
        segmentSplitted = false;
        break;
      }
    }
  }

  if (previousSegmentStyle) {
    let realLineBaseline = lineBaseline;
    let realLineHeight = lineHeight;
    if (realLineBaseline === -Infinity || lineHeight === -Infinity) {
      let lineToMeasure = lineText.endsWith("\n")
        ? lineText.slice(0, -1)
        : lineText;
      if (lineToMeasure === "") {
        lineToMeasure = " ";
      }

      const textToMeasure = lineToMeasure;
      const textMeasurer = new Konva.Text({
        text: textToMeasure,
        fontFamily: previousSegmentStyle.font,
        fontSize: previousSegmentStyle.size,
        fontStyle: previousSegmentStyle.style,
        textDecoration: previousSegmentStyle.decoration,
        fill: previousSegmentStyle.color,
        align: "left",
      });
      const size = textMeasurer.measureSize(textToMeasure);

      realLineBaseline = Math.max(
        realLineBaseline,
        size.height + size.emHeightDescent,
      );
      realLineHeight = Math.max(
        realLineHeight,
        (size.height + size.fontBoundingBoxDescent) *
          previousSegmentStyle.lineHeight,
      );
    }

    lineSegments.push({
      modelElementIndex: model.length - 2,
      text: lineText,
      x: cursor.x,
      y: cursor.y,
      style: previousSegmentStyle,
    });

    const finalLineText = lineSegments.map((seg) => seg.text).join("");

    internalModel.push({
      elementIndex: model.length - 2,
      lineBaseline: realLineBaseline,
      lineHeight: realLineHeight,
      text: finalLineText,
      lineSegments: [...lineSegments],
      splitted: true,
    });
  }

  if (internalModel.length === 0) {
    internalModel.push({
      elementIndex: 0,
      lineBaseline: DEFAULT_TEXT_STYLE.size,
      lineHeight: DEFAULT_TEXT_STYLE.size,
      text: "",
      lineSegments: [
        {
          modelElementIndex: model.length - 1,
          text: "",
          x: origin.x,
          y: origin.y,
          style: DEFAULT_TEXT_STYLE,
        },
      ],
      splitted: false,
    });
  }

  return internalModel;
};

export const renderInternalModelToModel = (
  renderModel: RichTextRenderLine[],
): RichTextModel => {
  const model: RichTextModel = [];

  if (renderModel.length === 0) {
    return [
      {
        text: "",
      },
    ];
  }

  let actualElement: RichTextElement = { text: "" };
  let actualStyles = undefined;
  for (let i = 0; i < renderModel.length; i++) {
    const line = renderModel[i];
    actualStyles =
      actualStyles === undefined
        ? { ...line.lineSegments[0].style }
        : actualStyles;
    for (let j = 0; j < line.lineSegments.length; j++) {
      const segment = line.lineSegments[j];
      // const isLastSegment = i === line.lineSegments.length - 1;
      const isSplitted = line.splitted ? true : false;

      let textToAdd = segment.text;
      if (
        isSplitted &&
        line.lineSegments.length - 1 === j &&
        segment.text.endsWith("\n")
      ) {
        textToAdd = segment.text.slice(0, -1);
      }

      if (
        segment.text === "\n" &&
        i === renderModel.length - 1 &&
        j === line.lineSegments.length - 1
      ) {
        textToAdd = "\n";
      }

      if (isEqual(actualStyles, segment.style)) {
        actualElement.text = `${actualElement.text}${textToAdd}`;
      } else {
        actualElement = {
          ...actualElement,
          ...actualStyles,
        };
        if (actualElement.text !== "") {
          model.push(actualElement);
        }

        actualElement = { text: textToAdd };
        actualStyles = { ...segment.style };
      }
    }

    if (!line.splitted) {
      actualElement.text = actualElement.text;
    }
  }

  actualElement = {
    ...actualElement,
    ...actualStyles,
  };
  if (actualElement.text !== "") {
    model.push(actualElement);
  }

  return model;
};
