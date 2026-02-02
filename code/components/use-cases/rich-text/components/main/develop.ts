import Konva from "konva";
import { GUIDES } from "./constants";
import { Cursor, RichTextRenderLine, TextStyle } from "./types";

export const createSegmentLineBounds = (
  instance: Konva.Container,
  cursor: Cursor,
  width: number,
  height: number
) => {
  if (GUIDES.SEGMENTS) {
    const rect = new Konva.Rect({
      name: "segment",
      x: cursor.x,
      y: cursor.y,
      width: width,
      height: height,
      stroke: "#0000cc",
      strokeWidth: 1,
      listening: false,
      visible: false,
    });
    instance.add(rect);
    rect.moveToTop();
  }
};

export const createSegmentBounds = (
  instance: Konva.Container,
  cursor: Cursor,
  offset: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  size: any,
  textStyle: TextStyle
) => {
  if (GUIDES.SEGMENTS) {
    const rect = new Konva.Rect({
      name: "segment",
      x: cursor.x,
      y: cursor.y - offset,
      width: size.width,
      height: size.height * textStyle.lineHeight,
      stroke: "#cc0000",
      strokeWidth: 1,
      listening: false,
      visible: false,
    });
    instance.add(rect);
  }
};

export const createBaseline = (
  instance: Konva.Group,
  maxWidth: number,
  actualLine: RichTextRenderLine,
  actualCursor: Cursor
) => {
  if (GUIDES.BASELINES) {
    const lineRef = new Konva.Line({
      name: "baseline",
      points: [
        0,
        actualCursor.y + actualLine.lineBaseline,
        maxWidth,
        actualCursor.y + actualLine.lineBaseline,
      ],
      stroke: "#00cc00",
      strokeWidth: 1,
      visible: false,
    });
    instance.add(lineRef);
  }
};

export const createBoundsRect = (instance: Konva.Group, maxWidth: number) => {
  if (GUIDES.BOUNDS) {
    const boundRect = instance.getClientRect();

    const boundsNode = instance.findOne(".bounds");
    if (boundsNode) {
      boundsNode.setAttrs({
        x: 0,
        y: 0,
        width: maxWidth,
        height: boundRect.height,
      });
    } else {
      const boundRect = instance.getClientRect();

      const limitsRect = new Konva.Rect({
        name: "bounds",
        x: 0,
        y: 0,
        width: maxWidth,
        height: boundRect.height,
        stroke: "#666666",
        strokeWidth: 1,
        listening: false,
        visible: false,
      });
      instance.add(limitsRect);
      limitsRect.moveToTop();
    }
  }
};

export const updateBoundsRect = (instance: Konva.Group) => {
  const maxWidth = instance.getAttr("maxWidth") ?? 0;

  if (GUIDES.BOUNDS) {
    const boundsNode = instance.findOne(".bounds") as Konva.Rect | undefined;
    const cursorNode = instance.findOne(".cursor") as Konva.Line | undefined;
    const background = instance.findOne(".background") as
      | Konva.Rect
      | undefined;

    if (background && cursorNode && boundsNode) {
      const boundsClone = boundsNode.clone();
      boundsNode.destroy();
      background.visible(false);
      cursorNode.visible(false);

      const boundRect = instance.getClientRect();
      boundsClone.setAttrs({
        x: 0,
        y: 0,
        width: maxWidth,
        height: boundRect.height,
      });

      instance.add(boundsClone);
      boundsClone.moveToTop();

      background.visible(true);
      cursorNode.visible(true);
    }
  }
};
