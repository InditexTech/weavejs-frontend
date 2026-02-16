import Konva from "konva";

export function indexOfPreviousBlankLine(text: string): number {
  const trimmedText = text.trim();
  for (let i = trimmedText.length - 1; i >= 0; i--) {
    if (/\s/.test(trimmedText[i])) {
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

export const getRecursiveNode = (
  instance: Konva.Node,
): Konva.Node | undefined => {
  if (instance.getAttr("name").indexOf("node") === -1) {
    const parent = instance.getParent();
    if (parent === null) return undefined;
    if (parent) return getRecursiveNode(parent);
  }
  return instance;
};
