import { WORKSPACE_TOOL_STATE } from "./constants";

export type WeaveWorkspaceToolActionStateKeys = keyof typeof WORKSPACE_TOOL_STATE;
export type WeaveWorkspaceToolActionState = (typeof WORKSPACE_TOOL_STATE)[WeaveWorkspaceToolActionStateKeys];
