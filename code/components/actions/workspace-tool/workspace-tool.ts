import { v4 as uuidv4 } from "uuid";
import { Vector2d } from "konva/lib/types";
import { WeaveWorkspaceToolActionState } from "./types";
import { WORKSPACE_TOOL_STATE } from "./constants";
import { WEAVE_NODE_LAYER_ID, WeaveAction, WeaveNodesSelectionPlugin } from "@weavejs/sdk";
import Konva from "konva";

export class WorkspaceToolAction extends WeaveAction {
  protected initialized: boolean = false;
  protected state: WeaveWorkspaceToolActionState;
  protected workspaceId: string | null;
  protected container: Konva.Layer | Konva.Group | undefined;
  protected clickPoint: Vector2d | null;
  protected cancelAction!: () => void;
  init = undefined;

  constructor() {
    super();

    this.initialized = false;
    this.state = WORKSPACE_TOOL_STATE.IDLE;
    this.workspaceId = null;
    this.container = undefined;
    this.clickPoint = null;
  }

  getName(): string {
    return "workspaceTool";
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

      if (this.state === WORKSPACE_TOOL_STATE.IDLE) {
        return;
      }

      if (this.state === WORKSPACE_TOOL_STATE.ADDING) {
        this.handleAdding();
        return;
      }
    });

    this.initialized = true;
  }

  private setState(state: WeaveWorkspaceToolActionState) {
    this.state = state;
  }

  private addWorkspace() {
    const stage = this.instance.getStage();

    const selectionPlugin = this.instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
    if (selectionPlugin) {
      const tr = selectionPlugin.getTransformer();
      tr.hide();
    }

    stage.container().style.cursor = "crosshair";
    stage.container().focus();

    this.workspaceId = null;
    this.clickPoint = null;
    this.setState(WORKSPACE_TOOL_STATE.ADDING);
  }

  private handleAdding() {
    const { mousePoint, container } = this.instance.getMousePointer();

    if (container?.getAttrs().id !== WEAVE_NODE_LAYER_ID) {
      this.cancelAction?.();
      return;
    }

    this.clickPoint = mousePoint;
    this.container = container;

    this.workspaceId = uuidv4();

    const nodeHandler = this.instance.getNodeHandler("workspace");

    const node = nodeHandler.createNode(this.workspaceId, {
      title: "Workspace 1",
      editing: false,
      x: this.clickPoint.x,
      y: this.clickPoint.y,
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

    this.addWorkspace();
  }

  cleanup() {
    const stage = this.instance.getStage();

    stage.container().style.cursor = "default";

    const selectionPlugin = this.instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
    if (selectionPlugin) {
      const tr = selectionPlugin.getTransformer();
      tr.show();
      const node = stage.findOne(`#${this.workspaceId}`);
      node && selectionPlugin.setSelectedNodes([node]);
    }

    this.workspaceId = null;
    this.container = undefined;
    this.clickPoint = null;
    this.setState(WORKSPACE_TOOL_STATE.IDLE);
  }
}
