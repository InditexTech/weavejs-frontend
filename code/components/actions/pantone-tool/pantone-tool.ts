import { v4 as uuidv4 } from "uuid";
import { Vector2d } from "konva/lib/types";
import { WeavePantoneToolActionState } from "./types";
import { PANTONE_TOOL_STATE } from "./constants";
import { WeaveAction, WeaveNodesSelectionPlugin } from "@inditextech/weavejs-sdk";
import Konva from "konva";

export class PantoneToolAction extends WeaveAction {
  protected initialized: boolean = false;
  protected state: WeavePantoneToolActionState;
  protected pantoneId: string | null;
  protected container: Konva.Layer | Konva.Group | undefined;
  protected clickPoint: Vector2d | null;
  protected cancelAction!: () => void;
  init = undefined;

  constructor() {
    super();

    this.initialized = false;
    this.state = PANTONE_TOOL_STATE.IDLE;
    this.pantoneId = null;
    this.container = undefined;
    this.clickPoint = null;
  }

  getName(): string {
    return "pantoneTool";
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

      if (this.state === PANTONE_TOOL_STATE.IDLE) {
        return;
      }

      if (this.state === PANTONE_TOOL_STATE.ADDING) {
        this.handleAdding();
        return;
      }
    });

    this.initialized = true;
  }

  private setState(state: WeavePantoneToolActionState) {
    this.state = state;
  }

  private addPantone() {
    const stage = this.instance.getStage();

    const selectionPlugin = this.instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
    if (selectionPlugin) {
      const tr = selectionPlugin.getTransformer();
      tr.hide();
    }

    stage.container().style.cursor = "crosshair";
    stage.container().focus();

    this.pantoneId = null;
    this.clickPoint = null;
    this.setState(PANTONE_TOOL_STATE.ADDING);
  }

  private handleAdding() {
    const { mousePoint, container } = this.instance.getMousePointer();

    this.clickPoint = mousePoint;
    this.container = container;

    this.pantoneId = uuidv4();

    const nodeHandler = this.instance.getNodeHandler("pantone");

    const node = nodeHandler.createNode(this.pantoneId, {
      x: this.clickPoint.x,
      y: this.clickPoint.y,
      width: 300,
      height: 300,
      opacity: 1,
      draggable: true,
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

    this.addPantone();
  }

  cleanup() {
    const stage = this.instance.getStage();

    stage.container().style.cursor = "default";

    const selectionPlugin = this.instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
    if (selectionPlugin) {
      const tr = selectionPlugin.getTransformer();
      tr.show();
      const node = stage.findOne(`#${this.pantoneId}`);
      if (node) {
        selectionPlugin.setSelectedNodes([node]);
      }
    }

    this.pantoneId = null;
    this.container = undefined;
    this.clickPoint = null;
    this.setState(PANTONE_TOOL_STATE.IDLE);
  }
}
