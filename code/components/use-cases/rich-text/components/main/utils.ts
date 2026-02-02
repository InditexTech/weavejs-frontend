import Konva from "konva";

export function indexOfPreviousBlankLine(text: string): number {
  for (let i = text.length - 1; i >= 0; i--) {
    if (/\s/.test(text[i])) {
      return i;
    }
  }
  return -1;
}

export const getNode = (instance: Konva.Node): Konva.Node | undefined => {
  if (instance.getAttr("name").indexOf("node") === -1) {
    const parent = instance.getParent();
    if (parent === null) return undefined;
    if (parent) return getNode(parent);
  }
  return instance;
};
