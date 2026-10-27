// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import type { WeaveElementInstance } from "@inditextech/weave-types";
import { useCollaborationRoom } from "@/store/store";
import { labelPropsToTextProps, SHAPE_LABEL_TYPES } from "./types";
import type {
  LabelSession,
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

  const [labelSession, setLabelSession] = React.useState<LabelSession | null>(
    null,
  );
  const [labelFormat, setLabelFormat] = React.useState<SelectionFormat | null>(
    null,
  );
  const [labelGroup, setLabelGroup] =
    React.useState<WeaveElementInstance | null>(null);

  React.useEffect(() => {
    if (!instance) return;
    const onEnter = ({
      node: n,
      session,
    }: {
      node: WeaveElementInstance;
      session: LabelSession;
    }) => {
      setLabelGroup(n);
      setLabelSession(session);
    };
    const onExit = () => {
      setLabelGroup(null);
      setLabelSession(null);
      setLabelFormat(null);
    };
    const onFormat = ({ format }: { format: SelectionFormat }) =>
      setLabelFormat(format);
    instance.addEventListener("onShapeLabelFormatChange", onFormat);
    instance.addEventListener("onEnterShapeLabelEditMode", onEnter);
    instance.addEventListener("onExitShapeLabelEditMode", onExit);
    return () => {
      instance.removeEventListener("onShapeLabelFormatChange", onFormat);
      instance.removeEventListener("onEnterShapeLabelEditMode", onEnter);
      instance.removeEventListener("onExitShapeLabelEditMode", onExit);
    };
  }, [instance]);

  const [labelStateNode, setLabelStateNode] = React.useState<{
    type: string;
    props: Record<string, unknown>;
  } | null>(null);

  React.useEffect(() => {
    if (!instance || !labelGroup) {
      setLabelStateNode(null);
      return;
    }
    const id = (labelGroup as unknown as { id(): string }).id();
    const read = () => {
      const found = instance.getNode(id)?.node;
      setLabelStateNode(
        found
          ? {
              type: found.type,
              props: (found.props ?? {}) as Record<string, unknown>,
            }
          : null,
      );
    };
    read();
    instance.addEventListener("onStateChange", read);
    return () => instance.removeEventListener("onStateChange", read);
  }, [instance, labelGroup]);

  const creating = !!actualAction && TEXT_ACTIONS.includes(actualAction);

  // Node being edited. Right after creation the selection store may not be
  // synced yet (the SDK selects it without emitting onNodesChange), so the
  // edit-mode events are the source of truth.
  const [editingShape, setEditingShape] =
    React.useState<WeaveElementInstance | null>(null);
  const [stateTick, setStateTick] = React.useState(0);

  React.useEffect(() => {
    if (!instance) return;
    const onEnter = ({ node: n }: { node: WeaveElementInstance }) =>
      setEditingShape(n);
    const onExit = () => setEditingShape(null);
    const onState = () => setStateTick((t) => t + 1);
    instance.addEventListener("onEnterTextNodeEditMode", onEnter);
    instance.addEventListener("onExitTextNodeEditMode", onExit);
    instance.addEventListener("onStateChange", onState);
    return () => {
      instance.removeEventListener("onEnterTextNodeEditMode", onEnter);
      instance.removeEventListener("onExitTextNodeEditMode", onExit);
      instance.removeEventListener("onStateChange", onState);
    };
  }, [instance]);

  const nodeInstance = React.useMemo(() => {
    if (creating) return undefined;
    if (selectedNodes.length === 1) {
      const [selected] = selectedNodes;
      if (selected.node?.type !== "text") return undefined;
      return selected.instance as unknown as WeaveElementInstance;
    }
    if (selectedNodes.length === 0 && editingShape) return editingShape;
    return undefined;
  }, [creating, selectedNodes, editingShape]);

  const stateNode = React.useMemo(() => {
    if (node && node.type === "text") return node;
    if (!instance || !nodeInstance || nodeInstance !== editingShape)
      return undefined;
    const id = (nodeInstance as unknown as { id(): string }).id();
    const found = instance.getNode(id)?.node;
    if (found?.type === "text") return found;
    // Not committed to the shared state yet: use the live shape attrs.
    const attrs = (
      nodeInstance as unknown as { getAttrs(): Record<string, unknown> }
    ).getAttrs();
    return { key: id, type: "text", props: attrs } as unknown as NonNullable<
      typeof node
    >;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node, instance, nodeInstance, editingShape, stateTick]);

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
  }, [refresh, stateNode]);

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
    setEditing(!!nodeInstance && nodeInstance === editingShape);
  }, [nodeInstance, editingShape]);

  return React.useMemo(() => {
    if (!instance) return null;
    if (
      labelGroup &&
      labelStateNode &&
      SHAPE_LABEL_TYPES.includes(labelStateNode.type)
    ) {
      return {
        nodeInstance: labelGroup,
        mode: "update",
        shapeLabel: true,
        editing: true,
        rich: true,
        labelSession: labelSession ?? undefined,
        format: labelFormat,
        props: labelPropsToTextProps(labelStateNode.props),
      };
    }
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
    if (!nodeInstance || !stateNode) return null;
    return {
      nodeInstance,
      mode: "update",
      editing,
      rich,
      format,
      props: (stateNode.props ?? {}) as TextProps,
    };
  }, [
    instance,
    labelGroup,
    labelStateNode,
    labelSession,
    labelFormat,
    creating,
    createProps,
    nodeInstance,
    stateNode,
    editing,
    rich,
    format,
  ]);
}
