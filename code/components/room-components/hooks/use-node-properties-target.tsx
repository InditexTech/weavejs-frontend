// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { WeaveStateElement } from "@inditextech/weave-types";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";

export function useNodePropertiesTarget() {
  const instance = useWeave((state) => state.instance);
  const node = useWeave((state) => state.selection.node);
  const actualAction = useWeave((state) => state.actions.actual);

  const nodePropertiesAction = useCollaborationRoom(
    (state) => state.nodeProperties.action,
  );
  const nodeCreateProps = useCollaborationRoom(
    (state) => state.nodeProperties.createProps,
  );

  const isCreating = Boolean(actualAction) && nodePropertiesAction === "create";
  const isUpdating = nodePropertiesAction === "update";

  const actualNode = React.useMemo(() => {
    if (isCreating) {
      return {
        key: "creating",
        type: "undefined",
        props: { ...nodeCreateProps },
      };
    }
    return isUpdating && node ? node : undefined;
  }, [isCreating, isUpdating, node, nodeCreateProps]);

  const updateElement = React.useCallback(
    (updatedNode: WeaveStateElement) => {
      if (!instance) return;
      if (isCreating && actualAction) {
        instance.updatePropsAction(actualAction, updatedNode.props);
      } else if (isUpdating) {
        instance.updateNode(updatedNode);
      }
    },
    [instance, actualAction, isCreating, isUpdating],
  );

  return {
    instance,
    actualAction,
    nodePropertiesAction,
    actualNode,
    updateElement,
  };
}
