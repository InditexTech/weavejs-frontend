// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import {
  moveNodeToContainer,
  WeaveImageNode,
  WeaveNode,
} from "@inditextech/weave-sdk";
import {
  WEAVE_NODE_CUSTOM_EVENTS,
  WeaveElementAttributes,
  WeaveElementInstance,
  WeaveStateElement,
} from "@inditextech/weave-types";
import Konva from "konva";
import { ImageTemplateFit } from "./types";
import { IMAGE_TEMPLATE_FIT } from "./constants";

export const IMAGE_TEMPLATE_NODE_TYPE = "image-template";

export class ImageTemplateNode extends WeaveNode {
  protected nodeType = IMAGE_TEMPLATE_NODE_TYPE;
  protected padding = 20;
  protected borderWidth = 1;
  protected templateIdDefault = "Template ID";

  onRender(props: WeaveElementAttributes) {
    const { id } = props;

    const imageTemplateParams = {
      ...props,
    };
    delete imageTemplateParams.zIndex;

    const imageTemplateNode = new Konva.Group({
      ...imageTemplateParams,
      isContainerPrincipal: true,
      containerId: `${id}-imageTemplate-group`,
      name: "node containerCapable",
    });

    this.setupDefaultNodeAugmentation(imageTemplateNode);

    const internalRect = new Konva.Rect({
      name: "fillShape",
      groupId: id,
      nodeId: id,
      id: `${id}-imageTemplate`,
      x: 0,
      y: 0,
      fill: "#666666",
      width: imageTemplateParams.width,
      height: imageTemplateParams.height,
      strokeWidth: imageTemplateParams.isUsed ? 0 : this.borderWidth,
      stroke: "#000000",
      hitFunc: function (ctx, shape) {
        ctx.beginPath();
        ctx.rect(0, 0, shape.width(), shape.height());
        ctx.fillStrokeShape(shape);
      },
    });

    const internalGroup = new Konva.Group({
      name: "fillShape",
      groupId: id,
      nodeId: id,
      id: `${id}-imageTemplate-group`,
      x: 0,
      y: 0,
      clipWidth: imageTemplateParams.width,
      clipHeight: imageTemplateParams.height,
    });

    const internalText = new Konva.Text({
      id: `${id}-imageTemplateId`,
      groupId: id,
      nodeId: id,
      x: this.padding,
      y: this.padding,
      fontSize: 48,
      fontFamily: "Inter, sans-serif",
      fontStyle: "normal",
      fill: "#FFFFFFFF",
      strokeEnabled: false,
      stroke: "#FFFFFFFF",
      strokeWidth: 1,
      text: imageTemplateParams.templateId ?? this.templateIdDefault,
      width: imageTemplateParams.width - this.padding * 2,
      height: imageTemplateParams.height - this.padding * 2,
      align: "center",
      verticalAlign: "middle",
      listening: false,
      draggable: false,
    });

    imageTemplateNode.add(internalRect);
    imageTemplateNode.add(internalText);
    imageTemplateNode.add(internalGroup);

    imageTemplateNode.getClientRect = (config) => {
      return internalRect.getClientRect(config);
    };

    imageTemplateNode.on("transformstart", () => {
      internalText.visible(false);
    });

    imageTemplateNode.on("transformend", () => {
      internalText.visible(true);
    });

    imageTemplateNode.on(WEAVE_NODE_CUSTOM_EVENTS.onTargetLeave, () => {
      internalRect.fill("#666666");
    });

    imageTemplateNode.on(WEAVE_NODE_CUSTOM_EVENTS.onTargetEnter, () => {
      const selectedNodes = this.getNodesSelectionPlugin()?.getSelectedNodes();
      if (
        selectedNodes?.length === 1 &&
        selectedNodes?.[0].getAttrs().nodeType === "image"
      ) {
        internalRect.fill("#CC0000");
      }
    });

    this.instance.addEventListener(
      "onNodeMovedToContainer",
      ({ node, container }: { node: Konva.Node; container: Konva.Node }) => {
        if (node && container === imageTemplateNode) {
          this.link(imageTemplateNode, node as WeaveElementInstance);
        }
      }
    );

    this.setupDefaultNodeEvents(imageTemplateNode);

    imageTemplateNode.canMoveToContainer = function (
      node: Konva.Node
    ): boolean {
      return node.getAttr("nodeType") === "image";
    };

    if (imageTemplateNode.getAttrs().moving) {
      this.instance.emitEvent("onImageTemplateFreed", {
        template: imageTemplateNode,
      });
    } else {
      this.instance.emitEvent("onImageTemplateLocked", {
        template: imageTemplateNode,
      });
    }

    if (imageTemplateNode.getAttrs().isUsed) {
      internalRect.strokeWidth(0);
      internalText.visible(false);
    }

    return imageTemplateNode;
  }

