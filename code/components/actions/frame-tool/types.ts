import { WeaveActionCallbacks } from "@inditextech/weavejs-sdk";
import { FRAME_TOOL_STATE } from "./constants";

export type FrameToolActionStateKeys = keyof typeof FRAME_TOOL_STATE;
export type FrameToolActionState =
  (typeof FRAME_TOOL_STATE)[FrameToolActionStateKeys];

export type FrameToolCallbacks = WeaveActionCallbacks;
