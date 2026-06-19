// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import Konva from "konva";
import {
  downscaleImageFile,
  getImageSizeFromFile,
  mergeExceptArrays,
  SELECTION_TOOL_ACTION_NAME,
  WeaveAction,
  WeaveNodesSelectionPlugin,
} from "@inditextech/weave-sdk";
import type {
  ImageToolActionData,
  WeaveImageFile,
  WeaveImageNode,
  WeaveImageToolActionTriggerParams,
  WeaveImageToolActionTriggerReturn,
} from "@inditextech/weave-sdk";
import type { WeaveElementInstance } from "@inditextech/weave-types";
import { ImageWithTitleNode } from "@/components/nodes/image-with-title/image-with-title";
import {
  IMAGE_WITH_TITLE_ACTION_NAME,
  IMAGE_WITH_TITLE_TOOL_CONFIG_DEFAULT,
  IMAGE_WITH_TITLE_TOOL_STATE,
  IMAGE_WITH_TITLE_TOOL_UPLOAD_TYPE,
} from "./constants";
import {
  IMAGE_WITH_TITLE_DEFAULTS,
  IMAGE_WITH_TITLE_NODE_TYPE,
} from "@/components/nodes/image-with-title/constants";
import {
  ImageWithTitleToolActionConfig,
  ImageWithTitleToolActionParams,
  ImageWithTitleToolActionState,
} from "./types";

export class ImageWithTitleToolAction extends WeaveAction {
  protected readonly config: ImageWithTitleToolActionConfig;
  protected initialized: boolean = false;
  protected cancelAction!: () => void;
  private ignoreKeyboardEvents: boolean = false;
  private ignorePointerEvents: boolean = false;
  protected state!: ImageWithTitleToolActionState;
  protected imageAction: Record<string, ImageToolActionData> = {};
  protected pointers!: Map<number, Konva.Vector2d>;
  private imageId?: string;
  onInit = undefined;
  onPropsChange = undefined;
  onDestroy = undefined;

  constructor(params?: ImageWithTitleToolActionParams) {
    super();

    this.config = mergeExceptArrays(
      IMAGE_WITH_TITLE_TOOL_CONFIG_DEFAULT,
      params?.config ?? {},
    );

    this.initialize();
  }

  initialize() {
    this.pointers = new Map<number, Konva.Vector2d>();
    this.state = IMAGE_WITH_TITLE_TOOL_STATE.IDLE;
    this.imageId = undefined;
    this.initialized = false;
  }

  initProps() {
    return {
      width: 100,
      height: 100,
      scaleX: 1,
      scaleY: 1,
    };
  }

  getName(): string {
    return IMAGE_WITH_TITLE_ACTION_NAME;
  }

  private setupEvents() {
    const stage = this.instance.getStage();

    window.addEventListener(
      "keydown",
      (e) => {
        if (
          e.code === "Escape" &&
          this.instance.getActiveAction() === IMAGE_WITH_TITLE_ACTION_NAME &&
          !this.ignoreKeyboardEvents
        ) {
          this.cancelAction();
          return;
        }
      },
      { signal: this.instance.getEventsController().signal },
    );

    stage.on("pointerdown", (e) => {
      this.setTapStart(e);

      if (this.ignorePointerEvents) {
        return;
      }

      this.pointers.set(e.evt.pointerId, {
        x: e.evt.clientX,
        y: e.evt.clientY,
      });

      if (
        this.pointers.size === 2 &&
        this.instance.getActiveAction() === IMAGE_WITH_TITLE_ACTION_NAME
      ) {
        this.state = IMAGE_WITH_TITLE_TOOL_STATE.DEFINING_POSITION;
        return;
      }

      if (this.state === IMAGE_WITH_TITLE_TOOL_STATE.DEFINING_POSITION) {
        this.state = IMAGE_WITH_TITLE_TOOL_STATE.SELECTED_POSITION;
      }
    });

    stage.on("pointerup", (e) => {
      if (this.ignorePointerEvents) {
        return;
      }

      this.pointers.delete(e.evt.pointerId);

      if (this.state === IMAGE_WITH_TITLE_TOOL_STATE.SELECTED_POSITION) {
        this.handleAdding(this.imageId ?? "");
      }
    });

    this.initialized = true;
  }

