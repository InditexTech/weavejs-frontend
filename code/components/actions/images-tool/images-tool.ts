// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import Konva from "konva";
import { type Vector2d } from "konva/lib/types";
import {
  WeaveAction,
  WeaveImageNode,
  WeaveNodesSelectionPlugin,
} from "@inditextech/weave-sdk";
import {
  type ImagesToolActionTriggerParams,
  type ImagesToolActionState,
  type ImagesToolActionOnEndLoadImageEvent,
  ImageInfo,
  ImagesToolActionOnAddedImageEvent,
  ImagesToolActionOnAddingImageEvent,
} from "./types";
import { IMAGES_TOOL_ACTION_NAME, IMAGES_TOOL_STATE } from "./constants";

export class ImagesToolAction extends WeaveAction {
  protected initialized: boolean = false;
  protected initialCursor: string | null = null;
  protected cursorPadding: number = 5;
  protected state: ImagesToolActionState;
  protected tempImageId: string | null;
  protected tempImageNode: Konva.Group | null;
  protected pointers: Map<number, Vector2d>;
  protected container: Konva.Layer | Konva.Group | undefined;
  protected images: Record<
    string,
    {
      loaded: boolean;
      imageId: string;
      imageURL: string;
      info: { width: number; height: number };
    }
  >;
  protected padding: number;
  protected preloadImgs: Record<string, HTMLImageElement>;
  protected clickPoint: Vector2d | null;
  protected cancelAction!: () => void;
  onPropsChange = undefined;
  update = undefined;

  constructor() {
    super();

    this.pointers = new Map<number, Vector2d>();
    this.initialized = false;
    this.padding = 20;
    this.state = IMAGES_TOOL_STATE.IDLE;
    this.images = {};
    this.tempImageId = null;
    this.tempImageNode = null;
    this.container = undefined;
    this.preloadImgs = {};
    this.clickPoint = null;
  }

  getName(): string {
    return IMAGES_TOOL_ACTION_NAME;
  }

  getPreloadedImage(imageId: string): HTMLImageElement | undefined {
    return this.preloadImgs?.[imageId];
  }

  initProps() {
    return {
      width: 100,
      height: 100,
      scaleX: 1,
      scaleY: 1,
    };
  }

  onInit(): void {
    this.instance.addEventListener("onStageDrop", (e) => {
      if (window.weaveDragImageURL) {
        this.instance.getStage().setPointersPositions(e);
        const position = this.instance.getStage().getRelativePointerPosition();
        this.instance.triggerAction("imageTool", {
          imageURL: window.weaveDragImageURL,
          position,
        });
        window.weaveDragImageURL = undefined;
      }
    });
  }

