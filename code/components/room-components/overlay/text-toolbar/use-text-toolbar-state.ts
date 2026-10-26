// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import type { WeaveElementInstance } from "@inditextech/weave-types";
import { useCollaborationRoom } from "@/store/store";
import type {
  SelectionFormat,
  TextHandler,
  TextProps,
  TextToolbarState,
} from "./types";

const TEXT_ACTIONS = ["textTool", "richTextTool"];

/**
 * Returns the state the text toolbar renders, or `null` when it must be
 * hidden (no text selected, multi selection, ...).
 */
export function useTextToolbarState(): TextToolbarState | null {
  const instance = useWeave((state) => state.instance);
  const node = useWeave((state) => state.selection.node);
  const selectedNodes = useWeave((state) => state.selection.nodes);
  const actualAction = useWeave((state) => state.actions.actual);
  const createProps = useCollaborationRoom(
    (state) => state.nodeProperties.createProps,
  );

  const [editing, setEditing] = React.useState(false);
  const [format, setFormat] = React.useState<SelectionFormat | null>(null);

  const creating = !!actualAction && TEXT_ACTIONS.includes(actualAction);

  const nodeInstance = React.useMemo(() => {
    if (creating) return undefined;
    if (selectedNodes.length !== 1) return undefined;
    const [selected] = selectedNodes;
    if (selected.node?.type !== "text") return undefined;
    return selected.instance as unknown as WeaveElementInstance;
  }, [creating, selectedNodes]);

  const handler = React.useMemo(
    () => instance?.getNodeHandler<TextHandler>("text"),
    [instance],
  );

  const rich = !!(nodeInstance && handler?.isRichTextEnabled?.(nodeInstance));

  const refresh = React.useCallback(() => {
    if (!handler || !nodeInstance || !rich) {
      setFormat(null);
      return;
    }
    setFormat(handler.getSelectionFormat(nodeInstance));
  }, [handler, nodeInstance, rich]);

  React.useEffect(() => {
    refresh();
  }, [refresh, node]);

  React.useEffect(() => {
    if (!instance) return;

    function onEnter({ node: n }: { node: WeaveElementInstance }) {
      if (n === nodeInstance) setEditing(true);
    }
    function onExit({ node: n }: { node: WeaveElementInstance }) {
      if (n === nodeInstance) setEditing(false);
    }
    function onSelection(e: {
      node: WeaveElementInstance;
      format: SelectionFormat;
    }) {
      if (e.node === nodeInstance) setFormat(e.format);
    }
    function onFormat(e: { node: WeaveElementInstance }) {
      if (e.node === nodeInstance) refresh();
    }

    instance.addEventListener("onEnterTextNodeEditMode", onEnter);
    instance.addEventListener("onExitTextNodeEditMode", onExit);
    instance.addEventListener("onTextSelectionChange", onSelection);
    instance.addEventListener("onTextFormatChange", onFormat);
    return () => {
      instance.removeEventListener("onEnterTextNodeEditMode", onEnter);
      instance.removeEventListener("onExitTextNodeEditMode", onExit);
      instance.removeEventListener("onTextSelectionChange", onSelection);
      instance.removeEventListener("onTextFormatChange", onFormat);
    };
  }, [instance, nodeInstance, refresh]);

  React.useEffect(() => {
    setEditing(false);
  }, [nodeInstance]);

  return React.useMemo(() => {
    if (!instance) return null;
    if (creating) {
      return {
        nodeInstance: undefined,
        mode: "create",
        editing: false,
        rich: false,
        format: null,
        props: (createProps ?? {}) as TextProps,
      };
    }
    if (!nodeInstance || !node || node.type !== "text") return null;
    return {
      nodeInstance,
      mode: "update",
      editing,
      rich,
      format,
      props: (node.props ?? {}) as TextProps,
    };
  }, [
    instance,
    creating,
    createProps,
    nodeInstance,
    node,
    editing,
    rich,
    format,
  ]);
}
