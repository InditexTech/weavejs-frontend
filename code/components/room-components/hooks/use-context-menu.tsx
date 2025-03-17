import {
  Weave,
  WeaveContextMenuPlugin,
  WeaveCopyPasteNodesPlugin,
  WeaveSelection,
} from "@inditextech/weavejs-sdk";

import {
  Copy,
  Clipboard,
  Group,
  Ungroup,
  Trash,
  SendToBack,
  BringToFront,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useCollaborationRoom } from "@/store/store";
import React from "react";
import { ContextMenuOption } from "../context-menu";

function useContextMenu() {
  const setContextMenuShow = useCollaborationRoom(
    (state) => state.setContextMenuShow
  );
  const setContextMenuPosition = useCollaborationRoom(
    (state) => state.setContextMenuPosition
  );
  const setContextMenuOptions = useCollaborationRoom(
    (state) => state.setContextMenuOptions
  );

  const getContextMenu = React.useCallback(
    ({
      actInstance,
      actIsActionActive,
      actCanCopy,
      actCanPaste,
      canUnGroup,
      nodes,
      canGroup,
    }: {
      actInstance: Weave;
      actIsActionActive: boolean;
      actCanCopy: boolean;
      actCanPaste: boolean;
      canUnGroup: boolean;
      canGroup: boolean;
      nodes: WeaveSelection[];
    }): ContextMenuOption[] => {
      return [
        {
          id: "copy",
          type: "button",
          label: "Copy",
          icon: <Copy size={16} />,
          disabled: actIsActionActive || !actCanCopy,
          onClick: () => {
            const weaveCopyPasteNodesPlugin =
              actInstance.getPlugin<WeaveCopyPasteNodesPlugin>(
                "copyPasteNodes"
              );
            if (weaveCopyPasteNodesPlugin) {
              return weaveCopyPasteNodesPlugin.copy();
            }
          },
        },
        {
          id: "paste",
          type: "button",
          label: "Paste",
          icon: <Clipboard size={16} />,
          disabled: actIsActionActive || !actCanPaste,
          onClick: () => {
            const weaveCopyPasteNodesPlugin =
              actInstance.getPlugin<WeaveCopyPasteNodesPlugin>(
                "copyPasteNodes"
              );
            if (weaveCopyPasteNodesPlugin) {
              return weaveCopyPasteNodesPlugin.paste();
            }
          },
        },
        {
          id: "div-1",
          type: "divider",
        },
        {
          id: "bring-to-front",
          type: "button",
          label: "Bring to front",
          icon: <BringToFront size={16} />,
          disabled: nodes.length !== 1,
          onClick: () => {
            actInstance.bringToFront(nodes[0].instance);
          },
        },
        {
          id: "move-up",
          type: "button",
          label: "Move up",
          icon: <ArrowUp size={16} />,
          disabled: nodes.length !== 1,
          onClick: () => {
            actInstance.moveUp(nodes[0].instance);
          },
        },
        {
          id: "move-down",
          type: "button",
          label: "Move down",
          icon: <ArrowDown size={16} />,
          disabled: nodes.length !== 1,
          onClick: () => {
            actInstance.moveDown(nodes[0].instance);
          },
        },
        {
          id: "send-to-back",
          type: "button",
          label: "Send to back",
          icon: <SendToBack size={16} />,
          disabled: nodes.length !== 1,
          onClick: () => {
            actInstance.sendToBack(nodes[0].instance);
          },
        },
        {
          id: "div-2",
          type: "divider",
        },
        {
          id: "group",
          type: "button",
          label: "Group",
          icon: <Group size={16} />,
          disabled: !canGroup,
          onClick: () => {
            actInstance.group(nodes.map((n) => n.node));
          },
        },
        {
          id: "ungroup",
          type: "button",
          label: "Ungroup",
          icon: <Ungroup size={16} />,
          disabled: !canUnGroup,
          onClick: () => {
            actInstance.unGroup(nodes[0].node);
          },
        },
        {
          id: "div-3",
          type: "divider",
        },
        {
          id: "delete",
          type: "button",
          label: "Delete",
          icon: <Trash size={16} />,
          onClick: () => {
            for (const node of nodes) {
              actInstance.removeNode(node.node);
            }
          },
        },
      ];
    },
    []
  );

  const onNodeMenu = React.useCallback(
    (
      actInstance: Weave,
      nodes: WeaveSelection[],
      point: { x: number; y: number }
    ) => {
      const canGroup = nodes.length > 1;
      const canUnGroup = nodes.length === 1 && nodes[0].node.type === "group";

      const weaveCopyPasteNodesPlugin =
        actInstance.getPlugin<WeaveCopyPasteNodesPlugin>("copyPasteNodes");

      const actIsActionActive =
        typeof actInstance.getActiveAction() !== "undefined";
      const actCanCopy = weaveCopyPasteNodesPlugin.canCopy();
      const actCanPaste = weaveCopyPasteNodesPlugin.canPaste();

      setContextMenuShow(true);
      setContextMenuPosition(point);

      const contextMenu = getContextMenu({
        actInstance,
        actIsActionActive,
        actCanCopy,
        actCanPaste,
        canUnGroup,
        nodes,
        canGroup,
      });
      setContextMenuOptions(contextMenu);
    },
    [
      getContextMenu,
      setContextMenuOptions,
      setContextMenuPosition,
      setContextMenuShow,
    ]
  );

  const contextMenu = React.useMemo(
    () =>
      new WeaveContextMenuPlugin(
        {
          xOffset: 10,
          yOffset: 10,
        },
        {
          onNodeMenu,
        }
      ),
    [onNodeMenu]
  );

  return { contextMenu };
}

export default useContextMenu;
