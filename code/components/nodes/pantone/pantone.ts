// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import type {
  WeaveElementAttributes,
  WeaveElementInstance,
} from "@inditextech/weave-types";
import { WeaveNode } from "@inditextech/weave-sdk";

import Konva from "konva";
import { getNearestPantone } from "pantone-tcx";

export const PANTONE_NODE_TYPE = "pantone";

export class PantoneNode extends WeaveNode {
  protected nodeType = PANTONE_NODE_TYPE;

  /* istanbul ignore next */
  loadAsyncElement(nodeId: string) {
    this.instance.loadAsyncElement(nodeId, "pantone");
  }

  /* istanbul ignore next */
  resolveAsyncElement(nodeId: string) {
    this.instance.resolveAsyncElement(nodeId, "pantone");
  }

  onRender(props: WeaveElementAttributes) {
    const { id } = props;

    const pantoneColor = props.pantone ?? "#DEFFA0";

    const nearestColor = getNearestPantone(pantoneColor);

    const pantoneParams = {
      ...props,
    };
    delete pantoneParams.zIndex;

    // Set default dimensions to match tooltip design
    const width = pantoneParams.width ?? 160;
    const height = pantoneParams.height ?? 240; // 160px header + 80px content

    const pantone = new Konva.Group({
      ...pantoneParams,
      width: width,
      height: height,
      name: "node",
    });

    // Main container with border (matching tooltip border)
    const containerRect = new Konva.Rect({
      groupId: id,
      x: 0,
      y: 0,
      fill: "#FFFFFFFF",
      width: width,
      height: height + (props.pantoneStrokeWidth ?? 2) * 2,
      draggable: false,
      listening: true,
      stroke: props.pantoneStroke ?? "black",
      strokeWidth: props.pantoneStrokeWidth ?? 2,
      dash: props.dash ?? [],
    });

    pantone.add(containerRect);

    // Header section with color background (matching pantone-tooltip__header)
    const headerRect = new Konva.Rect({
      id: `${id}-header`,
      groupId: id,
      x: 1,
      y: 1,
      fill: pantoneColor,
      width: width - 2,
      height: height * 0.6,
      draggable: false,
    });

    pantone.add(headerRect);

    // Define scaling ratios for logo and text
    const logoHeight = height * 0.06; // 6% of container height
    const logoX = width * 0.1; // 10% padding from left
    const logoY = height * 0.6 + height * 0.1; // 7% below header

    const codeFontSize = height * 0.05; // 7% of height
    const codeX = width * 0.1;
    const codeY = height * 0.6 + height * 0.2; // 20% below header
    const codeWidth = width * 0.8;

    const nameFontSize = height * 0.05; // 7% of height
    const nameX = width * 0.1;
    const nameY = height * 0.6 + height * 0.26; // 32.5% below header
    const nameWidth = width * 0.8;

    // Pantone logo
    this.loadAsyncElement(id ?? "");
    const imageObj = Konva.Util.createImageElement();
    imageObj.onload = () => {
      const aspectRatio = imageObj.width / imageObj.height;
      const pantoneImage = new Konva.Image({
        id: `${id}-logo`,
        aspectRatio,
        groupId: id,
        x: logoX,
        y: logoY,
        width: logoHeight * aspectRatio,
        height: logoHeight,
        image: imageObj,
        draggable: false,
      });
      pantone.add(pantoneImage);
      this.resolveAsyncElement(id ?? "");
    };
    /* istanbul ignore next */
    imageObj.onerror = (err) => {
      console.error("Error loading Pantone logo image:", err);
      this.resolveAsyncElement(id ?? "");
    };
    imageObj.src = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjAwIDMxIiB3aWR0aD0iMTAwMCIgaGVpZ2h0PSIxNTUiPgo8ZyBmaWxsPSIjMDEwMTAxIj4KCTxwYXRoIGQ9Ik03LjMsNi4yaDQuNmMxLjcsMCwzLjgsMCw1LDEuNmMwLjQsMC41LDAuNywxLjIsMC44LDIuNmMwLDIuNS0xLDQtMy41LDQuNGMtMC43LDAuMS0xLjIsMC4xLTIuNSwwLjFINy4zCgkJTDcuMyw2LjJMNy4zLDYuMnogTTAsMC44djI5aDcuM3YtOS41aDQuOWM0LjItMC4xLDguMy0wLjMsMTEtNC4yYzEuNi0yLjMsMS43LTQuOCwxLjctNS44YzAtMi45LTEtNS0xLjYtNS45CgkJYy0wLjUtMC43LTEtMS4yLTEuMy0xLjRjLTIuMi0xLjktNC44LTIuMi03LjYtMi4zTDAsMC44TDAsMC44eiIvPgoJPHBhdGggZD0iTTMyLjcsMjBjMC43LTIuNCwxLjUtNC44LDIuMi03LjJjMC41LTEuNywwLjktMy40LDEuNC01LjFMNDAuMSwyMEwzMi43LDIwTDMyLjcsMjB6IE00MC4yLDAuOGgtNy42CgkJbC0xMC44LDI5aDcuN2wxLjQtNC42aDEwLjlsMS40LDQuNmg3LjdMNDAuMiwwLjh6Ii8+Cgk8cGF0aCBkPSJNNjAuNCwwLjhsNi4zLDEwLjdjMS41LDIuNiwzLDUuMyw0LjQsNy45TDcwLjgsMC44aDd2MjloLTcuMWwtNS40LTkuMmMtMC45LTEuNC0xLjgtMi45LTIuNi00LjQKCQljLTAuOS0xLjUtMS42LTMuMS0yLjUtNC42bDAuMiwxOC4zaC03di0yOUw2MC40LDAuOEw2MC40LDAuOHoiLz4KCTxwYXRoIGQ9Ik0xMDIuNywwLjh2NS43aC03LjV2MjMuM2gtNy4zVjYuNWgtNy42VjAuOEgxMDIuN3oiLz4KCTxwYXRoIGQ9Ik0xMjQuNiwxNmMtMC4xLDIuMy0wLjcsNC42LTIuMyw2LjRjLTEuOCwxLjktNC4xLDIuMi01LDIuMmMtMS45LDAtMy42LTAuNy00LjktMi4xCgkJYy0xLjItMS4zLTIuNC0zLjQtMi40LTcuNGMwLTMuMSwxLTYuNywzLjktOC4zYzAuNS0wLjMsMS42LTAuOCwzLjItMC44YzAuNSwwLDEuNiwwLDIuOCwwLjVjMS42LDAuNywyLjQsMS43LDIuOCwyLjIKCQlDMTIzLjYsOS45LDEyNC43LDEyLjQsMTI0LjYsMTZ6IE0xMjYuNCwyNy43YzMuNi0yLjksNS41LTcuNyw1LjUtMTIuMWMwLTQtMS42LTguNy00LjQtMTEuNmMtMS41LTEuNi00LjktNC0xMC40LTQKCQljLTYuNywwLTEwLjEsMy43LTExLjYsNS45Yy0yLjUsMy43LTIuOCw3LjktMi44LDkuNGMwLDEuNywwLjIsNy4yLDQuMiwxMS40YzMuNywzLjksOC41LDQuMiwxMC4zLDQuMgoJCUMxMjIsMzAuNywxMjQuOCwyOSwxMjYuNCwyNy43eiIvPgoJPHBhdGggZD0iTTE0Mi41LDAuOGw2LjMsMTAuN2MxLjUsMi42LDMsNS4zLDQuNCw3LjlsLTAuMy0xOC42aDd2MjloLTcuMWwtNS40LTkuMmMtMC45LTEuNC0xLjgtMi45LTIuNi00LjQKCQljLTAuOS0xLjUtMS42LTMuMS0yLjUtNC42bDAuMiwxOC4zaC03di0yOUwxNDIuNSwwLjhMMTQyLjUsMC44eiIvPgoJPHBhdGggZD0iTTE4Ni4xLDAuOHY1LjZoLTE0LjJ2NS4zaDEzLjN2NS41aC0xMy4zdjYuOWgxNS41djUuN2gtMjIuOHYtMjlIMTg2LjF6Ii8+Cgk8cGF0aCBkPSJNMTkzLjUsNS4yVjMuNWgxLjFjMC40LDAsMC45LDAsMS4xLDAuNGMwLjEsMC4xLDAuMSwwLjMsMC4xLDAuNHMwLDAuMy0wLjEsMC40Yy0wLjIsMC40LTAuNSwwLjQtMS4zLDAuNAoJCWgtMC45VjUuMnogTTE5Ny40LDkuNGMtMC4zLTAuNi0wLjUtMS40LTAuNS0xLjZjLTAuMS0wLjUtMC4xLTEuMi0wLjUtMS42Yy0wLjEtMC4xLTAuMi0wLjItMC41LTAuM2MwLjMtMC4xLDAuMy0wLjEsMC41LTAuMgoJCXMwLjMtMC4yLDAuNC0wLjRjMC4yLTAuMiwwLjQtMC41LDAuNC0xLjFjMC0wLjIsMC0wLjctMC40LTEuMmMtMC42LTAuNy0xLjYtMC43LTIuNC0wLjdIMTkydjdoMS41di0zaDAuNGMwLjUsMCwwLjcsMCwwLjksMC4yCgkJYzAuMywwLjIsMC40LDAuNCwwLjUsMS4xYzAuMSwwLjUsMC4xLDEuMSwwLjMsMS42YzAsMC4xLDAuMSwwLjEsMC4xLDAuMkgxOTcuNHogTTIwMCw1LjljMC0xLjItMC4zLTIuNC0xLjEtMy4zCgkJYy0xLjEtMS40LTIuNy0yLjItNC40LTIuMmMtMi4zLDAtMy43LDEuMy00LjMsMmMtMC40LDAuNS0xLjMsMS43LTEuMywzLjVjMCwyLjQsMS40LDMuOCwyLjEsNC40YzEsMC43LDIuMiwxLjEsMy40LDEuMQoJCWMwLjgsMCwyLjctMC4yLDQuMi0xLjlDMTk5LjksOC4xLDIwMCw2LjYsMjAwLDUuOXogTTE5OS41LDUuOWMwLDIuMS0xLjMsNC0zLjMsNC43Yy0wLjgsMC4zLTEuNCwwLjMtMS43LDAuM2MtMiwwLTMuOS0xLjItNC43LTMuMQoJCWMtMC4yLTAuNi0wLjQtMS4yLTAuNC0xLjljMC0yLjMsMS40LTMuNiwyLjEtNC4xYzEuMi0wLjksMi40LTEsMy0xYzIuMywwLDMuNSwxLjMsNCwyQzE5OS40LDQuMSwxOTkuNSw1LjQsMTk5LjUsNS45eiIvPgo8L2c+Cjwvc3ZnPgo=`;

    // Pantone code (h2 style)
    const pantoneCode = new Konva.Text({
      id: `${id}-pantone-code`,
      groupId: id,
      x: codeX,
      y: codeY,
      fontSize: codeFontSize,
      fontFamily: "Neue Helvetica for Zara, sans-serif",
      fontWeight: 300,
      fill: "#000000FF",
      strokeEnabled: false,
      text: `TCX ${nearestColor.tcx}`,
      width: codeWidth,
      height: 18, // Height can remain static or be scaled if needed
      align: "left",
      draggable: false,
    });

    pantone.add(pantoneCode);

    // Pantone name (p style)
    const pantoneName = new Konva.Text({
      id: `${id}-pantone-name`,
      groupId: id,
      x: nameX,
      y: nameY,
      fontSize: nameFontSize,
      fontFamily: "Neue Helvetica for Zara, sans-serif",
      fontWeight: 300,
      lineHeight: 1.2,
      fill: "#000000FF",
      strokeEnabled: false,
      text: nearestColor.name,
      width: nameWidth,
      height: 18, // Height can remain static or be scaled if needed
      align: "left",
      draggable: false,
    });

    pantone.add(pantoneName);

    // default node augmentation before personalization
    this.setupDefaultNodeAugmentation(pantone);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    pantone.allowedAnchors = () => {
      return ["top-left", "top-right", "bottom-left", "bottom-right"];
    };

    this.setupDefaultNodeEvents(pantone);

    return pantone;
  }

  onUpdate(
    nodeInstance: WeaveElementInstance,
    nextProps: WeaveElementAttributes
  ) {
    const { id, pantone, pantoneStroke, pantoneStrokeWidth, dash } = nextProps;

    const pantoneNode = nodeInstance as Konva.Group;

    // Get new width/height, fallback to defaults
    const width = nextProps.width ?? 160;
    const height = nextProps.height ?? 240;

    const nodeInstanceZIndex = nodeInstance.zIndex();
    nodeInstance.setAttrs({
      ...nextProps,
      zIndex: nodeInstanceZIndex,
      width,
      height,
    });

    const pantoneColor = pantone ?? "#DEFFA0";
    const nearestColor = getNearestPantone(pantoneColor);

    // Update the main container border and size
    const containerRect = pantoneNode.findOne("Rect");
    if (containerRect) {
      containerRect.setAttrs({
        stroke: pantoneStroke ?? "black",
        strokeWidth: pantoneStrokeWidth ?? 2,
        dash: dash ?? [],
        width,
        height,
      });
    }

    // Update the header color and size
    const headerRect = pantoneNode.findOne(`#${id}-header`);
    if (headerRect) {
      headerRect.setAttrs({
        fill: pantoneColor,
        width: width - 2,
        height: height * 0.6,
      });
    }

    // Update the content section background size
    const contentRect = pantoneNode.findOne(`#${id}-content-bg`);
    if (contentRect) {
      contentRect.setAttrs({
        width: width - 2,
        // Keep y and height as in onRender (y: 168, height: 12), or adjust if needed
      });
    }

    // Define scaling ratios for logo and text
    const logoHeight = height * 0.06; // 6% of container height
    const logoX = width * 0.1; // 10% padding from left
    const logoY = height * 0.6 + height * 0.07; // 7% below header

    const codeFontSize = height * 0.05; // 7% of height
    const codeX = width * 0.1;
    const codeY = height * 0.6 + height * 0.18; // 20% below header
    const codeWidth = width * 0.8;

    const nameFontSize = height * 0.06; // 8.3% of height
    const nameX = width * 0.1;
    const nameY = height * 0.6 + height * 0.24; // 32.5% below header
    const nameWidth = width * 0.8;

    // Update the pantone logo position and size
    const logo = pantoneNode.findOne(`#${id}-logo`);
    if (logo) {
      const aspectRatio = logo.getAttr("aspectRatio") || 1;
      logo.setAttrs({
        x: logoX,
        y: logoY,
        width: logoHeight * aspectRatio,
        height: logoHeight,
      });
    }

    // Update the pantone code text width, position, and font size
    const pantoneCode = pantoneNode.findOne(`#${id}-pantone-code`);
    if (pantoneCode) {
      pantoneCode.setAttrs({
        text: `TCX ${nearestColor.tcx}`,
        width: codeWidth,
        x: codeX,
        y: codeY,
        fontSize: codeFontSize,
      });
    }

    // Update the pantone name text width, position, and font size
    const pantoneName = pantoneNode.findOne(`#${id}-pantone-name`);
    if (pantoneName) {
      pantoneName.setAttrs({
        text: nearestColor.name,
        width: nameWidth,
        x: nameX,
        y: nameY,
        fontSize: nameFontSize,
      });
    }
  }
}