  private setupEvents() {
    const stage = this.instance.getStage();

    stage.container().addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        this.instance.getActiveAction() === IMAGES_TOOL_ACTION_NAME
      ) {
        this.cancelAction();
        return;
      }
    });

    stage.on("pointerdown", (e) => {
      this.setTapStart(e);

      this.pointers.set(e.evt.pointerId, {
        x: e.evt.clientX,
        y: e.evt.clientY,
      });

      if (
        this.pointers.size === 2 &&
        this.instance.getActiveAction() === IMAGES_TOOL_ACTION_NAME
      ) {
        this.state = IMAGES_TOOL_STATE.DEFINING_POSITION;
        return;
      }

      if (this.state === IMAGES_TOOL_STATE.DEFINING_POSITION) {
        this.state = IMAGES_TOOL_STATE.SELECTED_POSITION;
      }
    });

    stage.on("pointermove", (e) => {
      if (
        this.pointers.size === 2 &&
        this.instance.getActiveAction() === IMAGES_TOOL_ACTION_NAME
      ) {
        this.state = IMAGES_TOOL_STATE.DEFINING_POSITION;
        return;
      }

      if (
        [
          IMAGES_TOOL_STATE.DEFINING_POSITION as string,
          IMAGES_TOOL_STATE.SELECTED_POSITION as string,
        ].includes(this.state) &&
        this.instance.getActiveAction() === IMAGES_TOOL_ACTION_NAME &&
        e.evt.pointerType === "mouse"
      ) {
        stage.container().style.cursor = "crosshair";
        stage.container().focus();

        const mousePos = stage.getRelativePointerPosition();

        this.tempImageNode.setAttrs({
          x: (mousePos?.x ?? 0) + this.cursorPadding,
          y: (mousePos?.y ?? 0) + this.cursorPadding,
        });
      }
    });

    stage.on("pointerup", (e) => {
      this.pointers.delete(e.evt.pointerId);

      if (this.state === IMAGES_TOOL_STATE.SELECTED_POSITION) {
        this.handleAdding();
      }
    });

    this.initialized = true;
  }

  private setState(state: ImagesToolActionState) {
    this.state = state;
  }

  private loadImage(imageInfo: ImageInfo) {
    const imageId = uuidv4();
    this.images[imageId] = {
      loaded: false,
      imageId: imageInfo.imageId,
      imageURL: imageInfo.url,
      info: { width: 0, height: 0 },
    };

    this.preloadImgs[imageId] = new Image();
    this.preloadImgs[imageId].crossOrigin = "anonymous";
    this.preloadImgs[imageId].onerror = () => {
      this.instance.emitEvent<ImagesToolActionOnEndLoadImageEvent>(
        "onImageLoadEnd",
        new Error("Error loading image")
      );
      this.cancelAction();
    };
    this.preloadImgs[imageId].onload = () => {
      this.instance.emitEvent<ImagesToolActionOnEndLoadImageEvent>(
        "onImageLoadEnd",
        undefined
      );

      this.images[imageId].loaded = true;
      this.images[imageId].info = {
        width: this.preloadImgs[imageId].width,
        height: this.preloadImgs[imageId].height,
      };

      this.instance.emitEvent("imageLoaded");
    };

    this.preloadImgs[imageId].src = imageInfo.url;
  }

  private allImagesLoaded(): boolean {
    return Object.values(this.images).every((image) => image.loaded);
  }

  private addImages(position?: Vector2d) {
    const stage = this.instance.getStage();

    stage.container().style.cursor = "crosshair";
    stage.container().focus();

    if (position) {
      this.setState(IMAGES_TOOL_STATE.SELECTED_POSITION);
      this.handleAdding(position);
      return;
    }

    const images = [];
    for (const imageId of Object.keys(this.images)) {
      images.push(this.images[imageId].imageURL);
    }

    if (!this.tempImageNode && !this.isTouchDevice()) {
      const mousePos = stage.getRelativePointerPosition();

      this.tempImageId = uuidv4();

      this.tempImageNode = new Konva.Group({
        id: this.tempImageId,
        x: (mousePos?.x ?? 0) + this.cursorPadding,
        y: (mousePos?.y ?? 0) + this.cursorPadding,
        opacity: 1,
        listening: false,
      });

      const bgNode = new Konva.Circle({
        radius: 10 * (1 / stage.scaleX()),
        x: 10 * (1 / stage.scaleX()),
        y: 10 * (1 / stage.scaleX()),
        fill: "#c9c9c9",
        stroke: "#000000",
        strokeWidth: 0,
        strokeScaleEnabled: false,
      });

      this.tempImageNode.add(bgNode);

      const textNode = new Konva.Text({
        x: 0,
        y: 0,
        width: 20 * (1 / stage.scaleX()),
        height: 20 * (1 / stage.scaleY()),
        align: "center",
        verticalAlign: "middle",
        fill: "#000000",
        fontSize: 12 * (1 / stage.scaleX()),
        fontFamily: "Arial",
        text: images.length,
      });

      this.tempImageNode.add(textNode);

      this.instance.getMainLayer()?.add(this.tempImageNode);
    }

    this.instance.emitEvent<ImagesToolActionOnAddingImageEvent>(
      "onAddingImages",
      { imagesURL: images }
    );

    this.clickPoint = null;
    this.setState(IMAGES_TOOL_STATE.DEFINING_POSITION);
  }

  private isTouchDevice() {
    return window.matchMedia("(pointer: coarse)").matches;
  }

  private handleAdding(position?: Vector2d) {
    const { mousePoint, container } = this.instance.getMousePointer(position);

    this.clickPoint = mousePoint;
    this.container = container as Konva.Layer | Konva.Group;

    const imagePoint = {
      x: this.clickPoint?.x ?? 0,
      y: this.clickPoint?.y ?? 0,
    };

    const images = [];
    for (const imageId of Object.keys(this.images)) {
      const imageInfo = this.images[imageId];

      const nodeHandler = this.instance.getNodeHandler<WeaveImageNode>("image");

      if (nodeHandler) {
        const node = nodeHandler.create(imageId, {
          ...this.props,
          x: imagePoint.x,
          y: imagePoint.y,
          opacity: 1,
          adding: false,
          imageURL: imageInfo.imageURL,
          stroke: "#000000ff",
          strokeWidth: 0,
          strokeScaleEnabled: true,
          imageId: imageInfo.imageId,
          imageWidth: imageInfo.info.width,
          imageHeight: imageInfo.info.height,
          imageInfo: {
            width: imageInfo.info.width,
            height: imageInfo.info.height,
          },
        });

        this.instance.addNode(node, this.container?.getAttrs().id);

        images.push(imageInfo.imageURL);
      }

      imagePoint.x += imageInfo.info.width + this.padding;
    }

    this.instance.emitEvent<ImagesToolActionOnAddedImageEvent>(
      "onAddedImages",
      { imagesURL: images }
    );

    this.setState(IMAGES_TOOL_STATE.FINISHED);

    this.cancelAction();
  }

  trigger(
    cancelAction: () => void,
    params: ImagesToolActionTriggerParams
  ): void {
    if (!this.instance) {
      throw new Error("Instance not defined");
    }

    if (!this.initialized) {
      this.setupEvents();
    }

    this.cancelAction = cancelAction;

    const selectionPlugin =
      this.instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
    if (selectionPlugin) {
      selectionPlugin.setSelectedNodes([]);
    }

    this.instance.addEventListener("imageLoaded", () => {
      if (this.allImagesLoaded()) {
        this.addImages(params?.position);
      }
    });

    this.padding = params?.padding ?? 20;

    for (const imageInfo of params?.images ?? []) {
      this.loadImage(imageInfo);
    }
  }

  cleanup(): void {
    const stage = this.instance.getStage();

    for (const imageId in Object.keys(this.images)) {
      delete this.preloadImgs[imageId];
    }

    if (this.tempImageNode) {
      this.tempImageNode.destroy();
    }

    const selectionPlugin =
      this.instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
    if (selectionPlugin && Object.keys(this.images).length > 0) {
      const nodes: Konva.Node[] = [];
      for (const imageKey of Object.keys(this.images)) {
        const node = stage.findOne(`#${imageKey}`);
        if (node) {
          nodes.push(node);
        }
      }
      if (nodes.length > 0) {
        selectionPlugin.setSelectedNodes(nodes);
      }
      this.instance.triggerAction("selectionTool");
    }

    stage.container().style.cursor = "default";

    this.initialCursor = null;
    this.images = {};
    this.tempImageId = null;
    this.tempImageNode = null;
    this.container = undefined;
    this.clickPoint = null;
    this.setState(IMAGES_TOOL_STATE.IDLE);
  }
}
