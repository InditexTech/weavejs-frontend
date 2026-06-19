// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { WeaveNode, WeaveImageNode } from "@inditextech/weave-sdk";
import {
  WeaveElementAttributes,
  WeaveElementInstance,
  WEAVE_TRANSFORMER_ANCHORS,
} from "@inditextech/weave-types";
import Konva from "konva";
import {
  IMAGE_WITH_TITLE_DEFAULTS,
  IMAGE_WITH_TITLE_EDITION_DEFAULTS,
  IMAGE_WITH_TITLE_NODE_TYPE,
  IMAGE_WITH_TITLE_TITLE_GAP,
} from "./constants";
import { GroupImageWithTitle } from "./group-image-with-title";

export class ImageWithTitleNode extends WeaveNode {
  protected nodeType = IMAGE_WITH_TITLE_NODE_TYPE;
  initialize = undefined;

  onRender(props: WeaveElementAttributes): WeaveElementInstance {
    const { id } = props;

    const nodeParams = { ...props };
    delete nodeParams.zIndex;

    const fontFamily =
      (props.fontFamily as string) ?? IMAGE_WITH_TITLE_DEFAULTS.fontFamily;
    const fontColor =
      (props.fontColor as string) ?? IMAGE_WITH_TITLE_DEFAULTS.fontColor;

    const group = new GroupImageWithTitle({
      ...nodeParams,
      nodeType: IMAGE_WITH_TITLE_NODE_TYPE,
      name: "node",
    });

    this.setupDefaultNodeAugmentation(group);

    const stage = this.instance.getStage();
    const scale = stage.scaleX();

    const title = new Konva.Text({
      id: `${id}-title`,
      x: 0,
      y: 0,
      text: (props.title as string) ?? "",
      width: (props.width as number) ?? 0,
      realFontSize:
        (props.fontSize as number) ?? IMAGE_WITH_TITLE_DEFAULTS.fontSize,
      fontSize:
        ((props.fontSize as number) ?? IMAGE_WITH_TITLE_DEFAULTS.fontSize) *
        (1 / scale),
      fontFamily,
      fill: fontColor,
      wrap: "none",
      ellipsis: true,
      strokeEnabled: false,
      listening: true,
      draggable: false,
    });

    title.on("pointerdblclick", () => {
      const id = group.getAttrs().id ?? "";

      const textPosition = title.absolutePosition();
      const stage = title.getStage();

      if (!stage) {
        return;
      }

      const imageInstance = group.findOne(`#${id}-img`) as
        | Konva.Group
        | undefined;

      if (!imageInstance) {
        return;
      }

      const scale = stage.scaleX();
      const container = stage.container();

      const input = document.createElement("input");
      container.appendChild(input);

      input.id = `${id}-title-input`;
      input.value = title.text();
      input.style.position = "absolute";
      input.style.top = `${textPosition.y - IMAGE_WITH_TITLE_EDITION_DEFAULTS.borderWidth - IMAGE_WITH_TITLE_EDITION_DEFAULTS.padding}px`;
      input.style.left = `${textPosition.x - IMAGE_WITH_TITLE_EDITION_DEFAULTS.borderWidth - IMAGE_WITH_TITLE_EDITION_DEFAULTS.padding}px`;
      input.style.width = `${imageInstance.width() * scale + IMAGE_WITH_TITLE_EDITION_DEFAULTS.borderWidth * 2 + IMAGE_WITH_TITLE_EDITION_DEFAULTS.padding + 2}px`;
      input.style.height = `${title.height() * scale + IMAGE_WITH_TITLE_EDITION_DEFAULTS.borderWidth * 2 + IMAGE_WITH_TITLE_EDITION_DEFAULTS.padding + 2}px`;
      input.style.fontSize = `${title.fontSize() * scale}px`;
      input.style.fontFamily = title.fontFamily();
      input.style.lineHeight = `${title.lineHeight()}`;
      input.style.padding = `${IMAGE_WITH_TITLE_EDITION_DEFAULTS.padding}px`;
      input.style.margin = "0px";
      input.style.border = `${IMAGE_WITH_TITLE_EDITION_DEFAULTS.borderWidth}px solid #000`;
      input.style.outline = "none";
      input.style.resize = "none";
      input.style.overflow = "hidden";
      input.style.background = "transparent";
      input.style.transformOrigin = "left top";
      input.style.transform = `rotate(${title.rotation()}deg)`;

      title.setAttrs({ isEditing: true });
      title.hide();

      input.focus({ preventScroll: true });
      input.select();

      let saveOnBlur = true;
      const originalText = title.text();

      const handleKeydown = (e: KeyboardEvent) => {
        e.stopPropagation();

        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          saveOnBlur = true;
          input.blur();
          return;
        }

        if (e.key === "Escape") {
          e.preventDefault();
          saveOnBlur = false;
          input.blur();
        }
      };

      const finishEdit = () => {
        group.setAttrs({
          title: input.value,
        });

        title.setAttrs({ isEditing: undefined });
        title.text(!saveOnBlur ? originalText : input.value);
        title.show();

        this.getNodesSelectionPlugin()?.setSelectedNodes([group]);

        if (saveOnBlur) {
          this.instance.updateNode(
            this.serialize(group as WeaveElementInstance),
          );
        }

        input.removeEventListener("keydown", handleKeydownBound);
        input.addEventListener("blur", handleBlurBound);
        input?.remove();
      };

      const handleKeydownBound = handleKeydown.bind(this);
      const handleBlurBound = finishEdit.bind(this);

      input.addEventListener("keydown", handleKeydownBound);
      input.addEventListener("blur", handleBlurBound);

      this.getNodesSelectionPlugin()?.setSelectedNodes([]);
    });

