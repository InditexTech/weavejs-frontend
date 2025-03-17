import {
  WeaveTextToolAction,
  WeaveZoomOutToolAction,
  WeaveZoomInToolAction,
  WeaveExportNodeToolAction,
  WeaveExportStageToolAction,
  WeaveFitToScreenToolAction,
  WeaveFitToSelectionToolAction,
  WeaveNodesSnappingPlugin,
  WeaveStageNode,
  WeaveLayerNode,
  WeaveGroupNode,
  WeaveRectangleNode,
  WeaveLineNode,
  WeaveTextNode,
  WeaveImageNode,
  WeaveFrameNode,
  WeaveSelectionToolAction,
} from "@inditextech/weavejs-sdk";
import { PantoneNode } from "@/components/nodes/pantone/pantone";
import { AlignElementsToolAction } from "@/components/actions/align-elements-tool/align-elements-tool";

const FONTS = [
  {
    id: "NotoSans",
    name: "Noto Sans",
  },
  {
    id: "NotoSansMono",
    name: "Noto Sans Mono",
  },
];

const NODES = [
  new WeaveStageNode(),
  new WeaveLayerNode(),
  new WeaveGroupNode(),
  new WeaveRectangleNode(),
  new WeaveLineNode(),
  new WeaveTextNode(),
  new WeaveImageNode(),
  new WeaveFrameNode(),
  new PantoneNode(),
];

const ACTIONS = [
  new WeaveSelectionToolAction(),
  new WeaveTextToolAction(),
  new WeaveZoomOutToolAction(),
  new WeaveZoomInToolAction(),
  new WeaveFitToScreenToolAction(),
  new WeaveFitToSelectionToolAction(),
  new AlignElementsToolAction(),
  new WeaveExportNodeToolAction(),
  new WeaveExportStageToolAction(),
];

const CUSTOM_PLUGINS = [new WeaveNodesSnappingPlugin()];

export { FONTS, NODES, ACTIONS, CUSTOM_PLUGINS };
