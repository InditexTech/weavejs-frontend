// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
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
} from "./types";
import { IMAGES_TOOL_ACTION_NAME, IMAGES_TOOL_STATE } from "./constants";
import Konva from "konva";

export class ImagesToolAction extends WeaveAction {
  protected initialized: boolean = false;
  protected initialCursor: string | null = null;
  protected state: ImagesToolActionState;
  protected container: Konva.Layer | Konva.Group | undefined;
  protected images: Record<
    string,
    {
      loaded: boolean;
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

    this.initialized = false;
    this.padding = 20;
    this.state = IMAGES_TOOL_STATE.IDLE;
    this.images = {};
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

    stage.on("pointerclick", (e) => {
      e.evt.preventDefault();

      if (this.state === IMAGES_TOOL_STATE.IDLE) {
        return;
      }

      if (this.state === IMAGES_TOOL_STATE.UPLOADING) {
        return;
      }

      if (this.state === IMAGES_TOOL_STATE.ADDING) {
        this.handleAdding();
        return;
      }
    });

    this.initialized = true;
  }

  private setState(state: ImagesToolActionState) {
    this.state = state;
  }

  private loadImage(imageURL: string) {
    const imageId = uuidv4();
    this.images[imageId] = {
      loaded: false,
      imageURL,
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

    this.preloadImgs[imageId].src = imageURL;
  }

  private allImagesLoaded(): boolean {
    return Object.values(this.images).every((image) => image.loaded);
  }

  private addImages(position?: Vector2d) {
    const stage = this.instance.getStage();

    stage.container().style.cursor = "crosshair";
    stage.container().focus();

    if (position) {
      this.handleAdding(position);
      this.setState(IMAGES_TOOL_STATE.ADDING);
      return;
    }

    this.clickPoint = null;
    this.setState(IMAGES_TOOL_STATE.ADDING);
  }

  private handleAdding(position?: Vector2d) {
    const { mousePoint, container } = this.instance.getMousePointer(position);

    this.clickPoint = mousePoint;
    this.container = container as Konva.Layer | Konva.Group;

    const imagePoint = {
      x: this.clickPoint?.x ?? 0,
      y: this.clickPoint?.y ?? 0,
    };

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
          imageWidth: imageInfo.info.width,
          imageHeight: imageInfo.info.height,
          imageInfo: {
            width: imageInfo.info.width,
            height: imageInfo.info.height,
          },
        });

        this.instance.addNode(node, this.container?.getAttrs().id);
      }

      imagePoint.x += imageInfo.info.width + this.padding;
    }

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

    for (const imageURL of params.imagesURLs) {
      this.loadImage(imageURL);
    }
  }

  cleanup(): void {
    const stage = this.instance.getStage();

    for (const imageId in Object.keys(this.images)) {
      delete this.preloadImgs[imageId];
    }

    const selectionPlugin =
      this.instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
    if (selectionPlugin && Object.keys(this.images).length > 0) {
      const imageKey = Object.keys(this.images)[0];
      const node = stage.findOne(`#${imageKey}`);
      if (node) {
        selectionPlugin.setSelectedNodes([node]);
      }
      this.instance.triggerAction("selectionTool");
    }

    stage.container().style.cursor = "default";

    this.initialCursor = null;
    this.images = {};
    this.container = undefined;
    this.clickPoint = null;
    this.setState(IMAGES_TOOL_STATE.IDLE);
  }
}