  onUpdate(
    nodeInstance: WeaveElementInstance,
    nextProps: WeaveElementAttributes
  ) {
    const imageTemplateNode = nodeInstance as Konva.Group;
    imageTemplateNode.setAttrs({
      ...nextProps,
    });

    const internalRect = imageTemplateNode.findOne(
      `#${nextProps.id}-imageTemplate`
    ) as Konva.Rect;
    internalRect?.setAttrs({
      width: nextProps.width,
      height: nextProps.height,
    });

    const internalText = imageTemplateNode.findOne(
      `#${nextProps.id}-imageTemplateId`
    ) as Konva.Text;
    internalText?.setAttrs({
      x: this.padding,
      y: this.padding,
      text: nextProps.templateId ?? this.templateIdDefault,
      width: nextProps.width - this.padding * 2,
      height: nextProps.height - this.padding * 2,
    });

    const internalGroup = imageTemplateNode.findOne(
      `#${nextProps.id}-imageTemplate-group`
    ) as Konva.Group;
    internalGroup?.setAttrs({
      clipWidth: nextProps.width,
      clipHeight: nextProps.height,
    });

    if (internalGroup?.getChildren().length === 0 && nextProps.isUsed) {
      imageTemplateNode.setAttr("originalImageWidth", undefined);
      imageTemplateNode.setAttr("originalImageHeight", undefined);
      imageTemplateNode.setAttr("fit", undefined);
      imageTemplateNode.setAttr("isUsed", false);
      imageTemplateNode.setAttr("lockToContainer", false);
      imageTemplateNode.setAttr("moving", false);

      this.instance.updateNode(
        this.serialize(imageTemplateNode as WeaveElementInstance)
      );

      this.getNodesSelectionPlugin()?.setSelectedNodes([imageTemplateNode]);
    }

    if (nextProps.isUsed) {
      internalRect.strokeWidth(0);
      internalText.visible(false);
    } else {
      internalRect.strokeWidth(this.borderWidth);
      internalText.visible(true);
    }

    if (imageTemplateNode.getAttrs().moving) {
      this.instance.emitEvent("onImageTemplateFreed", {
        template: imageTemplateNode,
      });
    } else {
      this.instance.emitEvent("onImageTemplateLocked", {
        template: imageTemplateNode,
      });
    }
  }

  setImage(template: WeaveElementInstance, node: WeaveElementInstance) {
    moveNodeToContainer(this.instance, node, template);
  }

  changeFit(template: WeaveElementInstance, fit: ImageTemplateFit) {
    const nodeInstance = template as Konva.Group;

    const internalGroup = nodeInstance.findOne(
      `#${nodeInstance.getAttr("id")}-imageTemplate-group`
    ) as Konva.Group;

    if (!internalGroup) {
      return;
    }

    this.link(
      nodeInstance,
      internalGroup.getChildren()[0] as WeaveElementInstance,
      fit
    );
  }

  freeImage(template: WeaveElementInstance) {
    const nodeInstance = template as Konva.Group;

    const internalGroup = nodeInstance.findOne(
      `#${nodeInstance.getAttr("id")}-imageTemplate-group`
    ) as Konva.Group;

    if (!internalGroup) {
      return;
    }

    const imageNode = internalGroup.getChildren()[0];

    const imageHandler = this.instance.getNodeHandler<WeaveImageNode>("image");

    if (!imageHandler) {
      return;
    }

    imageNode.setAttrs({
      lockToContainer: true,
      draggable: true,
      listening: true,
    });

    this.instance.updateNode(
      imageHandler.serialize(imageNode as WeaveElementInstance)
    );

    template.setAttrs({
      lockToContainer: true,
      moving: true,
    });
    this.instance.updateNode(this.serialize(template as WeaveElementInstance));

    this.instance.emitEvent("onImageTemplateFreed", { template });

    const nodesSelectionPlugin = this.getNodesSelectionPlugin();
    if (nodesSelectionPlugin) {
      nodesSelectionPlugin.setSelectedNodes([
        imageNode as WeaveElementInstance,
      ]);
    }
  }

