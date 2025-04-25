import { WeaveActionCallbacks } from "@inditextech/weave-sdk";
import { PANTONE_TOOL_STATE } from "./constants";

export type PantoneToolActionStateKeys = keyof typeof PANTONE_TOOL_STATE;
export type PantoneToolActionState =
  (typeof PANTONE_TOOL_STATE)[PantoneToolActionStateKeys];

export type PantoneToolCallbacks = WeaveActionCallbacks;

export type PantoneToolActionTriggerParams = {
  color?: string;
};
