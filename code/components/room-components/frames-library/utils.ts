import Konva from "konva";

export const toImageAsync = (
  node: Konva.Node,
  properties: {
    x: number;
    y: number;
    width: number;
    height: number;
  }
): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    node.toImage({
      mimeType: "image/jpeg",
      quality: 1,
      x: properties.x + 1,
      y: properties.y + 1,
      width: properties.width - 2,
      height: properties.height - 2,
      callback(img) {
        resolve(img);
      },
    });
  });
};