  override trigger(
    cancelAction: () => void,
    params: WeaveImageToolActionTriggerParams,
  ): WeaveImageToolActionTriggerReturn {
    if (!this.instance) {
      throw new Error("Instance not defined");
    }

    if (!this.initialized) {
      this.setupEvents();
    }

    this.cancelAction = cancelAction;

    const nodeId = params?.nodeId ?? uuidv4();

    this.imageId = nodeId;

    this.imageAction[nodeId] = {
      props: this.initProps(),
      imageId: nodeId,
      clickPoint: null,
      imageFile: null,
      imageURL: null,
      imageFallbackURL: null,
      container: params?.container,
      forceMainContainer: params?.forceMainContainer ?? false,
      uploadType: null,
      uploadImageFunction: null,
    };

    if (params?.imageId) {
      this.imageAction[nodeId].imageId = params.imageId;
    }

    if (this.forceExecution) {
      this.ignorePointerEvents = true;
      this.ignoreKeyboardEvents = true;
    }

    if (params?.position) {
      this.setState(IMAGE_WITH_TITLE_TOOL_STATE.SELECTED_POSITION);
    }

    if (
      params.type === IMAGE_WITH_TITLE_TOOL_UPLOAD_TYPE.FILE &&
      params.image
    ) {
      this.imageAction[nodeId].uploadType =
        IMAGE_WITH_TITLE_TOOL_UPLOAD_TYPE.FILE;
      this.imageAction[nodeId].imageFile = params.image;
      this.imageAction[nodeId].uploadImageFunction = params.uploadImageFunction;
      this.loadImage(nodeId, {
        type: IMAGE_WITH_TITLE_TOOL_UPLOAD_TYPE.FILE,
        image: params.image,
        position: params?.position,
      });
    }

    return {
      nodeId,
    };
  }

  private getImageNodeHandler() {
    return this.instance.getNodeHandler<WeaveImageNode>("image");
  }

  private async loadImage(
    nodeId: string,
    params: {
      type: typeof IMAGE_WITH_TITLE_TOOL_UPLOAD_TYPE.FILE;
      image: WeaveImageFile;
      position?: Konva.Vector2d;
    },
  ) {
    const imageNodeHandler = this.getImageNodeHandler();

    if (!imageNodeHandler) {
      return;
    }

    if (params.type === IMAGE_WITH_TITLE_TOOL_UPLOAD_TYPE.FILE) {
      const image = params.image;

      const realImageSize = await getImageSizeFromFile(image.file);
      const downscaledImage = await downscaleImageFile(
        image.file,
        image.downscaleRatio,
      );

      try {
        const dataURL = await this.getDataURL(downscaledImage);

        this.imageAction[nodeId].props = {
          ...this.imageAction[nodeId].props,
          ...(this.imageAction[nodeId].imageId && {
            imageId: this.imageAction[nodeId].imageId,
          }),
          imageURL: undefined,
          imageFallbackURL: dataURL,
          width: realImageSize.width,
          height: realImageSize.height,
        };

        const imageNodeHandler = this.getImageNodeHandler();

        if (!imageNodeHandler) {
          return;
        }

        imageNodeHandler.saveImageFallback(
          this.imageAction[nodeId].props,
          dataURL,
        );

        imageNodeHandler.cacheImageFallbackURL(
          this.imageAction[nodeId].props,
          dataURL,
        );

        this.addImageNode(nodeId, params?.position);
      } catch {
        this.cancelAction();
      }
    }
  }

  private async addImageNode(nodeId: string, position?: Konva.Vector2d) {
    if (this.imageAction[nodeId]) {
      const imageSource = await this.getImageSource(nodeId);

      if (!imageSource) {
        this.cancelAction();
        return;
      }

      this.imageAction[nodeId].clickPoint = null;
    }

    if (position) {
      await this.handleAdding(nodeId, position);
      return;
    }

    this.setCursor();
    this.setState(IMAGE_WITH_TITLE_TOOL_STATE.DEFINING_POSITION);
  }

  private setState(state: ImageWithTitleToolActionState) {
    this.state = state;
  }

