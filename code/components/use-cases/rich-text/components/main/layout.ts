import Konva from "konva";
import { TextLayout, TextLimits } from "./types";
import { renderModifiedTextModel } from "./keyboard";

export const updateLayout = (
  instance: Konva.Group,
  layout: TextLayout,
  limits: TextLimits,
) => {
  instance.setAttr("layout", layout);
  instance.setAttr("limits", limits);

  const renderModel = instance.getAttr("renderModel");

  renderModifiedTextModel(instance, renderModel);

  const stage = instance.getStage();

  if (!stage) {
    return;
  }

  const transformer = stage.findOne("#transformer") as Konva.Transformer;

  if (!transformer) {
    return;
  }

  transformer.forceUpdate();
};
