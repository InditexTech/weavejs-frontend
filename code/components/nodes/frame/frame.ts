import {
  WeaveElementAttributes,
  WeaveElementInstance,
  WeaveNode,
  WeaveStateElement,
} from "@inditextech/weavejs-sdk";
import Konva from "konva";
import { Noto_Sans_Mono } from "next/font/google";

export const FRAME_NODE_TYPE = "frame";

const notoSansMono = Noto_Sans_Mono({
  preload: true,
  variable: "--font-noto-sans-mono",
  subsets: ["latin"],
});

export class FrameNode extends WeaveNode {
  protected nodeType = FRAME_NODE_TYPE;

  createNode(key: string, props: WeaveElementAttributes) {
    return {
      key,
      type: this.nodeType,
      props: {
        ...props,
        id: key,
        nodeType: this.nodeType,
        children: [],
      },
    };
  }

  createInstance(props: WeaveElementAttributes) {
    const { id } = props;

    const frameParams = {
      ...props,
    };
    delete frameParams.zIndex;

    const frameWidth = 1403;
    const frameHeight = 992;
    const titleHeight = 30;
    const strokeWidth = 2;

    const frame = new Konva.Group({
      ...frameParams,
      containerId: `${id}-group-internal`,
      width: frameWidth + strokeWidth * 2,
      height: frameHeight + titleHeight + strokeWidth * 2,
      fill: "#ffffffff",
      clipX: 0,
      clipY: 0,
      clipWidth: frameWidth + strokeWidth * 2,
      clipHeight: frameHeight + titleHeight + strokeWidth * 2,
      name: "node",
    });

    const background = new Konva.Rect({
      id: `${id}-bg`,
      x: strokeWidth,
      y: titleHeight + strokeWidth,
      width: frameWidth,
      stroke: "#000000ff",
      strokeWidth: 2,
      height: frameHeight,
      fill: "#ffffffff",
      draggable: false,
    });

    frame.add(background);

    const text = new Konva.Text({
      id: `${id}-title`,
      x: 0,
      y: 0,
      width: frameWidth,
      height: titleHeight - 10,
      fontSize: 20,
      fontFamily: notoSansMono.style.fontFamily,
      align: "left",
      text: frameParams.title,
      stroke: "#000000ff",
      strokeWidth: 1,
      listening: false,
      draggable: false,
    });

    frame.add(text);

    const frameInternal = new Konva.Group({
      id: `${id}-group-internal`,
      nodeId: id,
      x: strokeWidth,
      y: titleHeight + strokeWidth,
      width: frameWidth,
      height: frameHeight,
      draggable: false,
      stroke: "transparent",
      strokeWidth,
      clipX: 0,
      clipY: 0,
      clipWidth: frameWidth,
      clipHeight: frameHeight,
    });

    frame.add(frameInternal);

    this.setupDefaultNodeEvents(frame);

    return frame;
  }

  updateInstance(
    nodeInstance: WeaveElementInstance,
    nextProps: WeaveElementAttributes
  ) {
    const { id } = nextProps;

    const frameNode = nodeInstance as Konva.Group;

    const newProps = { ...nextProps };
    delete newProps.title;

    nodeInstance.setAttrs({
      ...newProps,
    });

    const frameTitle = frameNode.findOne(`#${id}-title`);
    if (frameTitle) {
      frameTitle.setAttrs({
        text: nextProps.title,
      });
    }
  }

  removeInstance(nodeInstance: WeaveElementInstance) {
    nodeInstance.destroy();
  }

  toNode(instance: WeaveElementInstance) {
    const attrs = instance.getAttrs();

    const frameInternal = (instance as Konva.Group).findOne(
      `#${attrs.containerId}`
    ) as Konva.Group | undefined;

    const childrenMapped: WeaveStateElement[] = [];
    if (frameInternal) {
      const children: WeaveElementInstance[] = [
        ...(frameInternal as Konva.Group).getChildren(),
      ];
      for (const node of children) {
        const handler = this.instance.getNodeHandler(node.getAttr("nodeType"));
        childrenMapped.push(handler.toNode(node));
      }
    }

    const cleanedAttrs = { ...attrs };
    delete cleanedAttrs.draggable;

    return {
      key: attrs.id ?? "",
      type: attrs.nodeType,
      props: {
        ...cleanedAttrs,
        id: attrs.id ?? "",
        nodeType: attrs.nodeType,
        children: childrenMapped,
      },
    };
  }
}
