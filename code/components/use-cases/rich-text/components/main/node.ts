import Konva from "konva";
import { RichTextModel, RichTextRenderLine } from "./types";
import { generateRenderModel } from "./models";
import { modelToKonvaNodes } from "./render";

export const generateRichText = (
  stage: Konva.Stage,
  pos: Konva.Vector2d,
  maxWidth: number,
  initialModel: RichTextModel
) => {
  const renderModel: RichTextRenderLine[] = generateRenderModel(
    pos,
    maxWidth,
    initialModel
  );

  const richText = modelToKonvaNodes(
    stage,
    pos,
    maxWidth,
    initialModel,
    renderModel
  );

  return richText;
};
