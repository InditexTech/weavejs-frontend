// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Weave } from "@inditextech/weave-sdk";
import Konva from "konva";
import { throttle } from "lodash";

export const setupTransformer = (instance: Weave) => {
  const stage = instance.getStage();
  const utilityLayer = instance.getUtilityLayer();

  let transformer: Konva.Transformer | undefined = stage.findOne(
    "#maskSelectionTransformer"
  );

  if (!transformer) {
    transformer = new Konva.Transformer({
      id: "maskSelectionTransformer",
      rotateEnabled: false,
      resizeEnabled: false,
      enabledAnchors: [],
      borderStrokeWidth: 2,
      borderStroke: "#0074ffcc",
      padding: 0,
    });

    const selectionRectangle = new Konva.Rect({
      fill: "#00000040",
      stroke: "#000000",
      strokeWidth: 1 * stage.scaleX(),
      dash: [12 * stage.scaleX(), 4 * stage.scaleX()],
      visible: false,
      // disable events to not interrupt with events
      listening: false,
    });

    if (utilityLayer) {
      utilityLayer.add(transformer);
      utilityLayer.add(selectionRectangle);
    }

    let x1: number, y1: number, x2: number, y2: number;
    let selecting: boolean = false;

    stage.on("pointerdown", () => {
      if (instance.getActiveAction()) {
        return;
      }

      const intStage = instance.getStage();

      x1 = intStage.getRelativePointerPosition()?.x ?? 0;
      y1 = intStage.getRelativePointerPosition()?.y ?? 0;
      x2 = intStage.getRelativePointerPosition()?.x ?? 0;
      y2 = intStage.getRelativePointerPosition()?.y ?? 0;

      selectionRectangle.strokeWidth(1 / stage.scaleX());
      selectionRectangle.dash([12 / stage.scaleX(), 4 / stage.scaleX()]);
      selectionRectangle.width(0);
      selectionRectangle.height(0);
      selecting = true;
    });

    const handleMouseMove = () => {
      if (instance.getActiveAction()) {
        return;
      }

      if (!selecting) {
        return;
      }

      const intStage = instance.getStage();

      x2 = intStage.getRelativePointerPosition()?.x ?? 0;
      y2 = intStage.getRelativePointerPosition()?.y ?? 0;

      selectionRectangle.setAttrs({
        visible: true,
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
      });
    };

    stage.on("pointermove", throttle(handleMouseMove, 50));

    let areaSelecting: boolean = false;

    stage.on("pointerup", () => {
      if (instance.getActiveAction()) {
        return;
      }

      selecting = false;

      if (!selectionRectangle) {
        return;
      }

      if (selectionRectangle && !selectionRectangle.visible()) {
        return;
      }

      if (!transformer) {
        return;
      }

      selectionRectangle.visible(false);
      const shapes = stage.find((node: Konva.Node) => {
        return (
          (node.getAttrs().nodeType === "fuzzy-mask" &&
            !node.getAttrs().nodeId) ||
          node.getAttrs().nodeType === "mask"
        );
      });
      const box = selectionRectangle.getClientRect();
      const selected = shapes.filter((shape) => {
        return Konva.Util.haveIntersection(box, shape.getClientRect());
      });

      transformer.nodes(selected);

      stage.container().tabIndex = 1;
      stage.container().focus();

      areaSelecting = true;
    });

    stage.on("pointerclick", (e) => {
      if (instance.getActiveAction()) {
        return;
      }

      let nodeTargeted: Konva.Node | undefined = e.target;

      if (areaSelecting) {
        areaSelecting = false;
        return;
      }

      if (!transformer) {
        return;
      }

      if (!["fuzzy-mask", "mask"].includes(nodeTargeted.getAttrs().nodeType)) {
        transformer.nodes([]);
        return;
      }

      if (nodeTargeted.getAttrs().nodeType === "fuzzy-mask") {
        nodeTargeted = stage.findOne(`#${nodeTargeted.getAttrs().nodeId}`);
      }

      if (!nodeTargeted) {
        return;
      }

      // do we pressed shift or ctrl?
      const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
      const nodeSelectedIndex = transformer
        .nodes()
        .findIndex((node: Konva.Node) => {
          return node.getAttrs().id === nodeTargeted.getAttrs().id;
        });
      const isSelected = nodeSelectedIndex !== -1;

      let areNodesSelected = false;
      if (!metaPressed) {
        // if no key pressed and the node is not selected
        // select just one
        transformer.nodes([nodeTargeted]);
        transformer.show();
        areNodesSelected = true;
      } else if (metaPressed && isSelected) {
        // if we pressed keys and node was selected
        // we need to remove it from selection:
        const nodes = transformer.nodes().slice(); // use slice to have new copy of array
        // remove node from array
        nodes.splice(nodes.indexOf(nodeTargeted), 1);
        transformer.nodes(nodes);
        areNodesSelected = true;
      } else if (metaPressed && !isSelected) {
        // add the node into selection
        const nodes = transformer.nodes().concat([nodeTargeted]);
        transformer.nodes(nodes);
        areNodesSelected = true;
      }

      if (areNodesSelected) {
        stage.container().tabIndex = 1;
        stage.container().focus();
        stage.container().style.cursor = "grab";
      }
    });
  }

  return transformer;
};
