import { PANTONE_TOOL_STATE } from "./constants";

export type WeavePantoneToolActionStateKeys = keyof typeof PANTONE_TOOL_STATE;
export type WeavePantoneToolActionState = (typeof PANTONE_TOOL_STATE)[WeavePantoneToolActionStateKeys];
