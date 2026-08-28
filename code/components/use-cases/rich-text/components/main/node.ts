import Konva from "konva";
import {
  RichTextModel,
  RichTextRenderLine,
  TextLayout,
  TextLimits,
} from "./types";
import { generateRenderModel } from "./models";
import { modelToKonvaNodes } from "./render";

export const generateRichText = (
  stage: Konva.Stage,
  initialModel: RichTextModel,
  options: {
    pos: Konva.Vector2d;
    layout: TextLayout;
    limits: TextLimits;
  },
) => {
  const { pos, layout, limits } = options;

  const renderModel: RichTextRenderLine[] = generateRenderModel(
    pos,
    limits,
    initialModel,
  );

  const richText = modelToKonvaNodes(
    stage,
    pos,
    layout,
    limits,
    initialModel,
    renderModel,
  );

  return richText;
};
