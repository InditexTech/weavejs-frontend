import { v4 as uuidv4 } from "uuid";
import { Vector2d } from "konva/lib/types";
import { FrameToolActionState, FrameToolCallbacks } from "./types";
import { FRAME_TOOL_STATE } from "./constants";
import {
  WEAVE_NODE_LAYER_ID,
  WeaveAction,
  WeaveNodesSelectionPlugin,
} from "@inditextech/weavejs-sdk";
import Konva from "konva";

export class FrameToolAction extends WeaveAction {
  protected initialized: boolean = false;
  protected state: FrameToolActionState;
  protected frameId: string | null;
  protected container: Konva.Layer | Konva.Group | undefined;
  protected clickPoint: Vector2d | null;
  protected cancelAction!: () => void;
  internalUpdate = undefined;
  init = undefined;

  constructor(callbacks: FrameToolCallbacks) {
    super(callbacks);

    this.initialized = false;
    this.state = FRAME_TOOL_STATE.IDLE;
    this.frameId = null;
    this.container = undefined;
    this.clickPoint = null;
  }

  getName(): string {
    return "frameTool";
  }

  initProps() {
    return {
      title: "Frame XXX",
      editing: false,
      opacity: 1,
    };
  }

  private setupEvents() {
    const stage = this.instance.getStage();

    stage.container().addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.cancelAction();
        return;
      }
    });

    stage.on("click tap", (e) => {
      e.evt.preventDefault();

      if (this.state === FRAME_TOOL_STATE.IDLE) {
        return;
      }

      if (this.state === FRAME_TOOL_STATE.ADDING) {
        this.handleAdding();
        return;
      }
    });

    this.initialized = true;
  }

  private setState(state: FrameToolActionState) {
    this.state = state;
  }

  private addFrame() {
    const stage = this.instance.getStage();

    stage.container().style.cursor = "crosshair";
    stage.container().focus();

    this.frameId = null;
    this.clickPoint = null;
    this.setState(FRAME_TOOL_STATE.ADDING);
  }

  private handleAdding() {
    const { mousePoint, container } = this.instance.getMousePointer();

    if (container?.getAttrs().id !== WEAVE_NODE_LAYER_ID) {
      this.cancelAction?.();
      return;
    }

    this.clickPoint = mousePoint;
    this.container = container;

    this.frameId = uuidv4();

    const nodeHandler = this.instance.getNodeHandler("frame");

    const node = nodeHandler.createNode(this.frameId, {
      ...this.props,
      x: this.clickPoint.x,
      y: this.clickPoint.y,
    });

    this.instance.addNode(node, this.container?.getAttrs().id);

    this.cancelAction?.();
  }

  trigger(cancelAction: () => void) {
    if (!this.instance) {
      throw new Error("Instance not defined");
    }

    if (!this.initialized) {
      this.setupEvents();
    }
    const stage = this.instance.getStage();

    stage.container().tabIndex = 1;
    stage.container().focus();

    this.cancelAction = cancelAction;

    this.props = this.initProps();
    this.addFrame();
  }

  cleanup() {
    const stage = this.instance.getStage();

    stage.container().style.cursor = "default";

    const selectionPlugin =
      this.instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
    if (selectionPlugin) {
      const node = stage.findOne(`#${this.frameId}`);
      if (node) {
        selectionPlugin.setSelectedNodes([node]);
      }
      this.instance.triggerAction("selectionTool");
    }

    this.frameId = null;
    this.container = undefined;
    this.clickPoint = null;
    this.setState(FRAME_TOOL_STATE.IDLE);
  }
}