  private async handleAdding(nodeId: string, position?: Konva.Vector2d) {
    const { mousePoint, container } = this.instance.getMousePointer(position);

    this.imageAction[nodeId].clickPoint = mousePoint;
    this.imageAction[nodeId].container =
      this.imageAction[nodeId].container ?? container;

    const compositeHandler = this.instance.getNodeHandler<ImageWithTitleNode>(
      IMAGE_WITH_TITLE_NODE_TYPE,
    );
    if (!compositeHandler) return;

    const imageSource = await this.getImageSource(nodeId);

    const imageWidth = this.imageAction[nodeId].props.width
      ? this.imageAction[nodeId].props.width
      : imageSource?.width;
    const imageHeight = this.imageAction[nodeId].props.height
      ? this.imageAction[nodeId].props.height
      : imageSource?.height;

    const node = compositeHandler.create(nodeId, {
      ...this.imageAction[nodeId].props,
      x: this.imageAction[nodeId].clickPoint.x,
      y: this.imageAction[nodeId].clickPoint.y,
      imageWidth,
      imageHeight,
      imageInfo: {
        width: imageWidth,
        height: imageHeight,
      },
      uncroppedImage: {
        width: imageWidth,
        height: imageHeight,
      },
      title: "This is an example of a long title that should be truncated",
      fontSize: IMAGE_WITH_TITLE_DEFAULTS.fontSize,
      fontFamily: IMAGE_WITH_TITLE_DEFAULTS.fontFamily,
      fontColor: IMAGE_WITH_TITLE_DEFAULTS.fontColor,
      opacity: 1,
    });

    this.instance.addNode(
      node,
      this.imageAction[nodeId].container?.getAttrs().id,
    );

    const { uploadType } = this.imageAction[nodeId];

    if (uploadType === IMAGE_WITH_TITLE_TOOL_UPLOAD_TYPE.FILE) {
      const uploadImageFunctionInternal = async (
        imageActionData: ImageToolActionData,
      ) => {
        const { uploadImageFunction, imageFile } = imageActionData;
        try {
          const imageURL = await uploadImageFunction?.(
            imageFile!.file,
            this.imageAction[nodeId].imageId!,
          );

          if (!imageURL) {
            return;
          }

          this.saveImageUrl(nodeId, imageURL);
        } catch (error) {
          console.error("Error uploading image", error);
        }
      };

      uploadImageFunctionInternal(this.imageAction[nodeId]);
    }

    this.setState(IMAGE_WITH_TITLE_TOOL_STATE.FINISHED);

    this.cancelAction();
  }

  cleanup(): void {
    const stage = this.instance.getStage();

    const selectionPlugin =
      this.instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
    if (selectionPlugin) {
      const node = stage.findOne(`#${this.imageId}`);
      if (node) {
        selectionPlugin.setSelectedNodes([node]);
      }
      this.instance.triggerAction(SELECTION_TOOL_ACTION_NAME);
    }

    stage.container().style.cursor = "default";

    this.imageId = undefined;
    this.setState(IMAGE_WITH_TITLE_TOOL_STATE.IDLE);
  }

  private loadImageDataURL(imageDataURL: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const imageEle = Konva.Util.createImageElement();
      imageEle.onerror = (error) => {
        reject(error);
      };

      imageEle.onload = async () => {
        resolve(imageEle);
      };

      imageEle.src = imageDataURL;
    });
  }

  getDataURL(blob: Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error("Failed to generate dataURL from file"));
      };
      reader.readAsDataURL(blob);
    });
  }

  saveImageUrl(nodeId: string, imageURL: string) {
    const stage = this.instance.getStage();

    const nodeHandler = this.instance.getNodeHandler<WeaveImageNode>("image");
    const node = stage.findOne(`#${nodeId}`);

    if (nodeHandler && node) {
      node.setAttr("imageURL", imageURL);
      nodeHandler.forceLoadImage(node as WeaveElementInstance);
      this.instance.updateNode(
        nodeHandler.serialize(node as WeaveElementInstance),
        { origin: "system" },
      );
    }
  }

  private async getImageSource(nodeId: string) {
    const imageNodeHandler = this.getImageNodeHandler();

    if (!imageNodeHandler) {
      return undefined;
    }

    let imageSource = imageNodeHandler.getImageSource(`${nodeId}-img`);
    const imageFallbackId = imageNodeHandler.getImageFallbackId(
      this.imageAction[nodeId].props,
    );
    if (
      this.imageAction[nodeId].props.imageFallbackURL &&
      !imageNodeHandler.isImageFallbackEnabled()
    ) {
      imageSource ??= await this.loadImageDataURL(
        this.imageAction[nodeId].props.imageFallbackURL,
      );
    }
    if (imageFallbackId && imageNodeHandler.isImageFallbackEnabled()) {
      imageSource = imageNodeHandler.getFallbackImageSource(`${nodeId}-img`);
      const imageFallbackURL =
        imageNodeHandler.getFallbackImageSourceURL(imageFallbackId);
      if (imageFallbackURL) {
        imageSource ??= await this.loadImageDataURL(imageFallbackURL);
      }
    }

    return imageSource;
  }

  private setCursor() {
    const stage = this.instance.getStage();
    stage.container().style.cursor = "crosshair";
  }
}