    const textSize = title.measureSize(props.title);

    title.setAttrs({
      width: props.width as number,
      height: textSize.height,
      x: 0,
      y: -textSize.height - IMAGE_WITH_TITLE_TITLE_GAP / scale,
    });

    group.add(title);

    const imageHandler = this.instance.getNodeHandler<WeaveImageNode>("image");
    if (imageHandler) {
      const imageInstance = imageHandler.onRender({
        ...props,
        id: `${id}-img`,
        nodeType: "image",
        x: 0,
        y: 0,
        imageURL: props.imageURL,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        name: undefined,
      }) as Konva.Group;

      imageInstance.setAttr("name", undefined);

      group.add(imageInstance);
    }

    title.moveToTop();

    this.setupDefaultNodeEvents(group);

    group.on("transformstart", () => {
      const id = group.getAttrs().id ?? "";
      const titleInstance = group.findOne(`#${id}-title`) as
        | Konva.Text
        | undefined;
      if (titleInstance) {
        titleInstance.setAttrs({
          visible: false,
        });
      }
    });

    group.on("transformend", () => {
      const id = group.getAttrs().id ?? "";

      const imageHandler =
        this.instance.getNodeHandler<WeaveImageNode>("image");

      if (imageHandler) {
        const imageInstance = group.findOne(`#${id}-img`) as
          | Konva.Group
          | undefined;
        if (imageInstance) {
          const actualProps = group.getAttrs();

          imageHandler.onUpdate(imageInstance as WeaveElementInstance, {
            ...imageInstance.getAttrs(),
            ...actualProps,
            id: imageInstance.getAttrs().id,
            nodeType: imageInstance.getAttrs().nodeType,
            x: 0,
            y: 0,
            uncroppedImage: {
              width: actualProps.width,
              height: actualProps.height,
            },
          });

          group.setAttrs({
            uncroppedImage: {
              width: actualProps.width,
              height: actualProps.height,
            },
          });

          this.instance.updateNode(
            this.serialize(group as WeaveElementInstance),
          );

          this.getNodesSelectionPlugin()?.getTransformer().forceUpdate();
          this.getNodesSelectionPlugin()?.getHoverTransformer().forceUpdate();
        }
      }

      const titleInstance = group.findOne(`#${id}-title`) as
        | Konva.Text
        | undefined;

      if (titleInstance) {
        titleInstance.setAttrs({
          visible: true,
        });
      }
    });

    const onZoomChangeHandler = () => {
      const imageInstance = group.findOne(`#${id}-img`) as
        | Konva.Group
        | undefined;

      const titleInstance = group.findOne(`#${id}-title`) as
        | Konva.Text
        | undefined;

      if (imageInstance && titleInstance) {
        const imageAttrs = imageInstance.getAttrs();
        const titleAttrs = titleInstance.getAttrs();
        const stage = this.instance.getStage();
        const scale = stage.scaleX();

        titleInstance.setAttrs({
          fontSize: titleAttrs.realFontSize * (1 / scale),
        });

        const textSize = titleInstance.measureSize(titleAttrs.title);

        titleInstance.setAttrs({
          width: imageAttrs.width as number,
          height: textSize.height,
          x: 0,
          y: -textSize.height - IMAGE_WITH_TITLE_TITLE_GAP / scale,
          listening: true,
          draggable: false,
        });
      }
    };
    this.instance.addEventListener("onZoomChange", onZoomChangeHandler);

