// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { TreeView, TreeDataItem } from "@/components/ui/tree-view";
import { WeaveSelection, WeaveStateElement } from "@inditextech/weave-types";
import React from "react";
import { useCollaborationRoom } from "@/store/store";
import { useWeave } from "@inditextech/weave-react";
import {
  Frame,
  Spline,
  Image,
  Square,
  Tag,
  Type,
  X,
  Trash,
  LockOpen,
  Lock,
  Circle,
  Hexagon,
  Star,
  MoveUpRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { Weave, WeaveNodesSelectionPlugin } from "@inditextech/weave-sdk";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarSelector } from "../sidebar-selector";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconsMap: Record<string, any> = {
  rectangle: Square,
  text: Type,
  image: Image,
  frame: Frame,
  "color-token": Tag,
  line: Spline,
  "regular-polygon": Hexagon,
  ellipse: Circle,
  star: Star,
  arrow: MoveUpRight,
};

function mapElementsToTree(
  instance: Weave,
  elements: WeaveStateElement[],
  selectedNodes: string[]
) {
  const elementsMapped = elements.map((element) => {
    return {
      id: element.key,
      icon: iconsMap[element.props.nodeType ?? "rectangle"],
      name: element.props.nodeName ? element.props.nodeName : element.key,
      status: [
        <div key="trash" className="px-1">
          <Trash stroke="transparent" size={16} strokeWidth={1} />
        </div>,
        <div key="visibility" className="bg-white px-1 rounded-none">
          <Eye
            stroke={
              typeof element.props.visible === "undefined" ||
              element.props.visible
                ? "transparent"
                : "black"
            }
            size={16}
            strokeWidth={1}
          />
        </div>,
        <div key="locked" className="bg-white px-1 rounded-none">
          <Lock
            stroke={element.props.locked ? "black" : "transparent"}
            size={16}
            strokeWidth={1}
          />
        </div>,
      ],
      actions: [
        <div
          key="remove"
          role="button"
          className="bg-white p-1 cursor-pointer hover:bg-zinc-950 hover:text-white rounded-none"
          onClick={(e) => {
            e.stopPropagation();
            const nodesSelectionPlugin =
              instance?.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
            if (instance && nodesSelectionPlugin) {
              instance.selectNodesByKey([element.key]);
              nodesSelectionPlugin.removeSelectedNodes();
            }
          }}
        >
          <Trash size={16} strokeWidth={1} />
        </div>,
        <div
          key="show-hidden"
          role="button"
          className="bg-white p-1 cursor-pointer hover:bg-zinc-950 hover:text-white rounded-none"
          onClick={(e) => {
            e.stopPropagation();
            if (!instance) return;

            const elementNode = instance.getStage().findOne(`#${element.key}`);

            if (!elementNode) return;

            const isVisible = instance.allNodesVisible([elementNode]);

            if (!isVisible) {
              instance.showNode(elementNode);
              return;
            }
            if (isVisible) {
              instance.hideNode(elementNode);
            }
          }}
        >
          {typeof element.props.visible === "undefined" ||
          element.props.visible ? (
            <EyeOff size={16} strokeWidth={1} />
          ) : (
            <Eye size={16} strokeWidth={1} />
          )}
        </div>,
        <div
          key="lock-unlock"
          role="button"
          className="bg-white p-1 cursor-pointer hover:bg-zinc-950 hover:text-white rounded-none"
          onClick={(e) => {
            e.stopPropagation();
            if (!instance) return;

            const elementNode = instance.getStage().findOne(`#${element.key}`);

            if (!elementNode) return;

            const isLocked = instance.allNodesLocked([elementNode]);

            if (!isLocked) {
              instance.lockNode(elementNode);
              return;
            }
            if (isLocked) {
              instance.unlockNode(elementNode);
            }
          }}
        >
          {element.props.locked ? (
            <LockOpen size={16} strokeWidth={1} />
          ) : (
            <Lock size={16} strokeWidth={1} />
          )}
        </div>,
      ],
      ...((element.props.children ?? []).length > 0 && {
        children: mapElementsToTree(
          instance,
          element.props.children ?? [],
          selectedNodes
        ),
      }),
    } as TreeDataItem;
  }) as TreeDataItem[];

  return elementsMapped;
}

export const ElementsTree = () => {
  const instance = useWeave((state) => state.instance);
  const initialSelectedNodes = useWeave((state) => state.selection.nodes);

  const sidebarLeftActive = useCollaborationRoom(
    (state) => state.sidebar.left.active
  );
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive
  );

  const [elementsTree, setElementsTree] = React.useState<WeaveStateElement[]>(
    []
  );
  const [selectedNodes, setSelectedNodes] = React.useState<string[]>(
    initialSelectedNodes
      .map((node) => node.node?.key)
      .filter((key) => typeof key !== "undefined")
  );

  React.useEffect(() => {
    function handleOnStateChange() {
      if (!instance) return [];

      const nodesTree = instance.getElementsTree();
      setElementsTree(nodesTree);
    }

    if (instance) {
      instance.addEventListener("onStateChange", handleOnStateChange);
      setElementsTree(instance.getElementsTree());
    }

    return () => {
      if (instance) {
        instance.removeEventListener("onStateChange", handleOnStateChange);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarLeftActive]);

  React.useEffect(() => {
    function handleOnNodesSelectedChange(nodes: WeaveSelection[]) {
      setSelectedNodes(
        nodes
          .map((node) => node.node?.key)
          .filter((key) => typeof key !== "undefined")
      );
    }

    if (instance) {
      instance.addEventListener("onNodesChange", handleOnNodesSelectedChange);
    }

    return () => {
      if (instance) {
        instance.removeEventListener(
          "onNodesChange",
          handleOnNodesSelectedChange
        );
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarLeftActive]);

  const treeData = React.useMemo<TreeDataItem[]>(() => {
    if (!instance) return [];

    return mapElementsToTree(instance, elementsTree, selectedNodes);
  }, [instance, elementsTree, selectedNodes]);

  if (!instance) {
    return null;
  }

  if (sidebarLeftActive !== SIDEBAR_ELEMENTS.nodesTree) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <div className="w-full px-[24px] py-[27px] bg-white flex justify-between items-center border-b border-[#c9c9c9]">
        <div className="flex justify-between font-inter font-light items-center text-[24px] uppercase">
          <SidebarSelector title="Elements Tree" />
        </div>
        <div className="flex justify-end items-center gap-1">
          <button
            className="cursor-pointer bg-transparent hover:bg-accent p-2"
            onClick={() => {
              setSidebarActive(null);
            }}
          >
            <X size={20} strokeWidth={1} />
          </button>
        </div>
      </div>
      <ScrollArea className="w-full h-[calc(100%-95px)]">
        <div className="flex flex-col gap-2 w-full h-full">
          {elementsTree.length === 0 && (
            <div className="col-span-2 w-full mt-[24px] flex flex-col justify-center items-center text-sm text-center font-inter font-light">
              <b className="font-normal text-[18px]">No elements created</b>
              <span className="text-[14px]">
                Add an element to the whiteboard
              </span>
            </div>
          )}
          {elementsTree.length > 0 && (
            <TreeView
              data={treeData}
              initialSelectedItems={selectedNodes}
              onSelectedItemsChange={(items: string[]) => {
                const stage = instance.getStage();

                const node = stage.findOne(`#${items[0]}`);
                if (node && !instance.allNodesLocked([node])) {
                  instance.selectNodesByKey(items);
                }
              }}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