  lockImage(template: WeaveElementInstance) {
    const nodeInstance = template as Konva.Group;

    const internalGroup = nodeInstance.findOne(
      `#${nodeInstance.getAttr("id")}-imageTemplate-group`
    ) as Konva.Group;

    if (!internalGroup) {
      return;
    }

    const imageNode = internalGroup.getChildren()[0];

    const imageHandler = this.instance.getNodeHandler<WeaveImageNode>("image");

    if (!imageHandler) {
      return;
    }

    imageNode.setAttr("lockToContainer", undefined);
    imageNode.setAttrs({
      draggable: false,
      listening: false,
    });

    this.instance.updateNode(
      imageHandler.serialize(imageNode as WeaveElementInstance)
    );

    template.setAttrs({
      lockToContainer: false,
      moving: false,
    });
    this.instance.updateNode(this.serialize(template as WeaveElementInstance));

    this.instance.emitEvent("onImageTemplateLocked", { template });

    const nodesSelectionPlugin = this.getNodesSelectionPlugin();
    if (nodesSelectionPlugin) {
      nodesSelectionPlugin.setSelectedNodes([template as WeaveElementInstance]);
    }
  }

  link(
    template: WeaveElementInstance,
    node: WeaveElementInstance,
    fit: ImageTemplateFit = IMAGE_TEMPLATE_FIT.COVER
  ) {
    const stage = this.instance.getStage();
    const imageNode = (node as Konva.Group).findOne(
      `#${node.getAttr("id")}-image`
    );

    if (!imageNode) {
      return;
    }

    const imageRect = imageNode?.getClientRect({
      relativeTo: stage,
    });
    let iw = imageRect?.width ?? 1;
    let ih = imageRect?.height ?? 1;

    let saveOriginalImage = false;
    if (template.getAttr("originalImageWidth") === undefined) {
      saveOriginalImage = true;
    } else {
      iw = template.getAttr("originalImageWidth");
      ih = template.getAttr("originalImageHeight");
    }

    const templateRect = template.getClientRect({
      relativeTo: stage,
    });
    const gw = templateRect.width; // group width
    const gh = templateRect.height; // group height

    const imageRatio = iw / ih;
    const groupRatio = gw / gh;

    let scaleX, scaleY, x, y;

    switch (fit) {
      case IMAGE_TEMPLATE_FIT.FILL:
        // fit both width and height
        scaleX = gw / iw;
        scaleY = gh / ih;
        x = 0;
        y = 0;
        break;
      case IMAGE_TEMPLATE_FIT.CONTAIN:
        if (imageRatio > groupRatio) {
          // image is wider -> fit width
          scaleX = gw / iw;
          scaleY = scaleX;
          x = 0;
          y = (gh - ih * scaleX) / 2;
        } else {
          // image is taller -> fit height
          scaleY = gh / ih;
          scaleX = scaleY;
          x = (gw - iw * scaleY) / 2;
          y = 0;
        }
        break;
      case IMAGE_TEMPLATE_FIT.COVER:
        if (imageRatio > groupRatio) {
          // image is wider -> fit height
          scaleX = gh / ih;
          scaleY = scaleX;
          x = (gw - iw * scaleX) / 2;
          y = 0;
        } else {
          // image is taller -> fit width
          scaleX = gw / iw;
          scaleY = scaleX;
          x = 0;
          y = (gh - ih * scaleX) / 2;
        }
        break;
      case IMAGE_TEMPLATE_FIT.FREE:
        x = 0;
        y = 0;
        scaleX = 1;
        scaleY = 1;
        break;
      default:
        break;
    }

    const handler = this.instance.getNodeHandler<WeaveImageNode>("image");

    if (handler) {
      node.setAttrs({
        x,
        y,
        scaleX,
        scaleY,
        draggable: false,
        listening: false,
      });
      this.instance.updateNode(handler.serialize(node as WeaveElementInstance));
    }

    if (saveOriginalImage) {
      template.setAttrs({ originalImageWidth: iw, originalImageHeight: ih });
    }

    template.setAttrs({
      isUsed: true,
      fit,
    });
    this.instance.updateNode(this.serialize(template as WeaveElementInstance));
  }