    const onStageMoveHandler = () => {
      const id = group.getAttrs().id ?? "";

      const titleInstance = group.findOne(`#${id}-title`) as
        | Konva.Text
        | undefined;

      if (titleInstance && titleInstance.getAttrs().isEditing) {
        const textPosition = titleInstance.absolutePosition();
        const input = document.getElementById(`${id}-title-input`);
        if (input) {
          input.style.top = `${textPosition.y - IMAGE_WITH_TITLE_EDITION_DEFAULTS.borderWidth - IMAGE_WITH_TITLE_EDITION_DEFAULTS.padding}px`;
          input.style.left = `${textPosition.x - IMAGE_WITH_TITLE_EDITION_DEFAULTS.borderWidth - IMAGE_WITH_TITLE_EDITION_DEFAULTS.padding}px`;
        }
      }
    };
    this.instance.addEventListener("onStageMove", onStageMoveHandler);

    group.allowedAnchors = () => [
      WEAVE_TRANSFORMER_ANCHORS.TOP_LEFT,
      WEAVE_TRANSFORMER_ANCHORS.TOP_RIGHT,
      WEAVE_TRANSFORMER_ANCHORS.BOTTOM_LEFT,
      WEAVE_TRANSFORMER_ANCHORS.BOTTOM_RIGHT,
    ];

    group.getTransformerProperties = () => ({
      ...this.defaultGetTransformerProperties({}),
      keepRatio: true,
      rotateEnabled: false,
    });

    return group;
  }

  onUpdate(
    nodeInstance: WeaveElementInstance,
    nextProps: WeaveElementAttributes,
  ): void {
    const nodeInstanceZIndex = nodeInstance.zIndex();

    const fontFamily =
      (nextProps.fontFamily as string) ?? IMAGE_WITH_TITLE_DEFAULTS.fontFamily;
    const fontColor =
      (nextProps.fontColor as string) ?? IMAGE_WITH_TITLE_DEFAULTS.fontColor;

    nodeInstance.setAttrs({
      ...nextProps,
      zIndex: nodeInstanceZIndex,
    });

    const group = nodeInstance as Konva.Group;

    const titleText = group.findOne(`#${nextProps.id}-title`) as
      | Konva.Text
      | undefined;
    if (titleText) {
      const stage = this.instance.getStage();
      const scale = stage.scaleX();

      titleText.setAttrs({
        text: (nextProps.title as string) ?? "",
        fontSize:
          ((nextProps.fontSize as number) ??
            IMAGE_WITH_TITLE_DEFAULTS.fontSize) *
          (1 / scale),
        fontFamily,
        fill: fontColor,
      });

      const textSize = titleText.measureSize(nextProps.title);

      titleText.setAttrs({
        width:
          textSize.width > (nextProps.width as number)
            ? (nextProps.width as number)
            : textSize.width,
        height: textSize.height,
        x: 0,
        y: -textSize.height - IMAGE_WITH_TITLE_TITLE_GAP / scale,
        listening: true,
        draggable: false,
      });
    }

    const imageHandler = this.instance.getNodeHandler<WeaveImageNode>("image");
    if (imageHandler) {
      const imageInstance = group.findOne(`#${nextProps.id}-img`) as
        | Konva.Group
        | undefined;
      if (imageInstance) {
        imageHandler.onUpdate(imageInstance as WeaveElementInstance, {
          ...imageInstance.getAttrs(),
          ...nextProps,
          id: imageInstance.getAttrs().id,
          nodeType: imageInstance.getAttrs().nodeType,
          x: 0,
          y: 0,
          imageURL: nextProps.imageURL,
          uncroppedImage: {
            width: nextProps.width,
            height: nextProps.height,
          },
          scaleX: 1,
          scaleY: 1,
          opacity: nextProps.opacity ?? 1,
        });

        imageInstance.setAttr("name", undefined);
      }
    }
  }
}
