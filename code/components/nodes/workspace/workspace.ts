import { WeaveElementAttributes, WeaveElementInstance, WeaveNode, WeaveStateElement } from "@inditextech/weavejs-sdk";
import Konva from "konva";

export const WORKSPACE_NODE_TYPE = "workspace";

export class WorkspaceNode extends WeaveNode {
  protected nodeType = WORKSPACE_NODE_TYPE;

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

    const workspaceParams = {
      ...props,
    };
    delete workspaceParams.zIndex;

    const workspaceWidth = 1403;
    const workspaceHeight = 992;
    const titleHeight = 30;
    const strokeWidth = 2;

    const workspace = new Konva.Group({
      ...workspaceParams,
      containerId: `${id}-group-internal`,
      width: workspaceWidth + strokeWidth * 2,
      height: workspaceHeight + titleHeight + strokeWidth * 2,
      fill: "white",
      clipX: 0,
      clipY: 0,
      clipWidth: workspaceWidth + strokeWidth * 2,
      clipHeight: workspaceHeight + titleHeight + strokeWidth * 2,
    });

    const background = new Konva.Rect({
      id: `${id}-bg`,
      x: strokeWidth,
      y: titleHeight + strokeWidth,
      width: workspaceWidth,
      stroke: "black",
      strokeWidth: 2,
      height: workspaceHeight,
      fill: "#FFFFFFFF",
      draggable: false,
    });

    workspace.add(background);

    const text = new Konva.Text({
      id: `${id}-title`,
      x: 0,
      y: 0,
      width: workspaceWidth,
      height: titleHeight - 10,
      fontSize: 20,
      fontFamily: "NeueHelveticaZara",
      align: "left",
      text: workspaceParams.title,
      stroke: "black",
      strokeWidth: 1,
      listening: false,
      draggable: false,
    });

    workspace.add(text);

    const workspaceInternal = new Konva.Group({
      id: `${id}-group-internal`,
      nodeId: id,
      x: strokeWidth,
      y: titleHeight + strokeWidth,
      width: workspaceWidth,
      height: workspaceHeight,
      draggable: false,
      stroke: "transparent",
      strokeWidth,
      clipX: 0,
      clipY: 0,
      clipWidth: workspaceWidth,
      clipHeight: workspaceHeight,
    });

    workspace.add(workspaceInternal);

    workspace.on("transform", (e) => {
      this.instance.updateNode(this.toNode(workspace));
      e.cancelBubble = true;
    });

    workspace.on("dragmove", (e) => {
      this.instance.updateNode(this.toNode(workspace));
      e.cancelBubble = true;
    });

    workspace.on("dragend", (e) => {
      this.instance.updateNode(this.toNode(workspace));
      e.cancelBubble = true;
    });

    workspace.on("mouseenter", (e) => {
      const stage = this.instance.getStage();
      stage.container().style.cursor = "pointer";
      e.cancelBubble = true;
    });

    workspace.on("mouseleave", (e) => {
      const stage = this.instance.getStage();
      stage.container().style.cursor = "default";
      e.cancelBubble = true;
    });

    return workspace;
  }

  updateInstance(nodeInstance: WeaveElementInstance, nextProps: WeaveElementAttributes) {
    const { id } = nextProps;

    const workspaceNode = nodeInstance as Konva.Group;

    const newProps = { ...nextProps };
    delete newProps.title;

    nodeInstance.setAttrs({
      ...newProps,
    });

    const workspaceTitle = workspaceNode.findOne(`#${id}-title`);
    if (workspaceTitle) {
      workspaceTitle.setAttrs({
        text: nextProps.title,
      });
    }
  }

  removeInstance(nodeInstance: WeaveElementInstance) {
    nodeInstance.destroy();
  }

  toNode(instance: WeaveElementInstance) {
    const attrs = instance.getAttrs();

    const workspaceInternal = (instance as Konva.Group).findOne(`#${attrs.containerId}`) as Konva.Group | undefined;

    const childrenMapped: WeaveStateElement[] = [];
    if (workspaceInternal) {
      const children: WeaveElementInstance[] = [...(workspaceInternal as Konva.Group).getChildren()];
      for (const node of children) {
        const handler = this.instance.getNodeHandler(node.getAttr("nodeType"));
        childrenMapped.push(handler.toNode(node));
      }
    }

    return {
      key: attrs.id ?? "",
      type: attrs.nodeType,
      props: {
        ...attrs,
        id: attrs.id ?? "",
        nodeType: attrs.nodeType,
        children: childrenMapped,
      },
    };
  }
}