  unlink(node: WeaveElementInstance) {
    const imageTemplateNode = node as Konva.Group;
    const attrs = imageTemplateNode.getAttrs();

    const imageHandler = this.instance.getNodeHandler<WeaveImageNode>("image");

    if (!imageHandler) return;

    if (attrs.isUsed) {
      const internalGroup = imageTemplateNode.findOne(
        `#${attrs.id}-imageTemplate-group`
      ) as Konva.Group;

      if (!internalGroup) return;

      const children = internalGroup.getChildren();

      if (children.length === 0) return;

      const imageNode = children[0];

      let layerToMove: Konva.Container | null | undefined =
        imageTemplateNode.getParent();
      if (
        layerToMove &&
        layerToMove.getAttrs().nodeId &&
        !layerToMove.getAttrs().containerId
      ) {
        layerToMove = this.instance
          .getStage()
          .findOne(`#${layerToMove.getAttrs().nodeId}`) as Konva.Container;
      }

      if (!layerToMove) return;

      const layerToMoveAttrs = layerToMove?.getAttrs();
      const actualImageLayer = imageNode.getParent();
      const actualImageLayerAttrs = actualImageLayer?.getAttrs();

      const nodePos = imageNode.getAbsolutePosition();
      const nodeRotation = imageNode.getAbsoluteRotation();

      imageNode.moveTo(layerToMove);
      imageNode.setAbsolutePosition(nodePos);
      imageNode.rotation(nodeRotation);
      imageNode.setAttr("fit", undefined);
      imageNode.setAttr("isUsed", undefined);
      imageNode.setAttr("lockToContainer", undefined);
      imageNode.setAttr("moving", undefined);
      imageNode.draggable(true);
      imageNode.listening(true);
      imageNode.x(
        imageNode.x() - (actualImageLayerAttrs?.containerOffsetX ?? 0)
      );
      imageNode.y(
        imageNode.y() - (actualImageLayerAttrs?.containerOffsetY ?? 0)
      );
      imageHandler.scaleReset(imageNode as Konva.Group);

      const actualNode = imageHandler.serialize(
        imageNode as WeaveElementInstance
      );

      this.instance.removeNode(actualNode);
      this.instance.addNode(actualNode, layerToMoveAttrs?.id);

      imageTemplateNode.setAttr("originalImageWidth", undefined);
      imageTemplateNode.setAttr("originalImageHeight", undefined);
      imageTemplateNode.setAttr("fit", undefined);
      imageTemplateNode.setAttr("isUsed", false);
      imageTemplateNode.setAttr("lockToContainer", false);
      imageTemplateNode.setAttr("moving", false);
      this.instance.updateNode(
        this.serialize(imageTemplateNode as WeaveElementInstance)
      );

      this.getNodesSelectionPlugin()?.setSelectedNodes([imageNode]);
    }
  }

  serialize(instance: WeaveElementInstance): WeaveStateElement {
    const stage = this.instance.getStage();
    const attrs = instance.getAttrs();

    const mainNode = instance as Konva.Group | undefined;

    const frameInternal: Konva.Group | undefined = stage.findOne(
      `#${attrs.containerId}`
    );

    const childrenMapped: WeaveStateElement[] = [];
    if (frameInternal) {
      const children: WeaveElementInstance[] = [
        ...(frameInternal as Konva.Group).getChildren(),
      ];
      for (const node of children) {
        const handler = this.instance.getNodeHandler<WeaveNode>(
          node.getAttr("nodeType")
        );
        if (!handler) {
          continue;
        }
        childrenMapped.push(handler.serialize(node));
      }
    }

    const realAttrs = mainNode?.getAttrs();

    const cleanedAttrs = { ...realAttrs };
    delete cleanedAttrs.draggable;
    delete cleanedAttrs.onTargetEnter;

    return {
      key: realAttrs?.id ?? "",
      type: realAttrs?.nodeType,
      props: {
        ...cleanedAttrs,
        isCloned: undefined,
        isCloneOrigin: undefined,
        id: realAttrs?.id ?? "",
        nodeType: realAttrs?.nodeType,
        children: childrenMapped,
      },
    };
  }
}
