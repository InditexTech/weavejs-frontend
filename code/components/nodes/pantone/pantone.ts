import {
  WeaveElementAttributes,
  WeaveElementInstance,
  WeaveNode,
} from "@inditextech/weavejs-sdk";
import Konva from "konva";
import { getNearestPantone } from "pantone-tcx";

export const PANTONE_NODE_TYPE = "pantone";

export class PantoneNode extends WeaveNode {
  protected nodeType = PANTONE_NODE_TYPE;

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

    const pantoneColor = props.pantone ?? "#DEFFA0";

    const nearestColor = getNearestPantone(pantoneColor);

    const pantoneParams = {
      ...props,
    };
    delete pantoneParams.zIndex;

    const pantone = new Konva.Group({
      ...pantoneParams,
      width: pantoneParams.width,
      height: pantoneParams.height,
    });

    const internalRect = new Konva.Rect({
      groupId: id,
      x: 0,
      y: 0,
      fill: "#FFFFFFFF",
      width: pantoneParams.width,
      height: pantoneParams.height,
      draggable: false,
      listening: true,
      stroke: "black",
      strokeWidth: 2,
    });

    pantone.add(internalRect);

    const internalRect2 = new Konva.Rect({
      id: `${id}-pantone-1`,
      groupId: id,
      x: 1,
      y: 1,
      fill: pantoneColor,
      width: pantoneParams.width - 2,
      height: (pantoneParams.height ?? 0) - 120,
      draggable: false,
    });

    pantone.add(internalRect2);

    const internalRect3 = new Konva.Rect({
      id: `${id}-pantone-2`,
      groupId: id,
      x: 1,
      y: 168,
      fill: pantoneColor,
      width: pantoneParams.width - 2,
      height: 12,
      draggable: false,
    });

    pantone.add(internalRect3);

    const imageObj = new Image();
    imageObj.onload = function () {
      const pantoneImage = new Konva.Image({
        groupId: id,
        x: 20,
        y: 200,
        width: (pantoneParams.width ?? 0) - 150,
        height:
          ((pantoneParams.width ?? 0) - 150) *
          (imageObj.height / imageObj.width),
        image: imageObj,
        draggable: false,
      });
      pantone.add(pantoneImage);
    };
    imageObj.src =
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Pantone_logo.svg/1024px-Pantone_logo.svg.png";

    const internalText = new Konva.Text({
      id: `${id}-pantone-code`,
      groupId: id,
      x: 20,
      y: 240,
      fontSize: 20,
      fontFamily: "NeueHelveticaZara",
      fill: "#CCCCCCFF",
      strokeEnabled: false,
      stroke: "#000000FF",
      strokeWidth: 1,
      text: `TCX ${nearestColor.tcx}`,
      width: (pantoneParams.width ?? 0) - 40,
      height: 20,
      align: "left",
      draggable: false,
    });

    pantone.add(internalText);

    const internalText2 = new Konva.Text({
      id: `${id}-pantone-name`,
      groupId: id,
      x: 20,
      y: 260,
      fontSize: 20,
      fontFamily: "NeueHelveticaZara",
      fill: "#000000FF",
      strokeEnabled: false,
      stroke: "#000000FF",
      fontStyle: "bold",
      strokeWidth: 1,
      text: nearestColor.name,
      width: (pantoneParams.width ?? 0) - 40,
      height: 20,
      align: "left",
      draggable: false,
    });

    pantone.add(internalText2);

    this.setupDefaultNodeEvents(pantone);

    return pantone;
  }

  updateInstance(
    nodeInstance: WeaveElementInstance,
    nextProps: WeaveElementAttributes
  ) {
    const { id, pantone } = nextProps;

    const pantoneNode = nodeInstance as Konva.Group;

    const nodeInstanceZIndex = nodeInstance.zIndex();
    nodeInstance.setAttrs({
      ...nextProps,
      zIndex: nodeInstanceZIndex,
    });

    const pantoneColor = pantone ?? "#DEFFA0";

    const nearestColor = getNearestPantone(pantoneColor);

    const pantoneNode1 = pantoneNode.findOne(`#${id}-pantone-1`);
    if (pantoneNode1) {
      pantoneNode1.setAttrs({
        fill: pantoneColor,
      });
    }
    const pantoneNode2 = pantoneNode.findOne(`#${id}-pantone-2`);
    if (pantoneNode2) {
      pantoneNode2.setAttrs({
        fill: pantoneColor,
      });
    }
    const pantoneCode = pantoneNode.findOne(`#${id}-pantone-code`);
    if (pantoneCode) {
      pantoneCode.setAttr("text", `TCX ${nearestColor.tcx}`);
    }
    const pantoneName = pantoneNode.findOne(`#${id}-pantone-name`);
    if (pantoneName) {
      pantoneName.setAttr("text", nearestColor.name);
    }
  }

  removeInstance(nodeInstance: WeaveElementInstance) {
    nodeInstance.destroy();
  }

  toNode(instance: WeaveElementInstance) {
    const attrs = instance.getAttrs();

    const cleanedAttrs = { ...attrs };
    delete cleanedAttrs.draggable;

    return {
      key: attrs.id ?? "",
      type: attrs.nodeType,
      props: {
        ...cleanedAttrs,
        id: attrs.id ?? "",
        nodeType: attrs.nodeType,
        children: [],
      },
    };
  }
}
